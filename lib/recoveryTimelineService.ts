import { supabase } from './supabase';
import { AIService } from './aiService';

export interface RecoveryMilestone {
  day: number;
  title: string;
  description: string;
  isAchieved: boolean;
  isUpcoming: boolean;
}

export interface RecoveryPrediction {
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'insight';
}

export interface RecoveryTip {
  title: string;
  description: string;
  category: 'sleep' | 'family' | 'health';
}

export interface RecoveryTimelineData {
  currentPhase: string;
  daysSinceDelivery: number;
  progressPercentage: number;
  milestones: RecoveryMilestone[];
  predictions: RecoveryPrediction[];
  tips: RecoveryTip[];
  todayFocus: {
    title: string;
    message: string;
  };
}

export class RecoveryTimelineService {
  // Get recovery timeline data based on real user data
  static async getRecoveryTimelineData(userId: string): Promise<RecoveryTimelineData | null> {
    try {
      console.log('🔍 Getting recovery timeline data for user:', userId);

      // Get user's baby profile to determine delivery date and type
      const { data: babyProfiles, error: babyError } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); // Get most recent baby profile

      if (babyError || !babyProfiles || babyProfiles.length === 0) {
        console.error('Error fetching baby profile:', babyError);
        return null;
      }

      // Use the most recent baby profile
      const babyProfile = babyProfiles[0];

      // Get recent health check-ins for analysis
      const { data: recentCheckins, error: checkinsError } = await supabase
        .from('mother_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false })
        .limit(7);

      if (checkinsError) {
        console.error('Error fetching health check-ins:', checkinsError);
      }

      // Calculate days since delivery
      const daysSinceDelivery = this.calculateDaysSinceDelivery(babyProfile.date_of_birth);
      
      // Get recovery progress
      const progressData = await this.getRecoveryProgress(babyProfile, daysSinceDelivery);
      
      // Get milestones based on delivery type and current progress
      const milestones = this.getRecoveryMilestones(babyProfile.delivery_type, daysSinceDelivery);
      
      // Get AI predictions based on health data
      const predictions = this.getAIPredictions(recentCheckins || [], daysSinceDelivery, babyProfile.delivery_type);
      
      // Get personalized tips
      const tips = this.getPersonalizedTips(recentCheckins || [], daysSinceDelivery, babyProfile.delivery_type);
      
      // Get today's focus
      const todayFocus = this.getTodayFocus(daysSinceDelivery, recentCheckins || []);

      return {
        currentPhase: progressData.phase,
        daysSinceDelivery,
        progressPercentage: progressData.percentage,
        milestones,
        predictions,
        tips,
        todayFocus
      };
    } catch (error) {
      console.error('Error getting recovery timeline data:', error);
      return null;
    }
  }

  // Calculate days since delivery
  private static calculateDaysSinceDelivery(deliveryDate: string): number {
    try {
      const delivery = new Date(deliveryDate);
      const today = new Date();
      
      if (isNaN(delivery.getTime()) || delivery > today) {
        return 0;
      }
      
      const diffTime = today.getTime() - delivery.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculating days since delivery:', error);
      return 0;
    }
  }

  // Get recovery progress based on delivery type and days
  private static async getRecoveryProgress(babyProfile: any, daysSinceDelivery: number): Promise<{
    percentage: number;
    phase: string;
  }> {
    const deliveryType = babyProfile.delivery_type;
    let expectedRecoveryDays = 42; // 6 weeks default
    
    if (deliveryType === 'c_section') {
      expectedRecoveryDays = 56; // 8 weeks for C-section
    }

    const percentage = Math.min(Math.round((daysSinceDelivery / expectedRecoveryDays) * 100), 100);
    
    let phase = 'Healing Phase';
    if (daysSinceDelivery <= 7) {
      phase = 'Initial Healing';
    } else if (daysSinceDelivery <= 14) {
      phase = 'Early Recovery';
    } else if (daysSinceDelivery <= 28) {
      phase = 'Recovery Phase';
    } else if (daysSinceDelivery <= 42) {
      phase = 'Strengthening Phase';
    } else if (deliveryType === 'c_section' && daysSinceDelivery <= 56) {
      phase = 'Final Recovery';
    } else {
      phase = 'Recovery Complete';
    }

    return { percentage, phase };
  }

