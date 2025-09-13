import { supabase, UserProfile, BabyProfile, EmergencyContact } from './supabase';

// Interface for onboarding data
export interface OnboardingData {
  name: string;
  phone: string;
  motherDob: string;
  motherHeight: string;
  motherWeight: string;
  motherBmi: number;
  babyDob: string;
  babyHeight: string;
  babyWeight: string;
  babyMedicalConditions: string;
  deliveryType: string;
  emergencyContacts: string[];
  preferredLanguage: string;
  voiceSmsConsent: boolean;
}

export class DatabaseService {
  // Save onboarding data to multiple tables
  async saveOnboardingData(userId: string, data: OnboardingData) {
    try {
      // 1. Create or update user profile
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      let profileResult;
      if (!existingProfile) {
        // Create new profile if it doesn't exist
        profileResult = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: (await supabase.auth.getUser()).data.user?.email || '',
            full_name: data.name || null,
            phone: data.phone || null,
            date_of_birth: this.parseDate(data.motherDob),
            height_cm: data.motherHeight ? parseInt(data.motherHeight) : null,
            weight_kg: data.motherWeight ? parseFloat(data.motherWeight) : null,
            bmi: data.motherBmi || null,
            preferred_language: data.preferredLanguage ? data.preferredLanguage.toLowerCase() : 'english',
            voice_sms_consent: data.voiceSmsConsent || false,
          })
          .select()
          .single();
      } else {
        // Update existing profile
        profileResult = await supabase
          .from('user_profiles')
          .update({
            full_name: data.name || null,
            phone: data.phone || null,
            date_of_birth: this.parseDate(data.motherDob),
            height_cm: data.motherHeight ? parseInt(data.motherHeight) : null,
            weight_kg: data.motherWeight ? parseFloat(data.motherWeight) : null,
            bmi: data.motherBmi || null,
            preferred_language: data.preferredLanguage ? data.preferredLanguage.toLowerCase() : 'english',
            voice_sms_consent: data.voiceSmsConsent || false,
          })
          .eq('id', userId)
          .select()
          .single();

      }

      if (profileResult.error) {
        console.error('Error with user profile:', profileResult.error);
        return { error: profileResult.error };
      }

      // Wait a short moment to ensure the profile is created in the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Create baby profile (only if baby data exists)
      let babyData = null;
      if (data.babyDob || data.babyHeight || data.babyWeight) {
        const { data: babyResult, error: babyError } = await supabase
          .from('baby_profiles')
          .insert({
            user_id: userId,
            name: data.name ? `${data.name}'s Baby` : 'Baby', // Default name, can be updated later
            date_of_birth: this.parseDate(data.babyDob),
            height_cm: data.babyHeight ? parseFloat(data.babyHeight) : null,
            weight_kg: data.babyWeight ? parseFloat(data.babyWeight) : null,
            delivery_type: data.deliveryType && data.deliveryType.toLowerCase().includes('c-section') ? 'c_section' : 'normal_delivery',
            medical_conditions: data.babyMedicalConditions || null,
          })
          .select()
          .single();

        if (babyError) {
          console.error('Error creating baby profile:', babyError);
          // Don't return error here as it's not critical for basic profile creation
        } else {
          babyData = babyResult;
        }
      }

      // 3. Create emergency contacts
      if (data.emergencyContacts && data.emergencyContacts.length > 0) {
        const emergencyContactsData = data.emergencyContacts.map((contact, index) => {
          const [name, relationship] = this.parseEmergencyContact(contact);
          return {
            user_id: userId,
            name: name,
            relationship: relationship,
            phone: data.phone, // Default to user's phone, should be updated
            is_primary: index === 0, // First contact is primary
          };
        });

        const { error: contactsError } = await supabase
          .from('emergency_contacts')
          .insert(emergencyContactsData);

        if (contactsError) {
          console.error('Error creating emergency contacts:', contactsError);
          // Don't return error here as it's not critical
        }
      }

      // 4. Create initial language preferences
      if (data.preferredLanguage) {
        const { error: langError } = await supabase
          .from('language_preferences')
          .insert({
            user_id: userId,
            primary_language: data.preferredLanguage.toLowerCase(),
            voice_recognition_language: data.preferredLanguage.toLowerCase(),
            text_display_language: data.preferredLanguage.toLowerCase(),
          });

        if (langError) {
          console.error('Error creating language preferences:', langError);
          // Don't return error here as it's not critical
        }
      }

