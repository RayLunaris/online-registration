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

  const fetchAdminProfile = async (userId: string, currentUser?: User | null) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Detect 401 Unauthorized or expired/invalid JWT token
        const isUnauthorized =
          (error as any).status === 401 ||
          error.code === 'PGRST301' ||
          error.message?.toLowerCase().includes('jwt') ||
          error.message?.toLowerCase().includes('unauthorized') ||
          error.message?.toLowerCase().includes('token');

        if (isUnauthorized) {
          console.warn('Session expired or unauthorized (401). Clearing stale credentials...');
          try {
            await supabase.auth.signOut();
          } catch {
            // Ignore sign-out errors on already-expired tokens
          }
          setUser(null);
          setSession(null);
          setAdminProfile(null);
          return;
        }

        console.error('Failed to fetch admin profile:', error.message);
        return;
      }

      if (data) {
        setAdminProfile(data as AdminProfile);
      } else {
        // Fallback for valid authenticated users whose admin profile row hasn't been created yet
        const activeUser = currentUser || user;
        if (activeUser) {
          setAdminProfile({
            id: `profile-${userId}`,
            user_id: userId,
            full_name: activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'Admin SPMB',
            role: (activeUser.user_metadata?.role as any) || 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
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

    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (isMounted) {
            setSession(null);
            setUser(null);
            setAdminProfile(null);
            setIsLoading(false);
          }
          return;
        }

        // Validate the session token with the Supabase Auth server to prevent stale 401 errors
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.warn('Cached auth session is expired or invalid. Purging local storage session.');
          try {
            await supabase.auth.signOut();
          } catch {
            // Ignore sign out error on stale token
          }
          if (isMounted) {
            setSession(null);
            setUser(null);
            setAdminProfile(null);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setSession(session);
          setUser(user);
          await fetchAdminProfile(user.id, user);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !newSession) {
        setSession(null);
        setUser(null);
        setAdminProfile(null);
        setIsLoading(false);
        return;
      }

      setSession(newSession);
      setUser(newSession.user);
      if (newSession.user) {
        await fetchAdminProfile(newSession.user.id, newSession.user);
      } else {
        setAdminProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchAdminProfile(data.user.id, data.user);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setSession(null);
      setAdminProfile(null);
    }
  };

  const isAdmin = Boolean(
    (!isSupabaseConfigured() && user) ||
    (adminProfile && user)
  );

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
