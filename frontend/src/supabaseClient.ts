import { createClient } from '@supabase/supabase-js';

// Access env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn but don't crash immediately, allow user to set them later
  console.warn('Missing Supabase Environment Variables. Login will fail.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