  // Get recovery milestones based on delivery type and current progress
  private static getRecoveryMilestones(deliveryType: string, daysSinceDelivery: number): RecoveryMilestone[] {
    const milestones: RecoveryMilestone[] = [];
    
    if (deliveryType === 'c_section') {
      // C-section specific milestones
      milestones.push(
        {
          day: 7,
          title: 'Incision healing check',
          description: 'Your C-section incision should be healing well. Keep it clean and dry.',
          isAchieved: daysSinceDelivery >= 7,
          isUpcoming: daysSinceDelivery >= 5 && daysSinceDelivery < 7
        },
        {
          day: 14,
          title: 'Staples/stitches removal',
          description: 'If you have external stitches, they may be removed around this time.',
          isAchieved: daysSinceDelivery >= 14,
          isUpcoming: daysSinceDelivery >= 12 && daysSinceDelivery < 14
        },
        {
          day: 21,
          title: 'Increased mobility',
          description: 'You should feel more comfortable with daily activities and light movement.',
          isAchieved: daysSinceDelivery >= 21,
          isUpcoming: daysSinceDelivery >= 19 && daysSinceDelivery < 21
        },
        {
          day: 42,
          title: 'Light exercise clearance',
          description: 'You may be cleared for light exercises and more physical activities.',
          isAchieved: daysSinceDelivery >= 42,
          isUpcoming: daysSinceDelivery >= 40 && daysSinceDelivery < 42
        },
        {
          day: 56,
          title: 'Full recovery milestone',
          description: 'Complete recovery expected. You should feel much stronger and more energetic.',
          isAchieved: daysSinceDelivery >= 56,
          isUpcoming: daysSinceDelivery >= 54 && daysSinceDelivery < 56
        }
      );
    } else {
      // Normal delivery milestones
      milestones.push(
        {
          day: 7,
          title: 'Initial healing complete',
          description: 'Most initial discomfort should be resolved. You should feel more comfortable.',
          isAchieved: daysSinceDelivery >= 7,
          isUpcoming: daysSinceDelivery >= 5 && daysSinceDelivery < 7
        },
        {
          day: 14,
          title: 'Energy improvement',
          description: 'Your energy levels should start improving significantly.',
          isAchieved: daysSinceDelivery >= 14,
          isUpcoming: daysSinceDelivery >= 12 && daysSinceDelivery < 14
        },
        {
          day: 21,
          title: 'Light activities',
          description: 'You can start light household work and gentle exercises.',
          isAchieved: daysSinceDelivery >= 21,
          isUpcoming: daysSinceDelivery >= 19 && daysSinceDelivery < 21
        },
        {
          day: 42,
          title: 'Full recovery expected',
          description: 'Complete recovery milestone with full energy restoration.',
          isAchieved: daysSinceDelivery >= 42,
          isUpcoming: daysSinceDelivery >= 40 && daysSinceDelivery < 42
        }
      );
    }

    return milestones;
  }

