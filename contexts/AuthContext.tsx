import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  markOnboardingCompleted: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Cache for onboarding status to avoid repeated database calls
  const [onboardingCache, setOnboardingCache] = useState<Map<string, boolean>>(new Map());

  // Save onboarding status to AsyncStorage
  const saveOnboardingStatus = async (userId: string, isCompleted: boolean) => {
    try {
      const key = `onboarding_completed_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        completed: isCompleted,
        timestamp: Date.now()
      }));
      console.log('💾 Saved onboarding status to storage:', { userId, isCompleted });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  // Clear all authentication data
  const clearAuthData = async () => {
    try {
      // Clear all onboarding status entries
      const keys = await AsyncStorage.getAllKeys();
      const onboardingKeys = keys.filter(key => key.startsWith('onboarding_completed_'));
      if (onboardingKeys.length > 0) {
        await AsyncStorage.multiRemove(onboardingKeys);
      }
      
      // Clear any other auth-related storage
      await AsyncStorage.removeItem('supabase.auth.token');
      await AsyncStorage.removeItem('supabase.auth.refresh_token');
      
      console.log('🧹 Cleared all authentication data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Load onboarding status from AsyncStorage
  const loadOnboardingStatus = async (userId: string): Promise<boolean | null> => {
    try {
      const key = `onboarding_completed_${userId}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        // Check if the data is not too old (24 hours)
        const isRecent = (Date.now() - data.timestamp) < (24 * 60 * 60 * 1000);
        if (isRecent) {
          console.log('📱 Loaded onboarding status from storage:', { userId, completed: data.completed });
          return data.completed;
        } else {
          // Remove old data
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    }
    return null;
  };

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('Session error (non-critical):', error.message);
        // Clear any invalid session data
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setOnboardingCompleted(false);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      }
      setLoading(false);
    }).catch((error) => {
      console.log('Session fetch error (non-critical):', error.message);
      // Clear any invalid session data
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setOnboardingCompleted(false);
      setLoading(false);
    });

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUserProfile(null);
            setOnboardingCompleted(false);
            // Clear onboarding cache when user signs out
            setOnboardingCache(new Map());
          }
        } catch (error) {
          console.log('Auth state change error (non-critical):', error);
          // Handle errors gracefully
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            setUserProfile(null);
            setOnboardingCompleted(false);
            setOnboardingCache(new Map());
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First, try to load from cache/storage
      const cachedStatus = await loadOnboardingStatus(userId);
      if (cachedStatus !== null) {
        console.log('🚀 Using cached onboarding status:', cachedStatus);
        setOnboardingCompleted(cachedStatus);
        // Still fetch profile for other data, but use cached onboarding status
      }

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
        // Only check database if we don't have cached status
        if (cachedStatus === null) {
          const isCompleted = await checkIfOnboardingCompleted(data);
          setOnboardingCompleted(isCompleted);
          // Save to cache for future use
          await saveOnboardingStatus(userId, isCompleted);
        } else {
          // Verify cached status is still accurate
          const isCompleted = await checkIfOnboardingCompleted(data);
          if (isCompleted !== cachedStatus) {
            console.log('🔄 Cached status outdated, updating:', { cached: cachedStatus, actual: isCompleted });
            setOnboardingCompleted(isCompleted);
            await saveOnboardingStatus(userId, isCompleted);
          }
        }
      } else {
        setOnboardingCompleted(false);
        await saveOnboardingStatus(userId, false);
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

    // Basic profile is complete - baby profile is optional and can be added later
    console.log('✅ Basic profile complete - onboarding finished');
    return true;
  };

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // First check cache
      const cachedStatus = await loadOnboardingStatus(user.id);
      if (cachedStatus !== null) {
        console.log('🚀 Using cached onboarding status in checkOnboardingStatus:', cachedStatus);
        setOnboardingCompleted(cachedStatus);
        return cachedStatus;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        setOnboardingCompleted(false);
        await saveOnboardingStatus(user.id, false);
        return false;
      }

      const isCompleted = await checkIfOnboardingCompleted(data);
      setOnboardingCompleted(isCompleted);
      await saveOnboardingStatus(user.id, isCompleted);
      return isCompleted;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingCompleted(false);
      return false;
    }
  };

  const markOnboardingCompleted = async (): Promise<void> => {
    if (!user) return;
    
    try {
      console.log('✅ Explicitly marking onboarding as completed for user:', user.id);
      setOnboardingCompleted(true);
      await saveOnboardingStatus(user.id, true);
      
      // Clear the cache to force fresh data
      setOnboardingCache(new Map());
      
      // Also refresh the user profile to ensure data is up to date
      await fetchUserProfile(user.id);
      
      console.log('✅ Onboarding completion fully processed');
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
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
      
      // Always clear local state first
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setOnboardingCompleted(false);
      setOnboardingCache(new Map());
      
      // Clear all stored authentication data
      await clearAuthData();
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('Sign out error (non-critical):', error.message);
        // Even if Supabase signOut fails, we've already cleared local state
        // This handles cases where refresh tokens are invalid
      }
      
      return { error: null }; // Always return success since we cleared local state
    } catch (error) {
      console.log('Sign out catch error (non-critical):', error);
      // Even if there's an error, we've cleared local state
      return { error: null };
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
    markOnboardingCompleted,
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
