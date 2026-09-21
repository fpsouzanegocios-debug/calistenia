/**
 * Configuração e inicialização do cliente Supabase para o Calistenia App
 * Projeto: calistenia app (mkfkwfheiaiqabackfed)
 */

export const SUPABASE_CONFIG = {
  url: "https://mkfkwfheiaiqabackfed.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZmt3ZmhlaWFpcWFiYWNrZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjcxMjgsImV4cCI6MjEwNTI0MzEyOH0.zlwlbgt_zjcn2cd5czKicMY5soze5uSXrjFf8wZkCpo",
  publishableKey: "sb_publishable_j1CGa_j9SYqbtOs2dXBVPA_oXC7muJa"
};

/**
 * Cria o cliente Supabase utilizando a biblioteca global (via CDN window.supabase)
 * ou via import de pacote npm (@supabase/supabase-js).
 */
export function getSupabaseClient() {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }
  return null;
}
