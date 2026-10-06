import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'receptionist';
  roleTitle: string;
  branch: string;
}

export type UserRole = 'customer' | 'shop_owner' | 'admin' | 'owner' | 'manager' | 'receptionist';

interface AuthContextType {
  user: User | DemoUser | null;
  demoUser: DemoUser | null;
  profile: any | null;
  role: UserRole;
  selectedBranch: 'all' | 'mansarovar' | 'doorstep';
  loading: boolean;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isShopOwner: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loginAsDemoRole: (role: 'owner' | 'manager' | 'receptionist') => void;
  setSelectedBranch: (branch: 'all' | 'mansarovar' | 'doorstep') => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ROLES: Record<'owner' | 'manager' | 'receptionist', DemoUser> = {
  owner: {
    id: 'user-uma-sharma',
    email: 'uma@nailsbyuma.in',
    name: 'Uma Sharma',
    role: 'owner',
    roleTitle: 'Business Owner & Founder',
    branch: 'All Outlets & Units',
  },
  manager: {
    id: 'user-jaipur-manager',
    email: 'manager.jaipur@nailsbyuma.in',
    name: 'Pooja Verma',
    role: 'manager',
    roleTitle: 'Branch Manager - Mansarovar',
    branch: 'Mansarovar Studio, Jaipur',
  },
  receptionist: {
    id: 'user-frontdesk-receptionist',
    email: 'frontdesk@nailsbyuma.in',
    name: 'Neha Sharma',
    role: 'receptionist',
    roleTitle: 'Front Desk Receptionist',
    branch: 'Front Desk - Mansarovar Outlet',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'mansarovar' | 'doorstep'>('all');
  const [loading, setLoading] = useState(true);

  const fetchProfileForUser = async (userId: string) => {
    try {
      // 1. Fetch profile strictly from DB
      const { data, error } = await supabase
        .from('profiles')
        .select('*, role') // Explicitly select role
        .eq('id', userId) // Use 'id' (UUID PK) matching auth.users(id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        // The authoritative source of truth for authorization is 'role' from 'profiles'
        setRole(data.role || 'customer');
      } else {
        // Fallback only if no profile exists
        setProfile({ id: userId, role: 'customer' });
        setRole('customer');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Fallback on error to prevent total lockout, but log critical failure
      setRole('customer');
    }
  };

  const refreshProfile = async () => {
    if (user && 'id' in user && !demoUser) {
      await fetchProfileForUser(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session & Demo User Setup
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const savedDemoUser = localStorage.getItem('aura_demo_user');
        
        // Check Supabase session safely
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setDemoUser(null);
            await fetchProfileForUser(session.user.id);
          } else if (savedDemoUser) {
            try {
              const parsed = JSON.parse(savedDemoUser) as DemoUser;
              setDemoUser(parsed);
              setUser(parsed);
              setRole(parsed.role || 'owner');
            } catch (err) {
              console.warn('Could not parse demo user:', err);
              localStorage.removeItem('aura_demo_user');
            }
          }
        }
      } catch (err) {
        console.warn('Auth session initialization notice:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Auth State Change Subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setLoading(true); // Start loading to prevent flicker
          setUser(session.user);
          setDemoUser(null);
          localStorage.removeItem('aura_demo_user');
          await fetchProfileForUser(session.user.id);
          if (mounted) setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setLoading(true); // Start loading to prevent flicker
        setUser(null);
        setDemoUser(null);
        setProfile(null);
        setRole('customer');
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAsDemoRole = (roleType: 'owner' | 'manager' | 'receptionist') => {
    const demo = DEMO_ROLES[roleType];
    setDemoUser(demo);
    setUser(demo);
    setProfile(null);
    setRole(roleType);
    localStorage.setItem('aura_demo_user', JSON.stringify(demo));
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem('aura_demo_user');
    setDemoUser(null);
    setUser(null);
    setProfile(null);
    setRole('customer');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut exception handled:', err);
    }
  };

  const isAuthenticated = !!user;
  const isCustomer = role === 'customer';
  const isShopOwner = role === 'shop_owner' || role === 'owner' || role === 'manager' || role === 'receptionist';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        demoUser,
        profile,
        role,
        selectedBranch,
        loading,
        isAuthenticated,
        isCustomer,
        isShopOwner,
        isAdmin,
        signIn,
        signOut,
        loginAsDemoRole,
        setSelectedBranch,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
