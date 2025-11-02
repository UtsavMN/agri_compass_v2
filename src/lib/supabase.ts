// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function validateUrl(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

if (!validateUrl(SUPABASE_URL)) {
  // Emphasize clear error in console — this prevents the cryptic client creation error
  // and helps you fix .env.local quickly.
  console.error(
    'Supabase initialization error: VITE_SUPABASE_URL is missing or invalid.',
    'Current value:',
    SUPABASE_URL
  );
  // Do not throw at import time — a thrown error here will crash the whole app
  // when env vars are not set (common in local dev). Instead, log and continue.
  // Downstream code should check `isSupabaseConfigured` before calling network APIs.
}

if (!SUPABASE_ANON_KEY) {
  console.error('Supabase initialization error: VITE_SUPABASE_ANON_KEY is missing.');
  // Don't throw here for the same reason as above.
}

export const isSupabaseConfigured = validateUrl(SUPABASE_URL) && !!SUPABASE_ANON_KEY;

// Create the client even if env values are missing to avoid import-time crashes.
// Calls will still fail at runtime if the key/url are invalid; components should
// handle errors from the client gracefully.
export const supabase: SupabaseClient = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '');

export default supabase;