  // Get AI predictions based on health data
  private static getAIPredictions(checkins: any[], daysSinceDelivery: number, deliveryType: string): RecoveryPrediction[] {
    const predictions: RecoveryPrediction[] = [];

    if (checkins.length === 0) {
      predictions.push({
        title: 'Start Tracking',
        description: 'Begin logging your daily health metrics to get personalized predictions.',
        type: 'neutral'
      });
      return predictions;
    }

    const latestCheckin = checkins[0];
    const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy_level || 0), 0) / checkins.length;
    const avgMood = checkins.reduce((sum, c) => sum + (c.mood_score || 0), 0) / checkins.length;
    const avgSleep = checkins.reduce((sum, c) => sum + (c.sleep_hours || 0), 0) / checkins.length;

    // Energy-based predictions
    if (avgEnergy >= 7) {
      predictions.push({
        title: 'Excellent Energy Recovery',
        description: `Your energy levels are ${Math.round(avgEnergy * 10)}% - you're recovering faster than average!`,
        type: 'positive'
      });
    } else if (avgEnergy <= 4) {
      predictions.push({
        title: 'Energy Support Needed',
        description: 'Your energy is lower than expected. Focus on rest and nutrition.',
        type: 'insight'
      });
    }

    // Mood-based predictions
    if (avgMood >= 7) {
      predictions.push({
        title: 'Positive Mood Trend',
        description: 'Your mood scores show excellent emotional wellbeing during recovery.',
        type: 'positive'
      });
    } else if (avgMood <= 4) {
      predictions.push({
        title: 'Mood Support',
        description: 'Consider reaching out to your support network or healthcare provider.',
        type: 'insight'
      });
    }

    // Sleep-based predictions
    if (avgSleep >= 7) {
      predictions.push({
        title: 'Good Sleep Recovery',
        description: 'Your sleep patterns are supporting your healing process well.',
        type: 'positive'
      });
    } else if (avgSleep < 5) {
      predictions.push({
        title: 'Sleep Optimization',
        description: 'Try to nap when baby sleeps to improve your rest quality.',
        type: 'insight'
      });
    }

    // Recovery speed prediction
    const expectedDays = deliveryType === 'c_section' ? 56 : 42;
    const recoverySpeed = (daysSinceDelivery / expectedDays) * 100;
    
    if (recoverySpeed < 80 && avgEnergy >= 6) {
      predictions.push({
        title: 'Faster Recovery',
        description: `You're healing ${Math.round(100 - recoverySpeed)}% faster than expected based on your energy levels.`,
        type: 'positive'
      });
    }

    return predictions;
  }

  // Get personalized tips based on user data
  private static getPersonalizedTips(checkins: any[], daysSinceDelivery: number, deliveryType: string): RecoveryTip[] {
    const tips: RecoveryTip[] = [];

    if (checkins.length === 0) {
      tips.push({
        title: 'Start Health Tracking',
        description: 'Begin logging your daily health metrics to get personalized recovery tips.',
        category: 'health'
      });
      return tips;
    }

    const latestCheckin = checkins[0];
    const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy_level || 0), 0) / checkins.length;
    const avgSleep = checkins.reduce((sum, c) => sum + (c.sleep_hours || 0), 0) / checkins.length;

    // Sleep tips
    if (avgSleep < 6) {
      tips.push({
        title: 'Sleep Quality',
        description: 'Your sleep hours are below optimal. Try to nap when baby sleeps and maintain a consistent bedtime routine.',
        category: 'sleep'
      });
    } else {
      tips.push({
        title: 'Sleep Maintenance',
        description: 'Great job maintaining good sleep! Continue your current sleep routine.',
        category: 'sleep'
      });
    }

    // Energy tips
    if (avgEnergy < 5) {
      tips.push({
        title: 'Energy Boost',
        description: 'Focus on light movement, proper nutrition, and adequate rest to boost your energy levels.',
        category: 'health'
      });
    }

    // Delivery-specific tips
    if (deliveryType === 'c_section') {
      if (daysSinceDelivery < 14) {
        tips.push({
          title: 'C-section Care',
          description: 'Keep your incision clean and dry. Avoid heavy lifting and support your abdomen when moving.',
          category: 'health'
        });
      } else if (daysSinceDelivery < 42) {
        tips.push({
          title: 'Gradual Activity',
          description: 'You can start light activities but avoid strenuous exercise until cleared by your doctor.',
          category: 'health'
        });
      }
    }

    // Family support tip
    tips.push({
      title: 'Family Support',
      description: 'Don\'t hesitate to ask for help from family and friends. Your recovery is important.',
      category: 'family'
    });

    return tips;
  }

  // Get today's focus based on current progress
  private static getTodayFocus(daysSinceDelivery: number, checkins: any[]): {
    title: string;
    message: string;
  } {
    if (checkins.length === 0) {
      return {
        title: 'Start Your Journey',
        message: 'Begin tracking your daily health metrics to get personalized recovery insights.'
      };
    }

    const latestCheckin = checkins[0];
    
    // Check for concerning patterns
    if (latestCheckin.energy_level <= 3) {
      return {
        title: 'Energy Support',
        message: 'Your energy levels are low. Focus on rest, gentle movement, and proper nutrition today.'
      };
    }
    
    if (latestCheckin.mood_score <= 3) {
      return {
        title: 'Emotional Wellbeing',
        message: 'Take time for self-care today. Consider reaching out to your support network.'
      };
    }
    
    if (latestCheckin.sleep_hours < 5) {
      return {
        title: 'Sleep Recovery',
        message: 'Try to nap when baby sleeps to improve your rest quality today.'
      };
    }

    // Default focus based on recovery phase
    if (daysSinceDelivery <= 7) {
      return {
        title: 'Initial Recovery',
        message: 'Focus on rest and gentle movement. Your body is healing from delivery.'
      };
    } else if (daysSinceDelivery <= 14) {
      return {
        title: 'Early Recovery',
        message: 'You should start feeling more comfortable. Continue with gentle activities.'
      };
    } else if (daysSinceDelivery <= 28) {
      return {
        title: 'Building Strength',
        message: 'You can start light activities. Listen to your body and don\'t overexert.'
      };
    } else {
      return {
        title: 'Continued Recovery',
        message: 'You\'re doing well! Continue with your daily routine and self-care.'
      };
    }
  }

  // Process voice transcript for recovery questions
  static async processVoiceTranscript(userId: string, transcript: string): Promise<{
    analysis: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      // Save voice check-in
      const { data: voiceCheckin, error: saveError } = await supabase
        .from('voice_checkins')
        .insert({
          user_id: userId,
          transcript,
          checkin_date: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving voice check-in:', saveError);
      }

      // Use AI service for intelligent analysis
      const recoveryData = await this.getRecoveryTimelineData(userId);
      const aiInsights = await AIService.generateRecoveryTimelineInsights(userId, {
        ...recoveryData,
        voiceTranscript: transcript
      });

      // Extract analysis from AI insights
      const analysis = aiInsights.length > 0 ? aiInsights[0].description : this.analyzeTranscript(transcript);
      const recommendations = aiInsights.length > 0 ? [aiInsights[0].recommendation] : this.generateRecommendations(transcript, analysis);
      const riskLevel = this.assessRiskLevel(transcript, analysis);

      // Update the voice check-in with analysis
      if (voiceCheckin) {
        await supabase
          .from('voice_checkins')
          .update({
            ai_analysis: analysis,
            recommendations: recommendations.join('; '),
            risk_level: riskLevel
          })
          .eq('id', voiceCheckin.id);
      }

      return {
        analysis,
        recommendations,
        riskLevel
      };
    } catch (error) {
      console.error('Error processing voice transcript:', error);
      return {
        analysis: 'Unable to analyze your message at this time.',
        recommendations: ['Please try again or contact your healthcare provider if you have urgent concerns.'],
        riskLevel: 'low'
      };
    }
  }

  // Analyze transcript for key concerns
  private static analyzeTranscript(transcript: string): string {
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for concerning keywords
    const painKeywords = ['pain', 'hurt', 'ache', 'sore', 'uncomfortable'];
    const bleedingKeywords = ['bleeding', 'blood', 'discharge'];
    const feverKeywords = ['fever', 'temperature', 'hot', 'chills'];
    const moodKeywords = ['sad', 'depressed', 'anxious', 'worried', 'scared'];
    const energyKeywords = ['tired', 'exhausted', 'weak', 'energy'];
    
    let analysis = 'Thank you for sharing your recovery update. ';
    
    if (painKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      analysis += 'I notice you mentioned some discomfort. ';
    }
    
    if (bleedingKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      analysis += 'You mentioned bleeding - this is important to monitor. ';
    }
    
    if (feverKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      analysis += 'Fever or temperature changes need immediate attention. ';
    }
    
    if (moodKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      analysis += 'Your emotional wellbeing is important during recovery. ';
    }
    
    if (energyKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      analysis += 'Energy levels are a key indicator of recovery progress. ';
    }
    
    analysis += 'Continue monitoring your symptoms and don\'t hesitate to contact your healthcare provider if you have concerns.';
    
    return analysis;
  }

  // Generate recommendations based on transcript
  private static generateRecommendations(transcript: string, analysis: string): string[] {
    const recommendations: string[] = [];
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('pain') || lowerTranscript.includes('hurt')) {
      recommendations.push('Apply ice packs to reduce inflammation');
      recommendations.push('Take prescribed pain medication as directed');
      recommendations.push('Contact your doctor if pain worsens');
    }
    
    if (lowerTranscript.includes('bleeding') || lowerTranscript.includes('blood')) {
      recommendations.push('Monitor bleeding amount and color');
      recommendations.push('Contact your healthcare provider immediately if bleeding increases');
    }
    
    if (lowerTranscript.includes('fever') || lowerTranscript.includes('temperature')) {
      recommendations.push('Take your temperature regularly');
      recommendations.push('Contact your healthcare provider immediately if fever persists');
    }
    
    if (lowerTranscript.includes('tired') || lowerTranscript.includes('energy')) {
      recommendations.push('Ensure you\'re getting adequate rest');
      recommendations.push('Try to nap when baby sleeps');
      recommendations.push('Eat nutritious meals to support energy levels');
    }
    
    if (lowerTranscript.includes('sad') || lowerTranscript.includes('depressed')) {
      recommendations.push('Reach out to your support network');
      recommendations.push('Consider speaking with a mental health professional');
      recommendations.push('Practice self-care activities you enjoy');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring your recovery progress');
      recommendations.push('Maintain your current self-care routine');
    }
    
    return recommendations;
  }

  // Assess risk level based on transcript
  private static assessRiskLevel(transcript: string, analysis: string): 'low' | 'medium' | 'high' {
    const lowerTranscript = transcript.toLowerCase();
    
    // High risk indicators
    if (lowerTranscript.includes('severe') || 
        lowerTranscript.includes('emergency') || 
        lowerTranscript.includes('urgent') ||
        lowerTranscript.includes('fever') ||
        lowerTranscript.includes('heavy bleeding')) {
      return 'high';
    }
    
    // Medium risk indicators
    if (lowerTranscript.includes('pain') || 
        lowerTranscript.includes('bleeding') || 
        lowerTranscript.includes('concerned') ||
        lowerTranscript.includes('worried')) {
      return 'medium';
    }
    
    return 'low';
  }
}
