import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const DAILY_LIMIT = 5;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida ou expirada" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = user.id;
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch user profile and chat usage
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    let chatMessagesToday = profile?.chat_messages_today || 0;
    const lastChatDate = profile?.last_chat_date;

    if (lastChatDate !== today) {
      chatMessagesToday = 0;
    }

    if (chatMessagesToday >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        limitReached: true, 
        error: "limite_diario",
        message: "Você atingiu seu limite diário de mensagens.\nAmanhã você poderá enviar mensagens novamente." 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Fetch user's diet plan and workouts context
    const { data: dietPlan } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: workoutProgress } = await supabase
      .from("workout_progress")
      .select("*")
      .eq("user_id", userId);

    const completedDays = workoutProgress?.filter((p: any) => p.completed)?.length || 0;

    // Parse body
    const { messages = [], conversation_id } = await req.json();

    // 3. Increment usage
    const newCount = chatMessagesToday + 1;
    await supabase
      .from("profiles")
      .update({
        chat_messages_today: newCount,
        last_chat_date: today
      })
      .eq("user_id", userId);

    // 4. Build Dynamic System Persona Prompt
    const userName = profile?.name || user.user_metadata?.name || "Atleta";
    const userAge = profile?.age || user.user_metadata?.age || "Não informado";
    const userHeight = profile?.height || user.user_metadata?.height || "Não informado";
    const currentWeight = profile?.current_weight || user.user_metadata?.current_weight || "Não informado";
    const targetWeight = profile?.target_weight || user.user_metadata?.target_weight || "Não informado";
    const userGoal = profile?.goal || user.user_metadata?.goal || "Emagrecimento e definição";
    const userLevel = profile?.level || user.user_metadata?.level || "Iniciante";
    const targetDays = profile?.target_days || user.user_metadata?.target_days || 21;

    let dietaryInfo = "Sem restrições cadastradas";
    if (dietPlan?.restrictions && dietPlan.restrictions.length > 0) {
      dietaryInfo = `Restrições: ${dietPlan.restrictions.join(", ")}`;
    }
    if (dietPlan?.preferences && dietPlan.preferences.length > 0) {
      dietaryInfo += ` | Alimentos preferidos: ${dietPlan.preferences.join(", ")}`;
    }
    if (dietPlan?.total_calories) {
      dietaryInfo += ` | Meta calórica: ${dietPlan.total_calories} kcal/dia`;
    }

    const systemPrompt = `Você é a assistente virtual da Calistenia Asiática 🌿, a inteligência artificial oficial do aplicativo "Calistenia Asiática".
Seu objetivo é apoiar a atleta em sua jornada de treinos de calistenia, alimentação saudável, hábitos diários e bem-estar físico e mental.

DADOS REAIS DA ATLETA (USE PARA PERSONALIZAR SUAS RESPOSTAS):
- Nome: ${userName}
- Idade: ${userAge} anos
- Altura: ${userHeight} cm
- Peso Atual: ${currentWeight} kg
- Meta de Peso: ${targetWeight} kg
- Objetivo: ${userGoal}
- Nível de Treino: ${userLevel}
- Prazo do Programa: ${targetDays} dias
- Dias de Treino Concluídos: ${completedDays} de 21 dias
- Plano Alimentar / Dieta: ${dietaryInfo}

DIRETRIZES DE COMPORTAMENTO E TOM DE VOZ (IDÊNTICO AO APP ORIGINAL):
1. Tom acolhedor, positivo, empático e motivador. Trate a usuária pelo nome (${userName}) com carinho e entusiasmo.
2. Seja inteligente, empática e direta. Se a atleta disser que está cansada ou perguntar sobre seu próprio nome/dados, responda com atenção e personalidade real, NUNCA dê respostas prontas robóticas!
3. Use tópicos com emojis numerados (1️⃣, 2️⃣, 3️⃣) ou marcadores quando sugerir refeições ou passos de treino.
4. Use negrito em palavras-chave importantes (ex: **21 Dias de Transformação**, **Proteína:**).
5. Emojis pontuais e agradáveis: 🌿, 😊, 🍽️, 💪, 🚀, 🌟, 🎯.
6. Sempre mencione ações e recursos do aplicativo Calistenia Asiática (como o Programa de 21 Dias, a aba Dieta para substituir alimentos ou ver receitas, o Guia de Alongamento na aba Bônus, etc.).`;

    // 5. Check for DeepSeek API Key, or OpenAI Key
    let deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    // Also look up DeepSeek key in app_settings table
    if (!deepseekKey) {
      try {
        const { data: dbSetting } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "deepseek_api_key")
          .maybeSingle();
        if (dbSetting?.value && dbSetting.value.trim().length > 5) {
          deepseekKey = dbSetting.value.trim();
        }
      } catch (err) {
        console.warn("Could not read app_settings:", err);
      }
    }

    // Manage conversation in database
    let activeConvId = conversation_id;
    if (!activeConvId) {
      const { data: conv } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title: "Conversa com IA Atlas" })
        .select()
        .single();
      activeConvId = conv?.id;
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    if (activeConvId && lastUserMessage) {
      await supabase.from("messages").insert({
        user_id: userId,
        conversation_id: activeConvId,
        role: "user",
        content: lastUserMessage
      });
    }

    // Priority 1: Call DeepSeek API
    if (deepseekKey) {
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ];

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: apiMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("DeepSeek API error:", errText);
        throw new Error("Erro na API DeepSeek");
      }

      const reader = response.body?.getReader();
      let completeResponse = "";

      const stream = new ReadableStream({
        async start(controller) {
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(value);

            // Extract text to save to db
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  const delta = parsed.choices?.[0]?.delta?.content || "";
                  completeResponse += delta;
                } catch {}
              }
            }
          }

          if (activeConvId && completeResponse) {
            await supabase.from("messages").insert({
              user_id: userId,
              conversation_id: activeConvId,
              role: "assistant",
              content: completeResponse
            });
          }

          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Messages-Used": newCount.toString()
        }
      });
    }

    // Priority 2: Call OpenAI if key is present
    if (openAiKey) {
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: apiMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("OpenAI API error:", errText);
        throw new Error("Erro na API de IA");
      }

      const reader = response.body?.getReader();
      let completeResponse = "";

      const stream = new ReadableStream({
        async start(controller) {
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(value);

            // Extract text to save to db
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  const delta = parsed.choices?.[0]?.delta?.content || "";
                  completeResponse += delta;
                } catch {}
              }
            }
          }

          if (activeConvId && completeResponse) {
            await supabase.from("messages").insert({
              user_id: userId,
              conversation_id: activeConvId,
              role: "assistant",
              content: completeResponse
            });
          }

          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Messages-Used": newCount.toString()
        }
      });
    }

    // Fallback: Smart Persona Streaming Engine
    const fallbackAnswer = generateAtlasResponse(lastUserMessage, {
      userName,
      userGoal,
      currentWeight,
      targetWeight,
      dietaryInfo,
      completedDays
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = fallbackAnswer.split(" ");
        for (let i = 0; i < words.length; i++) {
          const piece = words[i] + (i === words.length - 1 ? "" : " ");
          const sseEvent = `data: ${JSON.stringify({
            choices: [{ delta: { content: piece } }]
          })}\n\n`;
          controller.enqueue(encoder.encode(sseEvent));
          await new Promise((r) => setTimeout(r, 25));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));

        if (activeConvId && fallbackAnswer) {
          await supabase.from("messages").insert({
            user_id: userId,
            conversation_id: activeConvId,
            role: "assistant",
            content: fallbackAnswer
          });
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Messages-Used": newCount.toString()
      }
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "O chat está temporariamente indisponível. Tente novamente em alguns instantes." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

function generateAtlasResponse(query: string, ctx: any) {
  const q = query.toLowerCase();

  if (q.includes("cansad") || q.includes("exaust") || q.includes("fadiga") || q.includes("sem energia")) {
    return `Oi, ${ctx.userName}! 🌿 É completamente normal e válido sentir cansaço. O descanso não é perda de tempo: na calistenia, é exatamente durante o repouso e o sono que suas fibras musculares se regeneram e seu metabolismo se equilibra.\n\nSe o cansaço for intenso hoje, faça um **descanso ativo**: beba água, faça uma refeição leve rica em proteínas e durma bem. Se ainda quiser se movimentar, faça apenas 5 minutinhos de respiração e mobilidade leve na aba Bônus. Respeite seu corpo, amanhã você voltará mais forte! 💪😊`;
  }

  if (q.includes("meu nome") || q.includes("quem sou eu")) {
    return `Você é ${ctx.userName}! 😊 Atualmente está focada no objetivo de **${ctx.userGoal}** no Calistenia Asiática. Estou sempre aqui para te acompanhar nessa jornada! 🌟`;
  }

  if (q.includes("o que posso comer") || q.includes("sugestão de refeição") || q.includes("o que comer")) {
    return `Claro, ${ctx.userName}! Que tal um dia com refeições balanceadas e saborosas alinhadas ao seu objetivo de ${ctx.userGoal}:\n\n1️⃣ Café da manhã: omelete com 2 ovos, espinafre e tomate + 1 fatia de pão integral + 1 fruta (banana ou maçã).\n2️⃣ Almoço: peito de frango grelhado, quinoa ou arroz integral, brócolis no vapor e salada verde com azeite extravirgem.\n3️⃣ Lanche da tarde: iogurte natural + mix de castanhas (amêndoas, nozes) e uma porção de frutas vermelhas.\n4️⃣ Jantar: filé de peixe (salmão ou tilápia) assado, batata-doce cozida e legumes grelhados.\n5️⃣ Ceia (se sentir fome): cottage ou queijo branco com pepino.\n\nLembre-se de beber de 2 a 3L de água ao longo do dia! No app, na aba Dieta, você pode conferir seu plano completo de refeições. 🍽️💪`;
  }

  if (q.includes("qual treino") || q.includes("que treino") || q.includes("treinar")) {
    return `Oi, ${ctx.userName}! 😊 Para hoje, recomendo seguir o nosso programa **“21 Dias de Transformação”**, com foco na calistenia fluida e baixo impacto:\n\n1️⃣ Aquecimento leve (5 min) – polichinelos leque, círculos de braço e mobilidade articular.\n2️⃣ Circuito do Dia ${ctx.completedDays + 1} – prancha lótus, agachamento templo e torções suaves de tronco.\n3️⃣ Finalização – 10 min de respiração profunda ou alongamento da aba Bônus para relaxar.\n\nLembre-se de manter o ritmo confortável e sem pressa. A constância supera a intensidade! 🚀`;
  }

  return `Oi, ${ctx.userName}! 🌿 Na calistenia e na nutrição saudável, o segredo dos resultados duradouros está na constância diária e no respeito ao ritmo do seu corpo. Como posso te apoiar hoje com seus treinos, alimentação ou recuperação? Conte comigo! 💪✨`;
}
