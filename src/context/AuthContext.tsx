// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/authActions';
import { Database, Tables } from '@/lib/database.types';

type Profile = Tables<'profiles'>;
type UserSubscription = Tables<'user_subscriptions'> & {
  // --- PERBAIKAN: Menambahkan 'price_yearly' ke tipe untuk konsistensi ---
  subscription_plans: Pick<Tables<'subscription_plans'>, 'name' | 'features' | 'price_monthly' | 'price_yearly'> | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  activeSubscription: UserSubscription | null;
  loading: boolean;
  handleLogout: () => Promise<void>;
  setSessionManually: (newSession: Session) => void;
  refreshAuthStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const refreshAuthStatus = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      setSession(currentSession);
      setUser(currentUser);

      if (currentUser) {
        const [profileRes, subscriptionRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
          // --- PERBAIKAN UTAMA DI SINI: Menambahkan 'price_yearly' ke dalam query ---
          supabase.from('user_subscriptions').select('*, subscription_plans(name, features, price_monthly, price_yearly)')
            .eq('user_id', currentUser.id)
            .in('status', ['active', 'trialing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        ]);
        
        if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
        setProfile(profileRes.data);

        if (subscriptionRes.error && subscriptionRes.error.code !== 'PGRST116') {
            console.error("AuthContext: Error fetching subscription:", subscriptionRes.error);
            throw subscriptionRes.error;
        }

        setActiveSubscription(subscriptionRes.data as UserSubscription | null);
        
      } else {
        setProfile(null);
        setActiveSubscription(null);
      }
    } catch (error) {
      console.error("AuthContext: Error during data fetch:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refreshAuthStatus();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          refreshAuthStatus();
          router.refresh();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, refreshAuthStatus]);

  const handleLogout = async () => {
    await logoutAction();
    setSession(null);
    setUser(null);
    setProfile(null);
    setActiveSubscription(null);
    router.push('/');
    router.refresh();
  };
  
  const setSessionManually = useCallback((newSession: Session) => {
    setSession(newSession);
    setUser(newSession.user);
    refreshAuthStatus();
  }, [refreshAuthStatus]);

  const value = { session, user, profile, activeSubscription, loading, handleLogout, setSessionManually, refreshAuthStatus };

  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={value}>
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