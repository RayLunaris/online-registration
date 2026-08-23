import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AdminProfile } from '@/types/spmb';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAdminProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setAdminProfile(data as AdminProfile);
      }
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAdminProfile(session.user.id);
      } else {
        setAdminProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Mock login for demo if Supabase credentials are not yet set
      const mockUser = {
        id: 'mock-admin-id',
        email,
        app_metadata: {},
        user_metadata: { full_name: 'Administrator Demo' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockProfile: AdminProfile = {
        id: 'mock-profile-id',
        user_id: 'mock-admin-id',
        full_name: 'Administrator Demo',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(mockUser);
      setAdminProfile(mockProfile);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setAdminProfile(null);
  };

  const isAdmin = Boolean(adminProfile || user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        adminProfile,
        isAdmin,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
