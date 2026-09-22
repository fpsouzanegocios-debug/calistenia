import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

const VAPID_PUBLIC_KEY = "BMDRNY6p5EnmPW0w4Ghx6zk6F_ieKk0FhbBE9tqJzWpjvG5NnqyXiH-YIVbc_caYydQAXpubdxnYzdvVNNTEwD0";
const VAPID_PRIVATE_KEY = "XjHP7Ks94xuf-SSEU5zBLC__C34adKCf6QRQ6uU7K-U";
const VAPID_SUBJECT = "mailto:idealconsumo@gmail.com";

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (vapidErr) {
  console.error("VAPID config error:", vapidErr);
}

// Modelos de mensagens em Espanhol adaptados para a Calistenia Asiática (Desafio 21 Dias)
const NOTIFICATION_TEMPLATES = {
  streak_saver: [
    {
      title: "¡Tu racha está en peligro! 🔥",
      message: (name: string, day: number) =>
        `No te vayas a dormir sin tu victoria, ${name}. Completa tu sesión del Día ${day} antes de medianoche.`
    },
    {
      title: "¡Solo quedan pocas horas! ⏰",
      message: (name: string, day: number) =>
        `15 minutos de calistenia hoy marcarán la diferencia. ¡Salva tu racha del Día ${day}!`
    },
    {
      title: "¿Vas a romper tu compromiso? 🔥",
      message: (name: string, day: number) =>
        `Tu constancia es tu mayor poder, ${name}. El Día ${day} te espera antes de terminar el día.`
    }
  ],
  morning: [
    {
      title: "¡Despierta tu cuerpo! 🌿",
      message: (name: string, day: number) =>
        `Buenos días, ${name}. 15 minutos de calistenia matutina activarán tu postura y metabolismo todo el día.`
    },
    {
      title: "Día {day} del Desafío ☀️",
      message: (name: string, day: number) =>
        `Empieza tu día con energía asiática, ${name}. Tu sesión del Día ${day} está lista.`
    }
  ],
  afternoon: [
    {
      title: "¿Cansancio de media tarde? ⚡",
      message: (name: string, day: number) =>
        `${name}, una sesión breve de calistenia oxigenará tu mente y renovará tu energía para el resto del día.`
    },
    {
      title: "Pausa activa del Día {day} 🥋",
      message: (name: string, day: number) =>
        `Tómate 15 minutos para cuidar tu cuerpo, ${name}. ¡El tatami de Calistenia te espera!`
    }
  ],
  inactivity: [
    {
      title: "Te extrañamos en el tatami... 🥋",
      message: (name: string, day: number) =>
        `${name}, tus músculos se adaptan rápido, ¡no dejes que se enfríen! Retoma el Día ${day} hoy mismo.`
    },
    {
      title: "Un tropiezo no es el final 🌿",
      message: (name: string, day: number) =>
        `15 minutos hoy es todo lo que necesitas para recuperar el ritmo, ${name}. ¡El Desafío sigue vivo!`
    }
  ]
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: any = {};
    if (req.method === "POST") {
      body = await req.json().catch(() => ({}));
    }

    const { trigger = "auto", test_user_id = null, force = false, dry_run = false } = body;

    // Determine current trigger mode if "auto"
    const currentUtcHour = new Date().getUTCHours();
    let effectiveTrigger = trigger;
    if (effectiveTrigger === "auto") {
      if (currentUtcHour >= 10 && currentUtcHour < 15) {
        effectiveTrigger = "morning";
      } else if (currentUtcHour >= 17 && currentUtcHour < 22) {
        effectiveTrigger = "afternoon";
      } else {
        effectiveTrigger = "streak_saver";
      }
    }

    // Query profiles to consider
    let profilesQuery = supabase
      .from("profiles")
      .select("id, user_id, name, email, is_pwa_installed, last_seen_at");

    if (test_user_id) {
      profilesQuery = profilesQuery.or(`user_id.eq.${test_user_id},id.eq.${test_user_id}`);
    }

    const { data: profiles, error: profError } = await profilesQuery;
    if (profError || !profiles) {
      throw new Error(profError?.message || "Error fetching profiles");
    }

    // Query workout progress for users
    const { data: allProgress } = await supabase
      .from("workout_progress")
      .select("user_id, day, completed, completed_at");

    // Query push subscriptions
    const { data: allSubscriptions } = await supabase
      .from("push_subscriptions")
      .select("*");

    const subsByUserId = new Map<string, any[]>();
    for (const sub of allSubscriptions || []) {
      const uid = sub.user_id;
      if (uid) {
        if (!subsByUserId.has(uid)) subsByUserId.set(uid, []);
        subsByUserId.get(uid)!.push(sub);
      }
    }

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const results: any[] = [];
    let sentCount = 0;
    let skippedTrained = 0;
    let skippedRecent = 0;

    const isExplicitTest = Boolean(test_user_id || force);

    for (const profile of profiles) {
      const uid = profile.user_id || profile.id;
      if (!uid) continue;

      const userProgress = (allProgress || []).filter((p: any) => p.user_id === uid);

      // 1. Check if trained today (bypass if explicit test)
      if (!isExplicitTest && effectiveTrigger !== "inactivity") {
        const trainedToday = userProgress.some((p: any) => {
          if (!p.completed || !p.completed_at) return false;
          return p.completed_at.startsWith(todayStr);
        });

        if (trainedToday) {
          skippedTrained++;
          results.push({ user_id: uid, email: profile.email, status: "skipped_trained_today" });
          continue;
        }
      }

      // 2. Find next pending day (1 to 21)
      let nextDay = 1;
      for (let d = 1; d <= 21; d++) {
        const isDone = userProgress.some((p: any) => p.day === d && p.completed);
        if (!isDone) {
          nextDay = d;
          break;
        }
      }

      // 3. Check anti-spam (bypass if explicit test)
      if (!isExplicitTest) {
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
        const { data: recentNotifs } = await supabase
          .from("notifications")
          .select("id, created_at")
          .eq("user_id", uid)
          .gte("created_at", fourHoursAgo);

        if (recentNotifs && recentNotifs.length > 0) {
          skippedRecent++;
          results.push({ user_id: uid, email: profile.email, status: "skipped_recent_notification" });
          continue;
        }
      }

      // 4. Select message template
      const templates = NOTIFICATION_TEMPLATES[effectiveTrigger as keyof typeof NOTIFICATION_TEMPLATES] || NOTIFICATION_TEMPLATES.streak_saver;
      const template = templates[Math.floor(Math.random() * templates.length)];

      const rawName = (profile.name || "Atleta").trim().split(" ")[0];
      const title = template.title.replace("{day}", nextDay.toString());
      const message = template.message(rawName, nextDay);
      const action_url = "/#/treinos";

      if (dry_run) {
        results.push({ user_id: uid, email: profile.email, title, message, status: "dry_run" });
        continue;
      }

      // 5. Insert notification record for in-app bell
      await supabase.from("notifications").insert({
        title,
        message,
        type: "workout",
        action_url,
        user_id: uid,
        sent_by: "Sensei Calistenia 🌿",
        read: false
      });

      // 6. Push to user's registered devices via Web Push
      const userSubs = subsByUserId.get(uid) || [];
      const pushPayload = JSON.stringify({
        title,
        body: message,
        message,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-72.png",
        url: action_url,
        action_url,
        tag: `calistenia-auto-${effectiveTrigger}-${Date.now()}`
      });

      let userPushed = 0;
      for (const sub of userSubs) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }, pushPayload);
          userPushed++;
        } catch (pushErr: any) {
          console.warn("[auto-notifications] Push failed for endpoint:", sub.endpoint, pushErr?.statusCode);
          if (pushErr?.statusCode === 404 || pushErr?.statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }

      sentCount++;
      results.push({
        user_id: uid,
        email: profile.email,
        title,
        message,
        devices_pushed: userPushed,
        status: userPushed > 0 ? "sent_push_and_app" : "sent_in_app_only"
      });
    }

    return new Response(JSON.stringify({
      success: true,
      trigger: effectiveTrigger,
      processed: profiles.length,
      sent: sentCount,
      skipped_already_trained: skippedTrained,
      skipped_recent: skippedRecent,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("[auto-notifications] Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
