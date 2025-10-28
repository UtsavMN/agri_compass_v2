import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// v2-style simple export. Ensure you have .env.local with the VITE_SUPABASE_* values.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
