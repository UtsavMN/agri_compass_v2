import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  language_preference: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to read session in a v2-compatible way and fall back if needed
    (async () => {
      try {
        // supabase.auth.getSession() returns { data: { session }, error } in v2
        const maybe = await (supabase.auth as any).getSession?.()
        if (maybe && maybe.data) {
          const { session } = maybe.data
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            await loadProfile(session.user.id)
          } else {
            setLoading(false)
          }
        } else {
          // fallback for older SDKs or unexpected shapes
          const fallback = (supabase.auth as any).session?.()
          const s = fallback?.user ? fallback : null
          setSession(s)
          setUser(s?.user ?? null)
          if (s?.user) {
            await loadProfile(s.user.id)
          } else {
            setLoading(false)
          }
        }
      } catch (err) {
        console.warn('Could not get session from supabase client', err)
        setLoading(false)
      }
    })()

    // Subscribe to auth state changes. v2 returns { data: { subscription } }
    const sub = (supabase.auth as any).onAuthStateChange?.((_event: any, session: any) => {
      (async () => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      })()
    })

    // If v2 shape, sub.data.subscription exists
    try {
      if (sub && sub.data && sub.data.subscription) {
        return () => sub.data.subscription.unsubscribe()
      }
    } catch (e) {
      // otherwise try to unsubscribe if function returned
      if (sub && typeof sub === 'function') return sub
    }
    return () => {}
  }, []);

  const loadProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      // Supabase is not configured in this environment (dev). Avoid calling the
      // client which returns stub errors; just clear loading and return early.
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local and restart the dev server.'
      )
    }
    // Basic client-side email validation to provide a clearer error message
    // before calling the Supabase API. This avoids confusing server messages
    // and catches obvious formatting mistakes early.
    const emailPattern = /\S+@\S+\.\S+/;
    if (!email || !emailPattern.test(email)) {
      throw new Error('Invalid email address');
    }
    // Create the user via Supabase Auth. We intentionally do NOT insert a
    // profile here: the database migration already creates a trigger
    // (on `auth.users`) which will insert a corresponding row into
    // `public.profiles` server-side. Trying to insert a profile from the
    // client during sign-up can fail because the user is not yet
    // authenticated (anonymous/anon role) and Row Level Security blocks
    // the insert. Letting the DB trigger handle profile creation avoids
    // races and RLS violations.
  const normalizedEmail = email.trim();
  const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });

    if (error) throw error;

    // If the SDK returns a session/user immediately, optionally load the
    // profile. In many Supabase setups signUp requires email confirmation
    // and the user won't be signed in right away.
    if (data?.user?.id) {
      try {
        await loadProfile(data.user.id);
      } catch (e) {
        // Non-fatal: profile may be created asynchronously by the trigger.
        console.warn('Profile load after signUp failed (expected in some flows):', e);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local and restart the dev server.'
      )
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;

    await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
