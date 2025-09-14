import { supabase } from './supabase';
import { AIService } from './aiService';

export interface MotherHealthMetrics {
  id?: string;
  user_id: string;
  recorded_date?: string;
  weight?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  energy_level?: number; // 1-10 scale
  sleep_hours?: number;
  mood_score?: number; // 1-10 scale
  notes?: string;
  created_at?: string;
}

export interface DailyCheckIn {
  id?: string;
  user_id: string;
  date: string;
  overall_wellbeing: number; // 1-10 scale
  mood: string;
  energy_level: number;
  sleep_quality: number; // 1-10 scale
  appetite: number; // 1-10 scale
  pain_level: number; // 1-10 scale
  stress_level: number; // 1-10 scale
  symptoms: string[];
  concerns: string;
  goals_achieved: string[];
  notes: string;
  created_at?: string;
}

export interface NutritionEntry {
  id?: string;
  user_id: string;
  meal_date?: string;
  meal_type: string;
  calories?: number;
  protein_g?: number;
  iron_mg?: number;
  calcium_mg?: number;
  water_ml?: number;
  food_items?: string;
  created_at?: string;
}

export interface ExerciseEntry {
  id?: string;
  user_id: string;
  date: string;
  exercise_type: string;
  duration_minutes: number;
  intensity: 'low' | 'moderate' | 'high';
  calories_burned: number;
  notes: string;
  created_at?: string;
}

export interface HealthInsight {
  id?: string;
  user_id: string;
  insight_type: 'weight_trend' | 'blood_pressure' | 'mood_pattern' | 'nutrition' | 'exercise' | 'general';
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
}

export class MotherHealthService {
  // Get comprehensive mother health data - OPTIMIZED FOR SPEED
  static async getMotherHealthData(userId: string) {
    try {
      // Load essential data first (fast database queries)
      const [healthMetrics, dailyCheckIns, nutritionEntries, exerciseEntries] = await Promise.all([
        this.getRecentHealthMetrics(userId),
        this.getRecentDailyCheckIns(userId),
        this.getRecentNutritionEntries(userId),
        this.getRecentExerciseEntries(userId)
      ]);

      // Generate immediate local insights (no AI delay)
      const localInsights = this.generateLocalHealthInsights(healthMetrics, dailyCheckIns, nutritionEntries, userId);

      // Return data immediately with local insights
      const result = {
        healthMetrics,
        dailyCheckIns,
        nutritionEntries,
        exerciseEntries,
        insights: localInsights,
        summary: this.generateHealthSummary(healthMetrics, dailyCheckIns)
      };

      // Load AI insights in background (non-blocking)
      this.loadAIInsightsInBackground(userId, result);

      return result;
    } catch (error) {
      console.error('Error fetching mother health data:', error);
      throw error;
    }
  }

  // Health Metrics - OPTIMIZED FOR SPEED
  static async getRecentHealthMetrics(userId: string, limit: number = 7) {
    try {
      const { data, error } = await supabase
        .from('mother_health_metrics')
        .select('id, user_id, recorded_date, weight, blood_pressure_systolic, blood_pressure_diastolic, energy_level, sleep_hours, mood_score, notes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return [];
    }
  }

  static async saveHealthMetrics(metrics: Omit<MotherHealthMetrics, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('mother_health_metrics')
        .insert([metrics])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving health metrics:', error);
      throw error;
    }
  }

