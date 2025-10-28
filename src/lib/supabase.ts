import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// If environment variables are not set (common when running without .env.local),
// avoid calling createClient at import-time because the library validates the
// URL and will throw — this prevents the whole app from crashing on import.
let supabase: SupabaseClient | any
if (supabaseUrl && supabaseAnonKey) {
	// Normal operation: create a real Supabase client
	supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
	// Dev fallback: export a minimal stub that provides the small surface area
	// the app expects (auth.getSession, auth.onAuthStateChange, and from()).
	// Each method returns a harmless default shape or an error-like object so
	// callers can continue to run without an immediate crash. This makes the
	// app usable for UI work even if Supabase keys aren't provided.
	const noop = async () => ({ data: null, error: new Error('Supabase not configured') })

	supabase = {
		auth: {
			getSession: async () => ({ data: { session: null } }),
			// onAuthStateChange usually returns { data, subscription }
			onAuthStateChange: (_cb: any) => ({ data: { session: null }, subscription: { unsubscribe: () => {} } }),
			signUp: noop,
			signInWithPassword: noop,
			signOut: noop,
			updateUser: noop,
		},
		from: (_: string) => ({
			upload: async () => ({ data: null, error: new Error('Supabase storage not configured') }),
			download: async () => ({ data: null, error: new Error('Supabase storage not configured') }),
			select: async () => ({ data: null, error: new Error('Supabase not configured') }),
			insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
			update: async () => ({ data: null, error: new Error('Supabase not configured') }),
			delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
		}),
		// Provide a generic rpc placeholder if used elsewhere
		rpc: async () => ({ data: null, error: new Error('Supabase not configured') }),
	}
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export { supabase }
