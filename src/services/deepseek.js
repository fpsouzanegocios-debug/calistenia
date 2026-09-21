import { supabase } from '../lib/supabase';

// Model to use
const DEEPSEEK_MODEL = 'deepseek-chat';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

/**
 * Get DeepSeek API Key with cascading fallbacks:
 * 1. Database (public.app_settings)
 * 2. Environment variable (VITE_DEEPSEEK_API_KEY)
 * 3. LocalStorage fallback
 */
export async function getDeepSeekApiKey() {
  try {
    // 1. Check database app_settings
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'deepseek_api_key')
      .maybeSingle();

    if (data?.value && data.value.trim().length > 5) {
      return data.value.trim();
    }
  } catch (err) {
    console.warn('Could not read deepseek key from app_settings:', err);
  }

  // 2. Check environment variable
  const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }

  // 3. Check localStorage
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('calistenia_deepseek_api_key');
    if (localKey && localKey.trim().length > 5) {
      return localKey.trim();
    }
  }

  return null;
}

/**
 * Save DeepSeek API Key to database and localStorage
 */
export async function saveDeepSeekApiKey(key) {
  const cleanKey = (key || '').trim();

  // Save to localStorage immediately
  if (typeof window !== 'undefined') {
    if (cleanKey) {
      localStorage.setItem('calistenia_deepseek_api_key', cleanKey);
    } else {
      localStorage.removeItem('calistenia_deepseek_api_key');
    }
  }

  // Save to database app_settings
  try {
    if (cleanKey) {
      await supabase
        .from('app_settings')
        .upsert({
          key: 'deepseek_api_key',
          value: cleanKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    } else {
      await supabase
        .from('app_settings')
        .delete()
        .eq('key', 'deepseek_api_key');
    }
    return { success: true };
  } catch (err) {
    console.error('Error saving deepseek key to database:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Test DeepSeek API Key connection
 */
export async function testDeepSeekConnection(apiKey) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'user', content: 'Responda apenas: OK' }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${response.status}: Falha ao validar chave.`);
    }

    const json = await response.json();
    return { success: true, message: json.choices?.[0]?.message?.content || 'OK' };
  } catch (err) {
    return { success: false, error: err.message || 'Não foi possível conectar à DeepSeek.' };
  }
}

/**
 * Build System Persona Prompt for Calistenia Asiática
 */
export function buildAtlasSystemPrompt(userProfile = {}) {
  const userName = userProfile.name || 'Atleta';
  const userAge = userProfile.age ? `${userProfile.age} años` : 'No informado';
  const userHeight = userProfile.height ? `${userProfile.height} cm` : 'No informado';
  const currentWeight = userProfile.currentWeight ? `${userProfile.currentWeight} kg` : 'No informado';
  const targetWeight = userProfile.targetWeight ? `${userProfile.targetWeight} kg` : 'No informado';
  const userGoal = userProfile.goal || 'Pérdida de peso y definición con calistenia';
  const userLevel = userProfile.level || 'Principiante';
  const targetDays = userProfile.targetDays || 21;
  const completedDays = userProfile.completedDays || 0;

  let dietaryInfo = 'Sin restricciones registradas';
  if (userProfile.dietaryRestrictions && userProfile.dietaryRestrictions.length > 0) {
    dietaryInfo = `Restricciones: ${userProfile.dietaryRestrictions.join(', ')}`;
  }
  if (userProfile.foodPreferences && userProfile.foodPreferences.length > 0) {
    dietaryInfo += ` | Alimentos preferidos: ${userProfile.foodPreferences.join(', ')}`;
  }

  return `Eres la asistente oficial de la aplicación "Calistenia Asiática" y hablas en español.
Tu objetivo es guiar y apoyar a la atleta en su camino de entrenamientos de calistenia fluida, alimentación saludable, déficit calórico consciente, recuperación física y mental, y hábitos diarios.

DATOS REALES DE LA ATLETA (UTILÍZALOS PARA PERSONALIZAR TUS RESPUESTAS):
- Nombre de la atleta: ${userName}
- Edad: ${userAge}
- Altura: ${userHeight}
- Peso Actual: ${currentWeight}
- Meta de Peso: ${targetWeight}
- Objetivo: ${userGoal}
- Nivel de Entrenamiento: ${userLevel}
- Duración del Programa: ${targetDays} días
- Días de Entrenamiento Completados: ${completedDays} de 21 días
- Plan Nutricional / Dieta: ${dietaryInfo}

PAUTAS DE RESPUESTA Y COMPORTAMIENTO:
1. Responde SIEMPRE en español con un tono cálido, empático, profesional y motivador.
2. Trata a la atleta por su nombre (${userName}) con cercanía y entusiasmo.
3. Si manifiesta cansancio, dolor o desmotivación, valida sus emociones con calidez, explica el papel del descanso en la calistenia y sugiere pasos prácticos de recuperación activa (sueño, hidratación, estiramiento suave).
4. Si pregunta "¿cuál es mi nombre?" o sobre su perfil, responde con amabilidad mencionando su nombre (${userName}) y sus datos.
5. Sé concisa y dinámica. Responde en párrafos claros y usa viñetas cuando recomiendes recetas o pasos de entrenamiento.
6. Utiliza negrita en puntos clave (**consejo clave**, **descanso activo**).
7. Usa emojis oportunos: 🌿, 😊, 🍽️, 💪, 🚀, 🌟, 🎯.
8. Basa siempre tus orientaciones en la ciencia de la calistenia y la nutrición deportiva segura.`;
}

/**
 * Stream chat completion from DeepSeek
 */
export async function streamDeepSeekChat({
  apiKey,
  messages,
  userProfile,
  onChunk,
  onComplete,
  onError
}) {
  try {
    const systemPrompt = buildAtlasSystemPrompt(userProfile);

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedMsg = `Erro ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        parsedMsg = errJson.error?.message || parsedMsg;
      } catch {}
      throw new Error(parsedMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') break;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              if (onChunk) onChunk(delta, fullText);
            }
          } catch (e) {
            // Partial JSON or unparseable SSE chunk
          }
        }
      }
    }

    if (onComplete) onComplete(fullText);
    return fullText;
  } catch (err) {
    console.error('DeepSeek Stream Error:', err);
    if (onError) onError(err);
    throw err;
  }
}
