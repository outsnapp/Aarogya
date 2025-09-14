import { supabase } from './supabase';

export interface BabyProfile {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  height_cm: number | null;
  weight_kg: number | null;
  delivery_type: string | null;
  medical_conditions: string | null;
  created_at: string;
}

export interface BabyGrowth {
  id: string;
  baby_id: string;
  recorded_date: string;
  weight: number | null;
  height: number | null;
  head_circumference: number | null;
  notes: string | null;
  created_at: string;
}

export interface BabyMilestone {
  id: string;
  baby_id: string;
  milestone_type: 'motor' | 'social' | 'cognitive' | 'language';
  milestone_name: string;
  expected_age_months: number | null;
  achieved_date: string | null;
  is_achieved: boolean;
  notes: string | null;
  created_at: string;
}

export interface BabyFeeding {
  id: string;
  baby_id: string;
  feeding_date: string;
  feeding_type: 'breastfeeding' | 'bottle' | 'solid';
  amount_ml: number | null;
  duration_minutes: number | null;
  food_items: string | null;
  notes: string | null;
  created_at: string;
}

export interface DailyCheckIn {
  baby_id: string;
  checkin_date: string;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  head_circumference: number | null;
  feeding_count: number | null;
  sleep_hours: number | null;
  mood_score: number | null; // 1-10
  activity_level: number | null; // 1-10
  diaper_changes: number | null;
  concerns: string | null;
  notes: string | null;
}

export interface HealthAssessment {
  overall_health: 'excellent' | 'good' | 'fair' | 'poor';
  growth_status: 'on_track' | 'slightly_behind' | 'ahead' | 'concerning';
  feeding_status: 'excellent' | 'good' | 'needs_attention' | 'concerning';
  development_status: 'on_track' | 'slightly_behind' | 'ahead' | 'concerning';
  recommendations: string[];
  alerts: string[];
}