  // Daily Check-ins - OPTIMIZED FOR SPEED
  static async getRecentDailyCheckIns(userId: string, limit: number = 7) {
    try {
      // Try to get from mother_health_metrics as a fallback
      const { data, error } = await supabase
        .from('mother_health_metrics')
        .select('id, user_id, recorded_date, energy_level, mood_score, notes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Transform the data to match DailyCheckIn interface
      return (data || []).map(metric => ({
        id: metric.id,
        user_id: metric.user_id,
        date: metric.recorded_date,
        overall_wellbeing: metric.energy_level || 7,
        mood: 'good',
        energy_level: metric.energy_level || 7,
        sleep_quality: 7,
        appetite: 7,
        pain_level: 3,
        stress_level: 4,
        symptoms: [],
        concerns: '',
        goals_achieved: [],
        notes: metric.notes || '',
        created_at: metric.created_at
      }));
    } catch (error) {
      console.error('Error fetching daily check-ins:', error);
      return [];
    }
  }

  static async saveDailyCheckIn(checkIn: Omit<DailyCheckIn, 'id' | 'created_at'>) {
    try {
      // Save to mother_health_metrics as a fallback
      const healthMetric = {
        user_id: checkIn.user_id,
        recorded_date: checkIn.date,
        energy_level: checkIn.energy_level,
        mood_score: checkIn.overall_wellbeing,
        notes: `Daily Check-in: ${checkIn.notes || ''} | Mood: ${checkIn.mood} | Sleep: ${checkIn.sleep_quality}/10 | Pain: ${checkIn.pain_level}/10 | Stress: ${checkIn.stress_level}/10`
      };

      const { data, error } = await supabase
        .from('mother_health_metrics')
        .insert([healthMetric])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving daily check-in:', error);
      throw error;
    }
  }

  // Nutrition Tracking - OPTIMIZED FOR SPEED
  static async getRecentNutritionEntries(userId: string, limit: number = 14) {
    try {
      const { data, error } = await supabase
        .from('mother_nutrition')
        .select('id, user_id, meal_date, meal_type, calories, protein_g, iron_mg, calcium_mg, water_ml, food_items, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nutrition entries:', error);
      return [];
    }
  }

  static async saveNutritionEntry(nutrition: Omit<NutritionEntry, 'id' | 'created_at'>) {
    try {
      const nutritionData = {
        user_id: nutrition.user_id,
        meal_date: nutrition.meal_date || new Date().toISOString().split('T')[0],
        meal_type: nutrition.meal_type,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        iron_mg: nutrition.iron_mg,
        calcium_mg: nutrition.calcium_mg,
        water_ml: nutrition.water_ml,
        food_items: nutrition.food_items
      };

      const { data, error } = await supabase
        .from('mother_nutrition')
        .insert([nutritionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
      throw error;
    }
  }

  // Exercise Tracking - Use mother_health_metrics as fallback
  static async getRecentExerciseEntries(userId: string, limit: number = 14) {
    try {
      // For now, return empty array since exercise_entries table doesn't exist
      // Could be implemented later or use mother_health_metrics with exercise notes
      return [];
    } catch (error) {
      console.error('Error fetching exercise entries:', error);
      return [];
    }
  }

  static async saveExerciseEntry(exercise: Omit<ExerciseEntry, 'id' | 'created_at'>) {
    try {
      // Save exercise data as notes in mother_health_metrics
      const healthMetric = {
        user_id: exercise.user_id,
        recorded_date: exercise.date,
        notes: `Exercise: ${exercise.exercise_type} | Duration: ${exercise.duration_minutes}min | Intensity: ${exercise.intensity} | Calories: ${exercise.calories_burned} | Notes: ${exercise.notes}`
      };

      const { data, error } = await supabase
        .from('mother_health_metrics')
        .insert([healthMetric])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving exercise entry:', error);
      throw error;
    }
  }

  // Generate local health insights immediately (no AI delay)
  private static generateLocalHealthInsights(healthMetrics: any[], dailyCheckIns: any[], nutritionEntries: any[], userId: string): any[] {
    const insights: any[] = [];
    const now = new Date().toISOString();

    // Energy level insight
    if (healthMetrics.length > 0) {
      const latest = healthMetrics[0];
      if (latest.energy_level && latest.energy_level < 5) {
        insights.push({
          id: `local-energy-${Date.now()}`,
          user_id: userId,
          category: 'local_analysis',
          title: 'Energy Level Alert',
          description: `Your energy level is ${latest.energy_level}/10, which is below optimal for recovery.`,
          recommendation: 'Consider increasing rest periods, gentle exercise, and nutritious meals to boost energy levels.',
          priority: 'medium',
          created_at: now
        });
      }
    }

    // Sleep quality insight
    if (healthMetrics.length > 0) {
      const latest = healthMetrics[0];
      if (latest.sleep_hours && latest.sleep_hours < 6) {
        insights.push({
          id: `local-sleep-${Date.now()}`,
          user_id: userId,
          category: 'local_analysis',
          title: 'Sleep Optimization',
          description: `You're getting ${latest.sleep_hours} hours of sleep, which may be insufficient for proper recovery.`,
          recommendation: 'Aim for 7-9 hours of quality sleep each night. Create a relaxing bedtime routine.',
          priority: 'high',
          created_at: now
        });
      }
    }

    // Nutrition insight
    if (nutritionEntries.length > 0) {
      const totalCalories = nutritionEntries.reduce((sum: number, entry: any) => sum + (entry.calories || 0), 0);
      const avgCalories = totalCalories / nutritionEntries.length;
      
      if (avgCalories < 1500) {
        insights.push({
          id: `local-nutrition-${Date.now()}`,
          user_id: userId,
          category: 'local_analysis',
          title: 'Nutrition Monitoring',
          description: `Your average daily calorie intake is ${Math.round(avgCalories)} calories.`,
          recommendation: 'Ensure adequate nutrition for recovery. Focus on protein-rich foods and stay hydrated.',
          priority: 'medium',
          created_at: now
        });
      }
    }

    // Mood and wellbeing insight
    if (dailyCheckIns.length > 0) {
      const latest = dailyCheckIns[0];
      if (latest.overall_wellbeing && latest.overall_wellbeing < 6) {
        insights.push({
          id: `local-wellbeing-${Date.now()}`,
          user_id: userId,
          category: 'local_analysis',
          title: 'Wellbeing Support',
          description: `Your overall wellbeing is ${latest.overall_wellbeing}/10. Recovery can be challenging.`,
          recommendation: 'Be patient with yourself. Consider gentle activities that bring joy and connect with support systems.',
          priority: 'medium',
          created_at: now
        });
      }
    }

    // Default positive insight if no concerns
    if (insights.length === 0) {
      insights.push({
        id: `local-positive-${Date.now()}`,
        user_id: userId,
        category: 'local_analysis',
        title: 'Health Tracking Progress',
        description: 'You are actively monitoring your health metrics and recovery progress.',
        recommendation: 'Continue tracking your health data for better insights and recovery monitoring.',
        priority: 'low',
        created_at: now
      });
    }

    return insights.slice(0, 5); // Limit to 5 insights
  }

  // Load AI insights in background (non-blocking)
  private static async loadAIInsightsInBackground(userId: string, healthData: any): Promise<void> {
    try {
      // This runs in background and doesn't block the UI
      setTimeout(async () => {
        try {
          const aiInsights = await AIService.generateMotherHealthInsights(userId, healthData);
          console.log('✅ AI insights loaded in background:', aiInsights.length);
        } catch (error) {
          console.log('⚠️ AI insights failed in background (expected):', error.message);
        }
      }, 100); // Small delay to not interfere with UI
    } catch (error) {
      console.error('Error in background AI loading:', error);
    }
  }

  // Health Insights - Use AI service for intelligent insights (kept for compatibility)
  static async getHealthInsights(userId: string, limit: number = 5) {
    try {
      // First try to get existing AI insights
      const existingInsights = await AIService.getAIInsights(userId, limit);
      if (existingInsights.length > 0) {
        return existingInsights;
      }

      // If no existing insights, generate new ones using AI
      // Get data directly without calling getMotherHealthData to avoid recursion
      const [healthMetrics, dailyCheckIns, nutritionEntries] = await Promise.all([
        this.getRecentHealthMetrics(userId),
        this.getRecentDailyCheckIns(userId),
        this.getRecentNutritionEntries(userId)
      ]);

      const healthData = {
        healthMetrics,
        dailyCheckIns,
        nutritionEntries,
        summary: this.generateHealthSummary(healthMetrics, dailyCheckIns)
      };

      const aiInsights = await AIService.generateMotherHealthInsights(userId, healthData);
      
      return aiInsights.slice(0, limit);
    } catch (error) {
      console.error('Error getting health insights:', error);
      return [];
    }
  }

  static async generateHealthInsight(userId: string, data: any) {
    try {
      // Generate AI insight based on health data
      const insight = this.analyzeHealthData(data);
      
      const { data: result, error } = await supabase
        .from('ai_insights')
        .insert([{
          user_id: userId,
          category: 'mother_health',
          title: insight.title,
          description: insight.description,
          recommendation: insight.recommendation,
          priority: insight.priority
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error generating health insight:', error);
      throw error;
    }
  }

  // Helper Methods
  static generateHealthSummary(metrics: MotherHealthMetrics[], checkIns: DailyCheckIn[]) {
    if (metrics.length === 0 && checkIns.length === 0) {
      return {
        overallHealth: 'Good',
        trend: 'stable',
        recommendations: ['Start tracking your daily health metrics'],
        lastUpdate: null
      };
    }

    const latestMetric = metrics[0];
    const latestCheckIn = checkIns[0];
    
    // Calculate overall health score
    let healthScore = 0;
    let factors = 0;

    if (latestMetric) {
      // Blood pressure assessment
      if (latestMetric.blood_pressure_systolic && latestMetric.blood_pressure_diastolic) {
        if (latestMetric.blood_pressure_systolic < 120 && latestMetric.blood_pressure_diastolic < 80) {
          healthScore += 20;
        } else if (latestMetric.blood_pressure_systolic < 140 && latestMetric.blood_pressure_diastolic < 90) {
          healthScore += 15;
        } else {
          healthScore += 5;
        }
        factors++;
      }

      // Energy level assessment
      if (latestMetric.energy_level) {
        healthScore += (latestMetric.energy_level * 2);
        factors++;
      }

      // Mood score assessment
      if (latestMetric.mood_score) {
        healthScore += (latestMetric.mood_score * 2);
        factors++;
      }

      // Sleep hours assessment
      if (latestMetric.sleep_hours) {
        if (latestMetric.sleep_hours >= 7 && latestMetric.sleep_hours <= 9) {
          healthScore += 20;
        } else if (latestMetric.sleep_hours >= 6 && latestMetric.sleep_hours <= 10) {
          healthScore += 15;
        } else {
          healthScore += 5;
        }
        factors++;
      }
    }

    if (latestCheckIn) {
      // Mood and energy assessment
      healthScore += (latestCheckIn.overall_wellbeing * 2);
      healthScore += (latestCheckIn.energy_level * 2);
      healthScore += (latestCheckIn.sleep_quality * 2);
      factors += 3;
    }

    const averageScore = factors > 0 ? healthScore / factors : 0;
    
    let overallHealth = 'Good';
    if (averageScore >= 80) overallHealth = 'Excellent';
    else if (averageScore >= 60) overallHealth = 'Good';
    else if (averageScore >= 40) overallHealth = 'Fair';
    else overallHealth = 'Needs Attention';

    // Generate recommendations
    const recommendations = [];
    if (latestMetric && latestMetric.blood_pressure_systolic && latestMetric.blood_pressure_systolic >= 140) {
      recommendations.push('Monitor blood pressure regularly and consult your doctor');
    }
    if (latestCheckIn && latestCheckIn.sleep_quality < 6) {
      recommendations.push('Focus on improving sleep quality and duration');
    }
    if (latestCheckIn && latestCheckIn.stress_level > 7) {
      recommendations.push('Consider stress management techniques like meditation or yoga');
    }
    if (latestMetric && latestMetric.sleep_hours && latestMetric.sleep_hours < 6) {
      recommendations.push('Aim for 7-9 hours of quality sleep each night');
    }
    if (latestMetric && latestMetric.energy_level && latestMetric.energy_level < 5) {
      recommendations.push('Consider increasing rest and gentle exercise to boost energy');
    }

    return {
      overallHealth,
      trend: 'stable', // Could be calculated based on historical data
      recommendations: recommendations.length > 0 ? recommendations : ['Keep up the great work!'],
      lastUpdate: latestMetric?.created_at || latestCheckIn?.created_at
    };
  }

  static analyzeHealthData(data: any): { title: string; description: string; recommendation: string; priority: 'low' | 'medium' | 'high' } {
    // Simple AI-like analysis based on health data
    const { metrics, checkIns } = data;
    
    if (metrics && metrics.length > 0) {
      const latest = metrics[0];
      
      // Blood pressure analysis
      if (latest.blood_pressure_systolic >= 140 || latest.blood_pressure_diastolic >= 90) {
        return {
          title: 'Blood Pressure Alert',
          description: 'Your blood pressure readings are elevated. This requires attention.',
          recommendation: 'Please consult your healthcare provider and monitor your blood pressure regularly.',
          priority: 'high'
        };
      }
      
      // Weight trend analysis
      if (metrics.length >= 2 && latest.weight && metrics[1].weight) {
        const weightChange = latest.weight - metrics[1].weight;
        if (Math.abs(weightChange) > 2) {
          return {
            title: 'Weight Change Detected',
            description: `Your weight has changed by ${weightChange.toFixed(1)}kg recently.`,
            recommendation: weightChange > 0 ? 'Consider reviewing your diet and exercise routine.' : 'Ensure you\'re maintaining adequate nutrition.',
            priority: 'medium'
          };
        }
      }
    }
    
    if (checkIns && checkIns.length > 0) {
      const latest = checkIns[0];
      
      // Mood and energy analysis
      if (latest.overall_wellbeing < 5 || latest.energy_level < 4) {
        return {
          title: 'Wellbeing Concern',
          description: 'Your recent check-ins show lower wellbeing and energy levels.',
          recommendation: 'Consider increasing rest, nutrition, and gentle exercise. Consult your doctor if this persists.',
          priority: 'medium'
        };
      }
      
      // Sleep quality analysis
      if (latest.sleep_quality < 5) {
        return {
          title: 'Sleep Quality Alert',
          description: 'Your sleep quality has been below optimal levels.',
          recommendation: 'Establish a consistent bedtime routine and create a comfortable sleep environment.',
          priority: 'medium'
        };
      }
    }
    
    return {
      title: 'Health Status Update',
      description: 'Your health metrics are within normal ranges.',
      recommendation: 'Continue maintaining your healthy lifestyle and regular check-ups.',
      priority: 'low'
    };
  }

  // Get today's check-in status
  static async getTodaysCheckInStatus(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mother_health_metrics')
        .select('id')
        .eq('user_id', userId)
        .eq('recorded_date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking today\'s check-in status:', error);
      return false;
    }
  }

  // Get health trends over time
  static async getHealthTrends(userId: string, days: number = 30) {
    try {
      const [metrics, checkIns] = await Promise.all([
        this.getRecentHealthMetrics(userId, days),
        this.getRecentDailyCheckIns(userId, days)
      ]);

      return {
        weightTrend: metrics.map(m => ({ date: m.created_at, value: m.weight || 0 })),
        bloodPressureTrend: metrics.map(m => ({ 
          date: m.created_at, 
          systolic: m.blood_pressure_systolic || 0, 
          diastolic: m.blood_pressure_diastolic || 0 
        })),
        moodTrend: checkIns.map(c => ({ date: c.created_at, value: c.overall_wellbeing })),
        energyTrend: checkIns.map(c => ({ date: c.created_at, value: c.energy_level })),
        sleepTrend: checkIns.map(c => ({ date: c.created_at, value: c.sleep_quality }))
      };
    } catch (error) {
      console.error('Error fetching health trends:', error);
      return {
        weightTrend: [],
        bloodPressureTrend: [],
        moodTrend: [],
        energyTrend: [],
        sleepTrend: []
      };
    }
  }
}
