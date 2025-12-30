import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
// Try to load from Root .env if not already loaded, though index.ts usually does this.
// We'll trust that process.env is populated or load it just in case.
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.warn('WARNING: SUPABASE_URL is missing.');
}

// 1. Service Role Client (for Admin tasks like inviting users, deleting users)
// WARNING: Bypasses RLS. Use with caution.
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// 2. Standard Client (for operations like token verification if we prefer separation)
// In many backend cases, Admin client is used for everything, but for auth.getUser(token), 
// it's cleaner to use a client configured for that or just use Admin.
// We will export a generic client using Anon key just in case we want to Simulate standard access.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
