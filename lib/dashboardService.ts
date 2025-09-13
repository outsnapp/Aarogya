import { supabase } from './supabase';

export interface DashboardData {
  userProfile: any;
  babyProfile: any;
  recoveryProgress: {
    percentage: number;
    phase: string;
    daysSinceDelivery: number;
    isActive: boolean;
  };
  todayFocus: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  };
  predictedMilestone: {
    title: string;
    message: string;
    daysUntil: number;
  };
  smartAlerts: Array<{
    type: 'pattern' | 'celebration' | 'family' | 'warning';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  recentCheckins: any[];
  healthMetrics: {
    energyLevel: number;
    moodScore: number;
    sleepHours: number;
    lastUpdated: string;
  };
}

export class DashboardService {
  // Get time-based greeting
  static getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  // Get user's display name
  static getUserDisplayName(userProfile: any): string {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0]; // First name only
    }
    return 'there';
  }

  // Calculate days since delivery
  static calculateDaysSinceDelivery(babyProfile: any): number {
    if (!babyProfile?.date_of_birth) return 0;
    
    const deliveryDate = new Date(babyProfile.date_of_birth);
    const today = new Date();
    const diffTime = today.getTime() - deliveryDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get recovery progress based on actual data
  static async getRecoveryProgress(userId: string, babyProfile: any): Promise<{
    percentage: number;
    phase: string;
    daysSinceDelivery: number;
    isActive: boolean;
  }> {
    const daysSinceDelivery = this.calculateDaysSinceDelivery(babyProfile);
    
    if (daysSinceDelivery <= 0) {
      return {
        percentage: 0,
        phase: 'Pre-delivery',
        daysSinceDelivery: 0,
        isActive: false
      };
    }

    // Get recovery timeline from database
    const { data: timelineData } = await supabase
      .from('recovery_timeline')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (timelineData) {
      return {
        percentage: timelineData.progress_percentage || 0,
        phase: timelineData.phase_name || 'Recovery',
        daysSinceDelivery,
        isActive: true
      };
    }

    // Calculate based on delivery type and days
    const deliveryType = babyProfile?.delivery_type;
    let expectedRecoveryDays = 42; // 6 weeks default
    
    if (deliveryType === 'c_section') {
      expectedRecoveryDays = 56; // 8 weeks for C-section
    }

    const percentage = Math.min(Math.round((daysSinceDelivery / expectedRecoveryDays) * 100), 100);
    
    let phase = 'Healing Phase';
    if (daysSinceDelivery <= 14) {
      phase = 'Initial Healing';
    } else if (daysSinceDelivery <= 28) {
      phase = 'Recovery Phase';
    } else if (daysSinceDelivery <= 42) {
      phase = 'Strengthening Phase';
    } else {
      phase = 'Recovery Complete';
    }

    return {
      percentage,
      phase,
      daysSinceDelivery,
      isActive: true
    };
  }

  // Get today's focus based on user data
  static async getTodayFocus(userId: string, babyProfile: any, recentCheckins: any[]): Promise<{
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const daysSinceDelivery = this.calculateDaysSinceDelivery(babyProfile);
    
    // If no delivery date, show onboarding focus
    if (daysSinceDelivery <= 0) {
      return {
        title: 'Welcome to Aarogya!',
        message: 'Complete your profile setup to get personalized health insights.',
        priority: 'high'
      };
    }

    // Analyze recent check-ins for patterns
    if (recentCheckins.length > 0) {
      const latestCheckin = recentCheckins[0];
      
      // Check for concerning patterns
      if (latestCheckin.energy_level <= 3) {
        return {
          title: 'Energy Support',
          message: 'Your energy levels are low. Focus on rest and gentle movement today.',
          priority: 'high'
        };
      }
      
      if (latestCheckin.mood_score <= 3) {
        return {
          title: 'Emotional Wellbeing',
          message: 'Take time for self-care today. Consider reaching out to your support network.',
          priority: 'high'
        };
      }
      
      if (latestCheckin.sleep_hours < 6) {
        return {
          title: 'Sleep Recovery',
          message: 'Try to nap when baby sleeps to improve your rest quality.',
          priority: 'medium'
        };
      }
    }

    // Default focus based on recovery phase
    if (daysSinceDelivery <= 7) {
      return {
        title: 'Initial Recovery',
        message: 'Focus on rest and gentle movement. Your body is healing.',
        priority: 'high'
      };
    } else if (daysSinceDelivery <= 21) {
      return {
        title: 'Building Strength',
        message: 'You can start light activities. Listen to your body.',
        priority: 'medium'
      };
    } else {
      return {
        title: 'Continued Recovery',
        message: 'You\'re doing well! Continue with your daily routine.',
        priority: 'low'
      };
    }
  }

  // Get predicted milestone
  static getPredictedMilestone(babyProfile: any, daysSinceDelivery: number): {
    title: string;
    message: string;
    daysUntil: number;
  } {
    if (daysSinceDelivery <= 0) {
      return {
        title: 'Getting Started',
        message: 'Complete your profile to see personalized milestones.',
        daysUntil: 0
      };
    }

    const deliveryType = babyProfile?.delivery_type;
    
    if (daysSinceDelivery < 7) {
      return {
        title: 'First Week Milestone',
        message: 'In a few days, you should feel more comfortable with basic movements.',
        daysUntil: 7 - daysSinceDelivery
      };
    } else if (daysSinceDelivery < 14) {
      return {
        title: 'Two Week Recovery',
        message: 'You should feel stronger and more energetic soon.',
        daysUntil: 14 - daysSinceDelivery
      };
    } else if (daysSinceDelivery < 28) {
      return {
        title: 'One Month Milestone',
        message: 'You\'ll likely feel much more like yourself.',
        daysUntil: 28 - daysSinceDelivery
      };
    } else if (daysSinceDelivery < 42) {
      return {
        title: 'Six Week Recovery',
        message: 'Most mothers feel significantly better by this time.',
        daysUntil: 42 - daysSinceDelivery
      };
    } else {
      return {
        title: 'Recovery Complete',
        message: 'Congratulations! You\'ve completed your initial recovery period.',
        daysUntil: 0
      };
    }
  }

  // Get smart alerts based on user data
  static async getSmartAlerts(userId: string, recentCheckins: any[]): Promise<Array<{
    type: 'pattern' | 'celebration' | 'family' | 'warning';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>> {
    const alerts = [];

    if (recentCheckins.length === 0) {
      alerts.push({
        type: 'warning' as const,
        message: 'Start your first health check-in to get personalized insights.',
        priority: 'high' as const
      });
      return alerts;
    }

    // Analyze patterns from recent check-ins
    const last3Checkins = recentCheckins.slice(0, 3);
    
    // Check for declining energy
    if (last3Checkins.length >= 2) {
      const energyTrend = last3Checkins[0].energy_level - last3Checkins[1].energy_level;
      if (energyTrend < -1) {
        alerts.push({
          type: 'pattern' as const,
          message: 'Your energy has been declining. Consider more rest today.',
          priority: 'medium' as const
        });
      }
    }

    // Check for low mood
    const latestMood = last3Checkins[0]?.mood_score;
    if (latestMood && latestMood <= 3) {
      alerts.push({
        type: 'pattern' as const,
        message: 'Your mood seems low. Would you like to talk about it?',
        priority: 'high' as const
      });
    }

    // Check for good progress
    if (last3Checkins.length >= 3) {
      const avgEnergy = last3Checkins.reduce((sum, c) => sum + c.energy_level, 0) / 3;
      if (avgEnergy >= 7) {
        alerts.push({
          type: 'celebration' as const,
          message: 'Great! Your energy levels are improving consistently.',
          priority: 'low' as const
        });
      }
    }

    // Check for family notifications (if any emergency contacts exist)
    const { data: emergencyContacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId);

    if (emergencyContacts && emergencyContacts.length > 0) {
      alerts.push({
        type: 'family' as const,
        message: `Your family network is active with ${emergencyContacts.length} contact(s).`,
        priority: 'low' as const
      });
    }

    return alerts;
  }

  // Get recent health check-ins
  static async getRecentCheckins(userId: string, limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('mother_health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching health check-ins:', error);
      return [];
    }

    return data || [];
  }

  // Get comprehensive dashboard data
  static async getDashboardData(userId: string): Promise<DashboardData | null> {
    try {
      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Get baby profile
      const { data: babyProfile, error: babyError } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (babyError && babyError.code !== 'PGRST116') {
        console.error('Error fetching baby profile:', babyError);
      }

      // Get recent check-ins
      const recentCheckins = await this.getRecentCheckins(userId);

      // Get recovery progress
      const recoveryProgress = await this.getRecoveryProgress(userId, babyProfile);

      // Get today's focus
      const todayFocus = await this.getTodayFocus(userId, babyProfile, recentCheckins);

      // Get predicted milestone
      const predictedMilestone = this.getPredictedMilestone(babyProfile, recoveryProgress.daysSinceDelivery);

      // Get smart alerts
      const smartAlerts = await this.getSmartAlerts(userId, recentCheckins);

      // Get health metrics
      const healthMetrics = {
        energyLevel: recentCheckins[0]?.energy_level || 0,
        moodScore: recentCheckins[0]?.mood_score || 0,
        sleepHours: recentCheckins[0]?.sleep_hours || 0,
        lastUpdated: recentCheckins[0]?.recorded_date || new Date().toISOString()
      };

      return {
        userProfile,
        babyProfile,
        recoveryProgress,
        todayFocus,
        predictedMilestone,
        smartAlerts,
        recentCheckins,
        healthMetrics
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }
}