      return { 
        data: {
          profile: true,
          baby: babyData,
          contacts: data.emergencyContacts.length,
        },
        error: null 
      };
    } catch (error) {
      console.error('Error in saveOnboardingData:', error);
      return { error };
    }
  }

  // Get user's complete profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          baby_profiles (*),
          emergency_contacts (*),
          language_preferences (*)
        `)
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Save baby feeding data
  async saveBabyFeeding(babyId: string, feedingData: {
    feedingTime: string;
    feedingType: string;
    amountMl?: number;
    durationMinutes?: number;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('baby_feeding')
        .insert({
          baby_id: babyId,
          feeding_time: feedingData.feedingTime,
          feeding_type: feedingData.feedingType,
          amount_ml: feedingData.amountMl,
          duration_minutes: feedingData.durationMinutes,
          notes: feedingData.notes,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Save baby milestone
  async saveBabyMilestone(babyId: string, milestoneData: {
    milestoneType: string;
    milestoneName: string;
    achievedAt: string;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('baby_milestones')
        .insert({
          baby_id: babyId,
          milestone_type: milestoneData.milestoneType,
          milestone_name: milestoneData.milestoneName,
          achieved_at: milestoneData.achievedAt,
          notes: milestoneData.notes,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Save mother nutrition data
  async saveMotherNutrition(userId: string, nutritionData: {
    date: string;
    calories?: number;
    proteinG?: number;
    ironMg?: number;
    calciumMg?: number;
    waterLiters?: number;
    mealType: string;
    foodItems?: string[];
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('mother_nutrition')
        .insert({
          user_id: userId,
          date: nutritionData.date,
          calories: nutritionData.calories,
          protein_g: nutritionData.proteinG,
          iron_mg: nutritionData.ironMg,
          calcium_mg: nutritionData.calciumMg,
          water_liters: nutritionData.waterLiters,
          meal_type: nutritionData.mealType,
          food_items: nutritionData.foodItems,
          notes: nutritionData.notes,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Save health check-in
  async saveHealthCheckin(userId: string, checkinData: {
    checkinDate: string;
    overallFeeling: number;
    physicalRecovery: number;
    emotionalWellbeing: number;
    energyLevels: number;
    sleepQuality: number;
    painLevel: number;
    concerns?: string;
    voiceNotesUrl?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('health_checkins')
        .insert({
          user_id: userId,
          checkin_date: checkinData.checkinDate,
          overall_feeling: checkinData.overallFeeling,
          physical_recovery: checkinData.physicalRecovery,
          emotional_wellbeing: checkinData.emotionalWellbeing,
          energy_levels: checkinData.energyLevels,
          sleep_quality: checkinData.sleepQuality,
          pain_level: checkinData.painLevel,
          concerns: checkinData.concerns,
          voice_notes_url: checkinData.voiceNotesUrl,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Submit anonymous question
  async submitAnonymousQuestion(questionData: {
    userId?: string; // Optional for anonymous questions
    questionText: string;
    category: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
  }) {
    try {
      const { data, error } = await supabase
        .from('anonymous_questions')
        .insert({
          user_id: questionData.userId || null,
          question_text: questionData.questionText,
          category: questionData.category,
          urgency: questionData.urgency,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get baby's growth data
  async getBabyGrowthData(babyId: string) {
    try {
      const { data, error } = await supabase
        .from('baby_growth')
        .select('*')
        .eq('baby_id', babyId)
        .order('recorded_date', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get mother's nutrition history
  async getMotherNutritionHistory(userId: string, days: number = 30) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('mother_nutrition')
        .select('*')
        .eq('user_id', userId)
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Helper functions
  private parseDate(dateString: string): string | null {
    try {
      // Return null for empty or invalid dates
      if (!dateString || dateString.trim() === '' || dateString === 'undefined' || dateString === 'null') {
        return null;
      }

      // Handle different date formats (DD/MM/YYYY, DD-MM-YYYY, etc.)
      const parts = dateString.split(/[\/\-]/);
      if (parts.length === 3) {
        // Assume DD/MM/YYYY format
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // Validate the date parts
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
          const dayStr = day.toString().padStart(2, '0');
          const monthStr = month.toString().padStart(2, '0');
          return `${year}-${monthStr}-${dayStr}`;
        }
      }
      
      // If it's already in YYYY-MM-DD format, validate and return
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      // If we can't parse it, return null
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  private parseEmergencyContact(contactString: string): [string, string] {
    try {
      // Parse "My husband Rajesh" -> ["Rajesh", "husband"]
      const words = contactString.toLowerCase().split(' ');
      if (words.includes('husband')) {
        return [words[words.indexOf('husband') + 1] || 'Unknown', 'husband'];
      } else if (words.includes('mother')) {
        return [words[words.indexOf('mother') + 1] || 'Unknown', 'mother'];
      } else if (words.includes('father')) {
        return [words[words.indexOf('father') + 1] || 'Unknown', 'father'];
      } else if (words.includes('sister')) {
        return [words[words.indexOf('sister') + 1] || 'Unknown', 'sister'];
      } else if (words.includes('brother')) {
        return [words[words.indexOf('brother') + 1] || 'Unknown', 'brother'];
      } else {
        // Default parsing
        return [contactString, 'family'];
      }
    } catch (error) {
      return [contactString, 'emergency_contact'];
    }
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
