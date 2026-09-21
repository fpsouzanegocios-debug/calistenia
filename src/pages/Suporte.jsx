import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Send, Bot, User, Leaf, AlertCircle, Sparkles, Key } from 'lucide-react';
import { getDeepSeekApiKey, streamDeepSeekChat } from '../services/deepseek';

const INITIAL_GREETING = "¡Hola! Soy la asistente virtual de Calistenia Asiática. 🌿 Estoy aquí para ayudarte con cualquier duda sobre entrenamientos, dieta, bienestar o la aplicación. ¡Puedes preguntarme lo que quieras! ¿Cómo puedo ayudarte hoy?";
const DAILY_LIMIT_MESSAGE = "Has alcanzado tu límite diario de mensajes.\n\nMañana podrás enviar mensajes nuevamente.";
const DAILY_LIMIT = 5;

const FREQUENT_QUESTIONS = [
  "¿Cómo acelerar la pérdida de peso?",
  "¿Puedo entrenar con dolor muscular?",
  "¿Cuántos litros de agua debo beber?",
  "¿Cómo mantener la motivación?"
];

// Helper to render bold text and linebreaks cleanly
function renderFormattedContent(text) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, lIdx) => {
    // Process **bold** within each line
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const formattedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    return (
      <React.Fragment key={lIdx}>
        {formattedParts}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export function Suporte({ onNavigate }) {
  const { state, user, session, addChatMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [hasDeepSeekKey, setHasDeepSeekKey] = useState(true);
  const messagesEndRef = useRef(null);

  const messages = state.chatHistory || [];
  const greetingAddedRef = useRef(false);

  // Filter messages to never render duplicate consecutive messages and migrate old greetings
  const displayMessages = React.useMemo(() => {
    const list = [];
    for (const msg of messages) {
      let content = msg.content || '';
      if (content.includes('assistente virtual da Calistenia') || content.includes('Sou a assistente')) {
        content = INITIAL_GREETING;
      }
      const prev = list[list.length - 1];
      if (!prev || !(prev.role === msg.role && prev.content?.trim() === content?.trim())) {
        list.push({ ...msg, content });
      }
    }
    return list;
  }, [messages]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, streamingContent, isTyping]);

  // Ensure initial greeting is sent strictly ONCE if chat history is empty
  useEffect(() => {
    if (displayMessages.length === 0 && !greetingAddedRef.current) {
      greetingAddedRef.current = true;
      addChatMessage('assistant', INITIAL_GREETING);
    }
  }, [displayMessages.length, addChatMessage]);

  // Load daily message usage and active conversation from Supabase
  useEffect(() => {
    let isCancelled = false;
    async function loadUserStats() {
      if (!user?.id) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('chat_messages_today, last_chat_date')
          .eq('user_id', user.id)
          .single();

        if (isCancelled) return;

        const today = new Date().toISOString().split('T')[0];
        if (profile?.last_chat_date === today) {
          setMessagesUsed(profile.chat_messages_today || 0);
        } else {
          setMessagesUsed(0);
        }

        const { data: convs } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (isCancelled) return;

        if (convs && convs.length > 0) {
          setActiveConversationId(convs[0].id);
        }
      } catch (err) {
        console.warn('Could not load chat stats from db:', err);
      }
    }

    loadUserStats();
    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    if (messagesUsed >= DAILY_LIMIT) {
      addChatMessage('assistant', DAILY_LIMIT_MESSAGE);
      return;
    }

    // Add user message to UI immediately
    addChatMessage('user', text);
    setInputText('');
    setIsTyping(true);
    setStreamingContent('');

    // Build conversation payload
    const historyPayload = [
      ...displayMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text }
    ];

    try {
      // 1. Direct DeepSeek Streaming if API key is configured
      const deepseekKey = await getDeepSeekApiKey();

      if (deepseekKey) {
        let accumulated = '';
        await streamDeepSeekChat({
          apiKey: deepseekKey,
          messages: historyPayload,
          userProfile: {
            ...state.userProfile,
            completedDays: Object.values(state.progress || {}).filter(p => p?.completed).length
          },
          onChunk: (_delta, fullText) => {
            accumulated = fullText;
            setStreamingContent(fullText);
          },
          onComplete: async (fullText) => {
            addChatMessage('assistant', fullText);
            setStreamingContent('');

            const newCount = Math.min(DAILY_LIMIT, (messagesUsed || 0) + 1);
            setMessagesUsed(newCount);

            if (user?.id) {
              try {
                const today = new Date().toISOString().split('T')[0];
                await supabase.from('profiles').update({
                  chat_messages_today: newCount,
                  last_chat_date: today
                }).eq('user_id', user.id);

                if (activeConversationId) {
                  await supabase.from('messages').insert([
                    { user_id: user.id, conversation_id: activeConversationId, role: 'user', content: text },
                    { user_id: user.id, conversation_id: activeConversationId, role: 'assistant', content: fullText }
                  ]);
                }
              } catch (saveErr) {
                console.warn('Error persisting messages:', saveErr);
              }
            }
          }
        });
        setIsTyping(false);
        return;
      }

      // 2. Fallback to Supabase Edge Function
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://mkfkwfheiaiqabackfed.supabase.co'}/functions/v1/chat-support`;
      const currentToken = session?.access_token || (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
        },
        body: JSON.stringify({
          messages: historyPayload,
          conversation_id: activeConversationId
        })
      });

      // Check daily limit error
      if (response.status === 429) {
        setMessagesUsed(DAILY_LIMIT);
        addChatMessage('assistant', DAILY_LIMIT_MESSAGE);
        setIsTyping(false);
        setStreamingContent('');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'O chat está temporariamente indisponível.');
      }

      // Update used messages count from response header if provided
      const usedHeader = response.headers.get('X-Messages-Used');
      if (usedHeader) {
        setMessagesUsed(parseInt(usedHeader, 10));
      } else {
        setMessagesUsed(prev => Math.min(DAILY_LIMIT, prev + 1));
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  accumulated += delta;
                  setStreamingContent(accumulated);
                }
              } catch {
                // Ignore parse errors on partial frames
              }
            }
          }
        }
      }

      // Commit finalized message to chat history
      const finalReply = accumulated || "¡Siempre estoy aquí para apoyarte en cada etapa de tu camino! 🌿💪";
      addChatMessage('assistant', finalReply);
      setStreamingContent('');

    } catch (err) {
      console.error('Chat error:', err);
      addChatMessage('assistant', 'El chat no está disponible temporalmente. Verifica tu conexión e intenta de nuevo en unos momentos.');
      setStreamingContent('');
    } finally {
      setIsTyping(false);
    }
  };

  const messagesRemaining = Math.max(0, DAILY_LIMIT - messagesUsed);
  const isLimitReached = messagesRemaining <= 0;

  return (
    <main className="min-h-screen select-none bg-[#FAFAFA]">
      {/* Truly Fixed Header (Soporte 24h + Plan Lite) */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#FAFAFA]/98 backdrop-blur-sm border-b border-[#E9E2E4]/40">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          <header className="mb-3">
            <h1 className="text-[24px] font-bold tracking-tight text-[#301D23]">Soporte 24h</h1>
            <p className="text-[13px] text-[#84626D] mt-0.5">Resuelve tus dudas con la IA de Calistenia Asiática</p>
          </header>

          {/* Plan Lite Banner */}
          <div
            className="flex items-center justify-between border shadow-sm"
            style={{
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              padding: '13px 20px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Leaf className="w-4 h-4 text-[#CB4D6D]" strokeWidth={2} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#301D23' }}>
                Plan Lite
              </span>
            </div>
            {isLimitReached ? (
              <div className="flex items-center gap-1.5 text-[#D3455B]">
                <AlertCircle className="h-4 w-4" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Límite diario alcanzado</span>
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: '#84626D', fontWeight: 400 }}>
                {messagesRemaining}/5 mensajes restantes hoy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="max-w-lg mx-auto px-4 space-y-6"
        style={{ paddingTop: '154px', paddingBottom: '144px' }}
      >
        {/* Suggested questions from original app (visible at start) */}
        {messages.length <= 1 && !isLimitReached && (
          <div className="animate-fade-in mb-2">
            <p className="text-[12.5px] font-medium text-[#84626D] mb-2.5">
              Preguntas frecuentes:
            </p>
            <div className="flex flex-wrap gap-2">
              {FREQUENT_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-[#E9E2E4] text-[#301D23] text-xs font-medium hover:border-[#CB4D6D] hover:text-[#CB4D6D] transition-colors shadow-xs cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayMessages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse justify-start' : 'flex-row justify-start'} animate-fade-in`}
            >
              <div
                className="flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5"
                style={{
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  borderRadius: '9999px',
                  backgroundColor: '#CB4D6D'
                }}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                style={
                  isUser
                    ? {
                        maxWidth: '78%',
                        padding: '12px 20px',
                        borderRadius: '24px',
                        backgroundColor: '#CB4D6D',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 500,
                        lineHeight: 1.5,
                        boxShadow: '0 2px 8px -1px rgba(203,77,109,0.35)'
                      }
                    : {
                        maxWidth: '82%',
                        padding: '16px 20px',
                        borderRadius: '24px',
                        backgroundColor: '#FFFFFF',
                        color: '#301D23',
                        border: '1px solid #E9E2E4',
                        fontSize: '13.5px',
                        lineHeight: 1.6,
                        boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
                      }
                }
              >
                {renderFormattedContent(msg.content)}
              </div>
            </div>
          );
        })}

        {/* Live SSE Streaming message */}
        {isTyping && streamingContent && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div
              className="flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5"
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '9999px',
                backgroundColor: '#CB4D6D'
              }}
            >
              <Bot className="h-4 w-4" />
            </div>
            <div
              style={{
                maxWidth: '82%',
                padding: '16px 20px',
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                color: '#301D23',
                border: '1px solid #E9E2E4',
                fontSize: '13.5px',
                lineHeight: 1.6,
                boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
              }}
            >
              {renderFormattedContent(streamingContent)}
            </div>
          </div>
        )}

        {/* Typing indicator dots */}
        {isTyping && !streamingContent && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div
              className="flex items-center justify-center flex-shrink-0 text-white shadow-sm"
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '9999px',
                backgroundColor: '#CB4D6D'
              }}
            >
              <Bot className="h-4 w-4" />
            </div>
            <div
              className="flex items-center gap-1.5 shadow-sm"
              style={{
                padding: '14px 20px',
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E9E2E4'
              }}
            >
              <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: '#CB4D6D' }}></div>
              <div className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: '#CB4D6D' }}></div>
              <div className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: '#CB4D6D' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input bar docked above BottomNav */}
      <div
        className="fixed left-0 right-0 z-30 bg-[#FAFAFA]/98 backdrop-blur-sm"
        style={{ bottom: '70px' }}
      >
        <div className="max-w-lg mx-auto px-4 py-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <div
              className="flex-1 bg-white border px-4 shadow-sm flex items-center"
              style={{
                height: '46px',
                borderRadius: '9999px',
                borderColor: isLimitReached ? '#FAD8DF' : '#E9E2E4',
                backgroundColor: isLimitReached ? '#FFF5F7' : '#FFFFFF'
              }}
            >
              <input
                type="text"
                placeholder={isLimitReached ? "Límite diario alcanzado" : "Escribe tu duda..."}
                value={inputText}
                disabled={isLimitReached || isTyping}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-transparent text-[13.5px] outline-none disabled:opacity-70"
                style={{ color: '#301D23' }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping || isLimitReached}
              className="flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0 shadow-sm cursor-pointer"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '9999px',
                backgroundColor: '#CB4D6D',
                color: '#FFFFFF'
              }}
            >
              <Send className="h-4 w-4 transform translate-x-[-1px] translate-y-[1px]" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
