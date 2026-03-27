import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useClerk, useSession } from '@clerk/clerk-react';

export interface Profile {
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
  user: any | null; // Using any temporarily while we transition away from Supabase User type
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>({
    id: 'dev-user-id',
    username: 'Developer',
    full_name: 'Local Developer',
    phone: null,
    location: null,
    language_preference: 'en',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  const signUp = async () => {};
  const signIn = async () => {};
  const signOut = async () => {};
  const updateProfile = async () => {};

  const user = {
    id: 'dev-user-id',
    email: 'dev@local.host',
    metadata: {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: {},
        loading: false,
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
