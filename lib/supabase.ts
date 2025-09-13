import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xunasrnybtjkepngvprt.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bmFzcm55YnRqa2Vwbmd2cHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTU1MzQsImV4cCI6MjA3MzM3MTUzNH0.QK2mmhHlbiJZMENxOA-6uWbB5WvRP4ovlp9__S27G2A';

// Create Supabase client with custom storage
const customStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      return await AsyncStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      return await AsyncStorage.removeItem(key);
    } catch (e) {
      return null;
    }
  },
};

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          date_of_birth: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          bmi: number | null;
          preferred_language: string;
          voice_sms_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          bmi?: number | null;
          preferred_language?: string;
          voice_sms_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          bmi?: number | null;
          preferred_language?: string;
          voice_sms_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      baby_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          date_of_birth: string;
          height_cm: number | null;
          weight_kg: number | null;
          delivery_type: 'normal' | 'c_section' | null;
          medical_conditions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          date_of_birth: string;
          height_cm?: number | null;
          weight_kg?: number | null;
          delivery_type?: 'normal' | 'c_section' | null;
          medical_conditions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          date_of_birth?: string;
          height_cm?: number | null;
          weight_kg?: number | null;
          delivery_type?: 'normal' | 'c_section' | null;
          medical_conditions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relationship: string;
          phone: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relationship: string;
          phone: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          relationship?: string;
          phone?: string;
          is_primary?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      delivery_type: 'normal' | 'c_section';
      bmi_status: 'underweight' | 'normal' | 'overweight' | 'obese';
      language_preference: 'hindi' | 'english' | 'telugu' | 'tamil' | 'kannada' | 'malayalam';
      urgency_level: 'low' | 'medium' | 'high' | 'emergency';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type BabyProfile = Database['public']['Tables']['baby_profiles']['Row'];
export type EmergencyContact = Database['public']['Tables']['emergency_contacts']['Row'];