export class ChildCareService {
  // Get baby profile for user
  static async getBabyProfile(userId: string): Promise<BabyProfile | null> {
    try {
      const { data: babyProfiles, error } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching baby profile:', error);
        return null;
      }

      return babyProfiles && babyProfiles.length > 0 ? babyProfiles[0] : null;
    } catch (error) {
      console.error('Error fetching baby profile:', error);
      return null;
    }
  }

  // Get latest growth data for baby
  static async getLatestGrowth(babyId: string): Promise<BabyGrowth | null> {
    try {
      const { data, error } = await supabase
        .from('baby_growth')
        .select('*')
        .eq('baby_id', babyId)
        .order('recorded_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching latest growth:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching latest growth:', error);
      return null;
    }
  }

  // Get all milestones for baby
  static async getMilestones(babyId: string): Promise<BabyMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('baby_milestones')
        .select('*')
        .eq('baby_id', babyId)
        .order('expected_age_months', { ascending: true });

      if (error) {
        console.error('Error fetching milestones:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }
  }

  // Get recent feeding data
  static async getRecentFeeding(babyId: string, days: number = 7): Promise<BabyFeeding[]> {
    try {
      const { data, error } = await supabase
        .from('baby_feeding')
        .select('*')
        .eq('baby_id', babyId)
        .gte('feeding_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('feeding_date', { ascending: false });

      if (error) {
        console.error('Error fetching feeding data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching feeding data:', error);
      return [];
    }
  }

  // Save daily check-in
  static async saveDailyCheckIn(checkIn: DailyCheckIn): Promise<{ success: boolean; error?: any }> {
    try {
      // First, try to save to a daily_checkins table if it exists
      const { error: checkInError } = await supabase
        .from('daily_checkins')
        .upsert({
          baby_id: checkIn.baby_id,
          checkin_date: checkIn.checkin_date,
          temperature: checkIn.temperature,
          weight: checkIn.weight,
          height: checkIn.height,
          head_circumference: checkIn.head_circumference,
          feeding_count: checkIn.feeding_count,
          sleep_hours: checkIn.sleep_hours,
          mood_score: checkIn.mood_score,
          activity_level: checkIn.activity_level,
          diaper_changes: checkIn.diaper_changes,
          concerns: checkIn.concerns,
          notes: checkIn.notes,
        });

      if (checkInError) {
        console.warn('Daily checkins table not available, using baby_growth table:', checkInError);
        
        // Fallback: Save to baby_growth table
        const { error: growthError } = await supabase
          .from('baby_growth')
          .insert({
            baby_id: checkIn.baby_id,
            recorded_date: checkIn.checkin_date,
            weight: checkIn.weight,
            height: checkIn.height,
            head_circumference: checkIn.head_circumference,
            notes: `Daily Check-in: Temp: ${checkIn.temperature}°F, Feedings: ${checkIn.feeding_count}, Sleep: ${checkIn.sleep_hours}h, Mood: ${checkIn.mood_score}/10, Activity: ${checkIn.activity_level}/10, Diapers: ${checkIn.diaper_changes}. Concerns: ${checkIn.concerns || 'None'}. ${checkIn.notes || ''}`,
          });

        if (growthError) {
          console.error('Error saving daily check-in:', growthError);
          return { success: false, error: growthError };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving daily check-in:', error);
      return { success: false, error };
    }
  }

  // Save feeding record
  static async saveFeeding(feeding: Omit<BabyFeeding, 'id' | 'created_at'>): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('baby_feeding')
        .insert(feeding);

      if (error) {
        console.error('Error saving feeding record:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving feeding record:', error);
      return { success: false, error };
    }
  }

  // Save milestone achievement
  static async saveMilestone(milestone: Omit<BabyMilestone, 'id' | 'created_at'>): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('baby_milestones')
        .insert(milestone);

      if (error) {
        console.error('Error saving milestone:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving milestone:', error);
      return { success: false, error };
    }
  }

  // Save growth measurement
  static async saveGrowth(growth: Omit<BabyGrowth, 'id' | 'created_at'>): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('baby_growth')
        .insert(growth);

      if (error) {
        console.error('Error saving growth measurement:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving growth measurement:', error);
      return { success: false, error };
    }
  }

  // Calculate baby age in months
  static calculateAgeInMonths(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return Math.max(0, diffInMonths);
  }

  // Get age-appropriate milestones
  static getAgeAppropriateMilestones(ageInMonths: number): Partial<BabyMilestone>[] {
    const milestones: Partial<BabyMilestone>[] = [];

    if (ageInMonths >= 0) {
      milestones.push(
        { milestone_type: 'motor', milestone_name: 'Lifts head during tummy time', expected_age_months: 1 },
        { milestone_type: 'social', milestone_name: 'Makes eye contact', expected_age_months: 1 },
        { milestone_type: 'cognitive', milestone_name: 'Follows objects with eyes', expected_age_months: 2 }
      );
    }

    if (ageInMonths >= 2) {
      milestones.push(
        { milestone_type: 'motor', milestone_name: 'Holds head steady', expected_age_months: 3 },
        { milestone_type: 'social', milestone_name: 'Smiles responsively', expected_age_months: 2 },
        { milestone_type: 'cognitive', milestone_name: 'Recognizes familiar faces', expected_age_months: 3 }
      );
    }

    if (ageInMonths >= 4) {
      milestones.push(
        { milestone_type: 'motor', milestone_name: 'Rolls over from tummy to back', expected_age_months: 4 },
        { milestone_type: 'motor', milestone_name: 'Sits with support', expected_age_months: 5 },
        { milestone_type: 'social', milestone_name: 'Laughs and squeals', expected_age_months: 4 },
        { milestone_type: 'cognitive', milestone_name: 'Reaches for objects', expected_age_months: 4 }
      );
    }

    if (ageInMonths >= 6) {
      milestones.push(
        { milestone_type: 'motor', milestone_name: 'Sits without support', expected_age_months: 6 },
        { milestone_type: 'motor', milestone_name: 'Crawls or scoots', expected_age_months: 8 },
        { milestone_type: 'social', milestone_name: 'Responds to name', expected_age_months: 6 },
        { milestone_type: 'language', milestone_name: 'Babbles with consonants', expected_age_months: 6 }
      );
    }

    return milestones;
  }

  // Assess baby health based on check-in data
  static assessHealth(checkIn: DailyCheckIn, ageInMonths: number): HealthAssessment {
    const recommendations: string[] = [];
    const alerts: string[] = [];

    // Temperature assessment
    if (checkIn.temperature && (checkIn.temperature < 97 || checkIn.temperature > 100.4)) {
      alerts.push(`Temperature ${checkIn.temperature}°F is outside normal range (97-100.4°F)`);
    }

    // Feeding assessment
    if (checkIn.feeding_count) {
      const expectedFeedings = ageInMonths < 3 ? 8 : ageInMonths < 6 ? 6 : 4;
      if (checkIn.feeding_count < expectedFeedings - 1) {
        alerts.push(`Feeding count (${checkIn.feeding_count}) is below expected (${expectedFeedings})`);
      } else if (checkIn.feeding_count >= expectedFeedings) {
        recommendations.push('Great feeding schedule! Keep it up.');
      }
    }

    // Sleep assessment
    if (checkIn.sleep_hours) {
      const expectedSleep = ageInMonths < 3 ? 16 : ageInMonths < 6 ? 14 : 12;
      if (checkIn.sleep_hours < expectedSleep - 2) {
        alerts.push(`Sleep hours (${checkIn.sleep_hours}) is below expected (${expectedSleep})`);
      } else if (checkIn.sleep_hours >= expectedSleep) {
        recommendations.push('Excellent sleep pattern!');
      }
    }

    // Mood assessment
    if (checkIn.mood_score && checkIn.mood_score < 5) {
      alerts.push(`Mood score (${checkIn.mood_score}/10) indicates baby may be uncomfortable`);
    } else if (checkIn.mood_score && checkIn.mood_score >= 8) {
      recommendations.push('Baby seems very happy and content!');
    }

    // Activity assessment
    if (checkIn.activity_level && checkIn.activity_level < 3) {
      alerts.push(`Activity level (${checkIn.activity_level}/10) seems low - consider tummy time`);
    } else if (checkIn.activity_level && checkIn.activity_level >= 7) {
      recommendations.push('Great activity level! Baby is very active.');
    }

    // Overall health assessment
    let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    if (alerts.length === 0 && recommendations.length > 0) {
      overallHealth = 'excellent';
    } else if (alerts.length > 2) {
      overallHealth = 'poor';
    } else if (alerts.length > 0) {
      overallHealth = 'fair';
    }

    return {
      overall_health: overallHealth,
      growth_status: 'on_track', // This would need historical data to assess properly
      feeding_status: checkIn.feeding_count && checkIn.feeding_count >= 4 ? 'excellent' : 'good',
      development_status: 'on_track', // This would need milestone data to assess properly
      recommendations,
      alerts,
    };
  }

  // Get today's check-in if exists
  static async getTodaysCheckIn(babyId: string): Promise<DailyCheckIn | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try daily_checkins table first
      const { data: checkInData, error: checkInError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('baby_id', babyId)
        .eq('checkin_date', today)
        .single();

      if (!checkInError && checkInData) {
        return checkInData;
      }

      // Fallback: Check baby_growth table for today's entry
      const { data: growthData, error: growthError } = await supabase
        .from('baby_growth')
        .select('*')
        .eq('baby_id', babyId)
        .eq('recorded_date', today)
        .single();

      if (!growthError && growthData) {
        // Parse notes to extract check-in data
        const notes = growthData.notes || '';
        const tempMatch = notes.match(/Temp: ([\d.]+)°F/);
        const feedingMatch = notes.match(/Feedings: (\d+)/);
        const sleepMatch = notes.match(/Sleep: ([\d.]+)h/);
        const moodMatch = notes.match(/Mood: (\d+)\/10/);
        const activityMatch = notes.match(/Activity: (\d+)\/10/);
        const diaperMatch = notes.match(/Diapers: (\d+)/);

        return {
          baby_id: babyId,
          checkin_date: today,
          temperature: tempMatch ? parseFloat(tempMatch[1]) : null,
          weight: growthData.weight,
          height: growthData.height,
          head_circumference: growthData.head_circumference,
          feeding_count: feedingMatch ? parseInt(feedingMatch[1]) : null,
          sleep_hours: sleepMatch ? parseFloat(sleepMatch[1]) : null,
          mood_score: moodMatch ? parseInt(moodMatch[1]) : null,
          activity_level: activityMatch ? parseInt(activityMatch[1]) : null,
          diaper_changes: diaperMatch ? parseInt(diaperMatch[1]) : null,
          concerns: notes.includes('Concerns: None') ? null : notes.split('Concerns: ')[1]?.split('.')[0] || null,
          notes: notes.split('. ').slice(-1)[0] || null,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching today\'s check-in:', error);
      return null;
    }
  }
}
