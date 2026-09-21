import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mkfkwfheiaiqabackfed.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZmt3ZmhlaWFpcWFiYWNrZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjcxMjgsImV4cCI6MjEwNTI0MzEyOH0.zlwlbgt_zjcn2cd5czKicMY5soze5uSXrjFf8wZkCpo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
