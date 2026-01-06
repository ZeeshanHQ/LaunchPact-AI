import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase credentials missing. Check .env file.');
} else {
    console.log('Supabase Config Loaded:', {
        url: supabaseUrl,
        keyLength: supabaseAnonKey?.length,
        keyStart: supabaseAnonKey?.substring(0, 5) + '...'
    });
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
