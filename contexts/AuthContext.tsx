import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  onboardingCompleted: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        setOnboardingCompleted(false);
        return;
      }

      setUserProfile(data);
      
      // Check if onboarding is completed based on profile data
      if (data) {
        const isCompleted = await checkIfOnboardingCompleted(data);
        setOnboardingCompleted(isCompleted);
      } else {
        setOnboardingCompleted(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setOnboardingCompleted(false);
    }
  };

  const checkIfOnboardingCompleted = async (profile: UserProfile): Promise<boolean> => {
    console.log('🔍 Checking onboarding completion for user:', profile.id);
    
    // Check if essential onboarding fields are filled
    const hasBasicProfile = !!(
      profile.full_name &&
      profile.phone &&
      profile.date_of_birth &&
      profile.height_cm &&
      profile.weight_kg
    );

    console.log('📋 Basic profile check:', {
      hasBasicProfile,
      full_name: !!profile.full_name,
      phone: !!profile.phone,
      date_of_birth: !!profile.date_of_birth,
      height_cm: !!profile.height_cm,
      weight_kg: !!profile.weight_kg
    });

    if (!hasBasicProfile) {
      console.log('❌ Basic profile incomplete');
      return false;
    }

    // Also check if user has a baby profile (essential for the app)
    try {
      const { data: babyProfiles, error } = await supabase
        .from('baby_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .limit(1);

      if (error) {
        console.error('Error checking baby profile:', error);
        return false;
      }

      const hasBabyProfile = babyProfiles && babyProfiles.length > 0;
      console.log('👶 Baby profile check:', { hasBabyProfile, count: babyProfiles?.length || 0 });
      
      return hasBabyProfile;
    } catch (error) {
      console.error('Error checking baby profile:', error);
      return false;
    }
  };

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return false;
      }

      const isCompleted = await checkIfOnboardingCompleted(data);
      setOnboardingCompleted(isCompleted);
      return isCompleted;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create user profile after successful signup
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            preferred_language: 'english',
            voice_sms_consent: false,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setOnboardingCompleted(false);
      }
      
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Refresh the profile
      await fetchUserProfile(user.id);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    onboardingCompleted,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    checkOnboardingStatus,
  };

  return (
    <AuthContext.Provider value={value}>
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
