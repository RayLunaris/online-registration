import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AdminProfile } from '@/types/spmb';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  isAdmin: boolean;
  /** True while auth session OR admin profile is still being resolved. */
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
  // Tracks whether a fetchAdminProfile call is currently in-flight.
  // Kept separate from isLoading so mid-session token refreshes don't
  // briefly expose isLoading=false while the profile is still pending.
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  const fetchAdminProfile = async (userId: string, currentUser?: User | null): Promise<AdminProfile | null> => {
    if (!isSupabaseConfigured()) return null;
    setIsProfileLoading(true);
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
          return null;
        }

        console.error('Failed to fetch admin profile:', error.message);
        setAdminProfile(null);
        return null;
      }

      if (data) {
        const profile = data as AdminProfile;
        setAdminProfile(profile);
        return profile;
      }

      // Check PostgreSQL is_admin() function as fallback verification
      try {
        const { data: isRpcAdmin } = await supabase.rpc('is_admin');
        if (isRpcAdmin) {
          const activeUser = currentUser || user;
          const fallbackProfile: AdminProfile = {
            id: `profile-${userId}`,
            user_id: userId,
            full_name: activeUser?.user_metadata?.full_name || activeUser?.email?.split('@')[0] || 'Admin SPMB',
            role: (activeUser?.user_metadata?.role as any) || 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setAdminProfile(fallbackProfile);
          return fallbackProfile;
        }
      } catch {
        // is_admin RPC not available or failed
      }

      // User does not exist in admin_profiles and is_admin() returned false
      setAdminProfile(null);
      return null;
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
      setAdminProfile(null);
      return null;
    } finally {
      setIsProfileLoading(false);
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
        const profile = await fetchAdminProfile(data.user.id, data.user);
        if (!profile) {
          // Reject login for non-admin accounts to protect admin portal
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setAdminProfile(null);
          return { error: new Error('Akun ini tidak memiliki hak akses sebagai administrator.') };
        }

        setSession(data.session);
        setUser(data.user);
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
    (adminProfile && user && ['super_admin', 'admin', 'operator'].includes(adminProfile.role))
  );

  // Merge isProfileLoading into the public isLoading flag so consumers (e.g.
  // ProtectedRoute) never see isLoading=false while the admin profile fetch is
  // still in-flight — preventing the transient "Akses Ditolak" flash.
  const effectiveIsLoading = isLoading || isProfileLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        adminProfile,
        isAdmin,
        isLoading: effectiveIsLoading,
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
