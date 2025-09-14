import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path, Circle, G, Rect } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
import VoiceRecorder from '../components/VoiceRecorder';
import { useAuth } from '../contexts/AuthContext';
import { MotherHealthService, MotherHealthMetrics, DailyCheckIn, NutritionEntry, ExerciseEntry } from '../lib/motherHealthService';

const { width } = Dimensions.get('window');

interface NutritionMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface Meal {
  name: string;
  calories: number;
  status: 'completed' | 'planned' | 'skipped';
  time: string;
}

interface HealthMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'needs_attention';
  trend: 'up' | 'down' | 'stable';
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'success';
  delay: number;
}

// Custom icons for mother health features
const LogMealIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={Colors.primary}
    />
    <Circle cx="12" cy="12" r="3" fill={Colors.secondary} />
  </Svg>
);

const WaterIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2V7z"
      fill={Colors.primary}
    />
    <Path
      d="M12 6v6l4 2"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const HealthIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.warning}
    />
    <Path
      d="M12 6v6l4 2"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const TipsIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={Colors.primary}
    />
    <Circle cx="12" cy="12" r="3" fill={Colors.secondary} />
  </Svg>
);

const NutritionBar = ({ metric, delay }: { metric: NutritionMetric; delay: number }) => {
  const barOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    barWidth.value = withDelay(
      delay + 200,
      withTiming(metric.current / metric.target, { duration: 800, easing: Easing.out(Easing.quad) })
    );
  }, [delay, metric.current, metric.target]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    opacity: barOpacity.value,
  }));

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  const getProgressColor = () => {
    const progress = metric.current / metric.target;
    if (progress >= 0.8) return Colors.primary;
    if (progress >= 0.6) return Colors.warning;
    return Colors.danger;
  };

  return (
    <Animated.View style={[styles.nutritionItem, animatedBarStyle]}>
      <View style={styles.nutritionHeader}>
        <Text style={styles.nutritionName}>{metric.name}</Text>
        <Text style={styles.nutritionValue}>
          {metric.current}/{metric.target} {metric.unit}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[
            styles.progressBarFill,
            { backgroundColor: getProgressColor() },
            animatedFillStyle
          ]} />
        </View>
        <Text style={styles.progressPercentage}>
          {Math.round((metric.current / metric.target) * 100)}%
        </Text>
      </View>
    </Animated.View>
  );
};

const MealItem = ({ meal, delay }: { meal: Meal; delay: number }) => {
  const mealOpacity = useSharedValue(0);
  const mealTranslateX = useSharedValue(-20);

  useEffect(() => {
    mealOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    mealTranslateX.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getStatusColor = () => {
    switch (meal.status) {
      case 'completed':
        return Colors.primary;
      case 'planned':
        return Colors.warning;
      case 'skipped':
        return Colors.danger;
      default:
        return Colors.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (meal.status) {
      case 'completed':
        return '✅';
      case 'planned':
        return '⏰';
      case 'skipped':
        return '❌';
      default:
        return '•';
    }
  };

  const animatedMealStyle = useAnimatedStyle(() => ({
    opacity: mealOpacity.value,
    transform: [{ translateX: mealTranslateX.value }],
  }));

  return (
    <Animated.View style={[styles.mealItem, animatedMealStyle]}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{getStatusIcon()} {meal.name}</Text>
        <Text style={styles.mealTime}>{meal.time}</Text>
      </View>
      <View style={styles.mealDetails}>
        <Text style={[styles.mealCalories, { color: getStatusColor() }]}>
          {meal.calories} kcal
        </Text>
        <Text style={[styles.mealStatus, { color: getStatusColor() }]}>
          {meal.status.charAt(0).toUpperCase() + meal.status.slice(1)}
        </Text>
      </View>
    </Animated.View>
  );
};

const HealthMetricCard = ({ metric, delay }: { metric: HealthMetric; delay: number }) => {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);

  useEffect(() => {
    cardOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    cardScale.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getStatusColor = () => {
    switch (metric.status) {
      case 'good':
        return Colors.primary;
      case 'warning':
        return Colors.warning;
      case 'needs_attention':
        return Colors.danger;
      default:
        return Colors.textMuted;
    }
  };

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '•';
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View style={[styles.healthMetricCard, animatedCardStyle]}>
      <View style={styles.healthMetricHeader}>
        <Text style={styles.healthMetricName}>{metric.name}</Text>
        <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
      </View>
      <Text style={[styles.healthMetricValue, { color: getStatusColor() }]}>
        {metric.value}
      </Text>
      <Text style={[styles.healthMetricStatus, { color: getStatusColor() }]}>
        {metric.status.replace('_', ' ').toUpperCase()}
      </Text>
    </Animated.View>
  );
};

const QuickAction = ({ title, icon, onPress, type, delay }: QuickActionProps) => {
  const actionOpacity = useSharedValue(0);
  const actionScale = useSharedValue(0.9);

  useEffect(() => {
    actionOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    actionScale.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryActionButton;
      case 'secondary':
        return styles.secondaryActionButton;
      case 'success':
        return styles.successActionButton;
      default:
        return styles.secondaryActionButton;
    }
  };

  const animatedActionStyle = useAnimatedStyle(() => ({
    opacity: actionOpacity.value,
    transform: [{ scale: actionScale.value }],
  }));

  return (
    <Animated.View style={animatedActionStyle}>
      <TouchableOpacity style={[styles.actionButton, getButtonStyle()]} onPress={onPress}>
        <View style={styles.actionIcon}>{icon}</View>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MotherHealthScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Data state
  const [healthData, setHealthData] = useState<any>(null);
  const [todaysCheckInStatus, setTodaysCheckInStatus] = useState(false);
  
  // Modal states
  const [showDailyCheckInModal, setShowDailyCheckInModal] = useState(false);
  const [showHealthMetricsModal, setShowHealthMetricsModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  
  // Form data
  const [checkInData, setCheckInData] = useState({
    overall_wellbeing: 7,
    mood: 'good',
    energy_level: 7,
    sleep_quality: 7,
    appetite: 7,
    pain_level: 3,
    stress_level: 4,
    symptoms: [] as string[],
    concerns: '',
    goals_achieved: [] as string[],
    notes: ''
  });
  
  const [healthMetricsData, setHealthMetricsData] = useState({
    weight: 0,
    blood_pressure_systolic: 0,
    blood_pressure_diastolic: 0,
    energy_level: 7,
    sleep_hours: 0,
    mood_score: 7,
    notes: ''
  });
  
  const [nutritionData, setNutritionData] = useState({
    meal_type: 'breakfast',
    calories: 0,
    protein_g: 0,
    iron_mg: 0,
    calcium_mg: 0,
    water_ml: 0,
    food_items: ''
  });
  
  const [exerciseData, setExerciseData] = useState({
    exercise_type: '',
    duration_minutes: 0,
    intensity: 'moderate' as 'low' | 'moderate' | 'high',
    calories_burned: 0,
    notes: ''
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  const healthScorePulse = useSharedValue(1);

  // Load mother health data
  const loadMotherHealthData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [healthDataResult, checkInStatus] = await Promise.all([
        MotherHealthService.getMotherHealthData(user.id),
        MotherHealthService.getTodaysCheckInStatus(user.id)
      ]);
      
      setHealthData(healthDataResult);
      setTodaysCheckInStatus(checkInStatus);
      
      // Trigger animations when data is loaded
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

    sectionOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    sectionTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    healthScorePulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
      
    } catch (error) {
      console.error('Error loading mother health data:', error);
      setError('Failed to load health data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMotherHealthData();
  }, [user]);

  // Handler functions
  const handleVoiceStart = () => {
    setIsListening(true);
  };

  const handleVoiceStop = () => {
    setIsListening(false);
  };

  const handleVoiceTranscript = async (text: string) => {
    if (!user) return;
    
    try {
      // Process voice transcript for health data
      const healthMetrics: Omit<MotherHealthMetrics, 'id' | 'created_at'> = {
        user_id: user.id,
        recorded_date: new Date().toISOString().split('T')[0],
        energy_level: 7,
        mood_score: 7,
        notes: `Voice input: ${text}`
      };
      
      await MotherHealthService.saveHealthMetrics(healthMetrics);
      Alert.alert('Success', 'Voice input processed and saved!');
      loadMotherHealthData();
    } catch (error) {
      console.error('Error processing voice transcript:', error);
      Alert.alert('Error', 'Failed to process voice input. Please try again.');
    }
  };

  const handleDailyCheckIn = () => {
    setShowDailyCheckInModal(true);
  };

  const handleHealthMetrics = () => {
    setShowHealthMetricsModal(true);
  };

  const handleLogNutrition = () => {
    setShowNutritionModal(true);
  };

  const handleLogExercise = () => {
    setShowExerciseModal(true);
  };

  const handleSubmitDailyCheckIn = async () => {
    if (!user) return;
    
    try {
      const checkIn: Omit<DailyCheckIn, 'id' | 'created_at'> = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        ...checkInData
      };
      
      await MotherHealthService.saveDailyCheckIn(checkIn);
      Alert.alert('Success', 'Daily check-in saved successfully!');
      setShowDailyCheckInModal(false);
      setTodaysCheckInStatus(true);
      loadMotherHealthData();
    } catch (error) {
      console.error('Error saving daily check-in:', error);
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    }
  };

  const handleSubmitHealthMetrics = async () => {
    if (!user) return;
    
    try {
      const metrics: Omit<MotherHealthMetrics, 'id' | 'created_at'> = {
        user_id: user.id,
        ...healthMetricsData
      };
      
      await MotherHealthService.saveHealthMetrics(metrics);
      Alert.alert('Success', 'Health metrics saved successfully!');
      setShowHealthMetricsModal(false);
      loadMotherHealthData();
    } catch (error) {
      console.error('Error saving health metrics:', error);
      Alert.alert('Error', 'Failed to save health metrics. Please try again.');
    }
  };

  const handleSubmitNutrition = async () => {
    if (!user) return;
    
    try {
      const nutrition: Omit<NutritionEntry, 'id' | 'created_at'> = {
        user_id: user.id,
        meal_date: new Date().toISOString().split('T')[0],
        ...nutritionData
      };
      
      await MotherHealthService.saveNutritionEntry(nutrition);
      Alert.alert('Success', 'Nutrition entry saved successfully!');
      setShowNutritionModal(false);
      loadMotherHealthData();
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
      Alert.alert('Error', 'Failed to save nutrition entry. Please try again.');
    }
  };

  const handleSubmitExercise = async () => {
    if (!user) return;
    
    try {
      const exercise: Omit<ExerciseEntry, 'id' | 'created_at'> = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        ...exerciseData
      };
      
      await MotherHealthService.saveExerciseEntry(exercise);
      Alert.alert('Success', 'Exercise entry saved successfully!');
      setShowExerciseModal(false);
      loadMotherHealthData();
    } catch (error) {
      console.error('Error saving exercise entry:', error);
      Alert.alert('Error', 'Failed to save exercise entry. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedSectionStyle = useAnimatedStyle(() => ({
    opacity: sectionOpacity.value,
    transform: [{ translateY: sectionTranslateY.value }],
  }));

  const animatedHealthScoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: healthScorePulse.value }],
  }));

  const quickActions = [
    { title: 'Daily Check-in', icon: <HealthIcon size={24} />, onPress: handleDailyCheckIn, type: 'primary' as const, delay: 1200 },
    { title: 'Health Metrics', icon: <LogMealIcon size={24} />, onPress: handleHealthMetrics, type: 'secondary' as const, delay: 1500 },
    { title: 'Log Nutrition', icon: <WaterIcon size={24} />, onPress: handleLogNutrition, type: 'success' as const, delay: 1800 },
    { title: 'Log Exercise', icon: <TipsIcon size={24} />, onPress: handleLogExercise, type: 'secondary' as const, delay: 2100 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMotherHealthData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Health Journey</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Health Score Header */}
        <Animated.View style={[styles.healthScoreCard, animatedHealthScoreStyle]}>
          <Text style={styles.healthScoreTitle}>
            💪 Health Score: {healthData?.summary?.overallHealth || 'Good'}
          </Text>
          <Text style={styles.healthScoreSubtitle}>
            {healthData?.summary?.recommendations?.[0] || "You're doing great! Keep up the good work."}
          </Text>
          {todaysCheckInStatus && (
            <Text style={styles.checkInStatus}>✅ Today's check-in completed</Text>
          )}
        </Animated.View>

        {/* Recent Health Metrics */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Recent Health Metrics</Text>
          <View style={styles.healthMetricsGrid}>
            {healthData?.healthMetrics?.length > 0 ? (
              healthData.healthMetrics.slice(0, 4).map((metric: any, index: number) => (
                <HealthMetricCard
                key={index}
                  metric={{
                    name: 'Weight',
                    value: `${metric.weight || 0} kg`,
                    status: (metric.weight || 0) > 0 ? 'good' : 'warning',
                    trend: 'stable'
                  }}
                delay={600 + (index * 100)}
              />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No health metrics recorded yet</Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleHealthMetrics}>
                  <Text style={styles.emptyStateButtonText}>Add Health Metrics</Text>
                </TouchableOpacity>
          </View>
            )}
          </View>
        </Animated.View>

        {/* Recent Daily Check-ins */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Recent Daily Check-ins</Text>
          <View style={styles.checkInsCard}>
            {healthData?.dailyCheckIns?.length > 0 ? (
              healthData.dailyCheckIns.slice(0, 3).map((checkIn: any, index: number) => (
                <View key={index} style={styles.checkInItem}>
                  <Text style={styles.checkInDate}>
                    {new Date(checkIn.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.checkInWellbeing}>
                    Wellbeing: {checkIn.overall_wellbeing}/10
                  </Text>
                  <Text style={styles.checkInMood}>
                    Mood: {checkIn.mood} | Energy: {checkIn.energy_level}/10
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No daily check-ins yet</Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleDailyCheckIn}>
                  <Text style={styles.emptyStateButtonText}>Start Daily Check-in</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Recent Nutrition Entries */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Recent Nutrition Entries</Text>
          <View style={styles.nutritionCard}>
            {healthData?.nutritionEntries?.length > 0 ? (
              healthData.nutritionEntries.slice(0, 3).map((entry: any, index: number) => (
                <View key={index} style={styles.nutritionItem}>
                  <Text style={styles.nutritionName}>
                    {entry.meal_type.charAt(0).toUpperCase() + entry.meal_type.slice(1)}
                  </Text>
                  <Text style={styles.nutritionValue}>
                    {entry.calories || 0} kcal | {entry.protein_g || 0}g protein
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No nutrition entries yet</Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleLogNutrition}>
                  <Text style={styles.emptyStateButtonText}>Log Nutrition</Text>
                </TouchableOpacity>
                </View>
            )}
          </View>
        </Animated.View>

        {/* Health Insights */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <View style={styles.insightsCard}>
            {healthData?.insights?.length > 0 ? (
              healthData.insights.map((insight: any, index: number) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightText}>{insight.description}</Text>
                  <Text style={styles.insightRecommendation}>{insight.recommendation}</Text>
            </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No insights available yet</Text>
                <Text style={styles.emptyStateSubtext}>Complete daily check-ins to get personalized insights</Text>
            </View>
            )}
          </View>
        </Animated.View>

        {/* Health Recommendations */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Health Recommendations</Text>
          <View style={styles.alertsCard}>
            {healthData?.summary?.recommendations?.map((recommendation: string, index: number) => (
              <View key={index} style={[styles.alertItem, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.alertText, { color: Colors.primary }]}>
                  💡 {recommendation}
              </Text>
            </View>
            )) || (
              <View style={[styles.alertItem, { backgroundColor: Colors.primary + '20' }]}>
                <Text style={[styles.alertText, { color: Colors.primary }]}>
                  ✅ Keep up the great work with your health journey!
              </Text>
            </View>
            )}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                title={action.title}
                icon={action.icon}
                onPress={action.onPress}
                type={action.type}
                delay={action.delay}
              />
            ))}
          </View>
        </View>

        {/* Voice Integration */}
        <Animated.View style={[styles.voiceSection, animatedSectionStyle]}>
          <Text style={styles.voiceTitle}>Tell me about your health today</Text>
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            isListening={isListening}
            disabled={false}
          />
        </Animated.View>
      </ScrollView>

      {/* Daily Check-in Modal */}
      <Modal
        visible={showDailyCheckInModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDailyCheckInModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDailyCheckInModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Daily Check-in</Text>
            <TouchableOpacity onPress={handleSubmitDailyCheckIn}>
              <Text style={styles.modalSubmitButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Overall Wellbeing (1-10):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={checkInData.overall_wellbeing.toString()}
              onChangeText={(text) => setCheckInData({...checkInData, overall_wellbeing: parseInt(text) || 7})}
              placeholder="7"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Mood:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={checkInData.mood}
              onChangeText={(text) => setCheckInData({...checkInData, mood: text})}
              placeholder="good, okay, tired, etc."
            />
            
            <Text style={styles.modalLabel}>Energy Level (1-10):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={checkInData.energy_level.toString()}
              onChangeText={(text) => setCheckInData({...checkInData, energy_level: parseInt(text) || 7})}
              placeholder="7"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Sleep Quality (1-10):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={checkInData.sleep_quality.toString()}
              onChangeText={(text) => setCheckInData({...checkInData, sleep_quality: parseInt(text) || 7})}
              placeholder="7"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Pain Level (1-10):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={checkInData.pain_level.toString()}
              onChangeText={(text) => setCheckInData({...checkInData, pain_level: parseInt(text) || 3})}
              placeholder="3"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Stress Level (1-10):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={checkInData.stress_level.toString()}
              onChangeText={(text) => setCheckInData({...checkInData, stress_level: parseInt(text) || 4})}
              placeholder="4"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Concerns:</Text>
            <TextInput
              style={[styles.modalTextInput, styles.textArea]}
              value={checkInData.concerns}
              onChangeText={(text) => setCheckInData({...checkInData, concerns: text})}
              placeholder="Any concerns or symptoms..."
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.modalLabel}>Notes:</Text>
            <TextInput
              style={[styles.modalTextInput, styles.textArea]}
              value={checkInData.notes}
              onChangeText={(text) => setCheckInData({...checkInData, notes: text})}
              placeholder="Additional notes..."
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Health Metrics Modal */}
      <Modal
        visible={showHealthMetricsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHealthMetricsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHealthMetricsModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
                </TouchableOpacity>
            <Text style={styles.modalTitle}>Health Metrics</Text>
            <TouchableOpacity onPress={handleSubmitHealthMetrics}>
              <Text style={styles.modalSubmitButton}>Save</Text>
                </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Weight (kg):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={healthMetricsData.weight.toString()}
              onChangeText={(text) => setHealthMetricsData({...healthMetricsData, weight: parseFloat(text) || 0})}
              placeholder="65.5"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Blood Pressure (Systolic):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={healthMetricsData.blood_pressure_systolic.toString()}
              onChangeText={(text) => setHealthMetricsData({...healthMetricsData, blood_pressure_systolic: parseInt(text) || 0})}
              placeholder="120"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Blood Pressure (Diastolic):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={healthMetricsData.blood_pressure_diastolic.toString()}
              onChangeText={(text) => setHealthMetricsData({...healthMetricsData, blood_pressure_diastolic: parseInt(text) || 0})}
              placeholder="80"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Energy Level (1-10):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={healthMetricsData.energy_level.toString()}
              onChangeText={(text) => setHealthMetricsData({...healthMetricsData, energy_level: parseInt(text) || 7})}
              placeholder="7"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Mood Score (1-10):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={healthMetricsData.mood_score.toString()}
              onChangeText={(text) => setHealthMetricsData({...healthMetricsData, mood_score: parseInt(text) || 7})}
              placeholder="7"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Sleep Hours:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={healthMetricsData.sleep_hours.toString()}
              onChangeText={(text) => setHealthMetricsData({...healthMetricsData, sleep_hours: parseFloat(text) || 0})}
              placeholder="7.5"
              keyboardType="numeric"
            />
            
            
            <Text style={styles.modalLabel}>Notes:</Text>
            <TextInput
              style={[styles.modalTextInput, styles.textArea]}
              value={healthMetricsData.notes}
              onChangeText={(text) => setHealthMetricsData({...healthMetricsData, notes: text})}
              placeholder="Additional notes..."
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Nutrition Modal */}
      <Modal
        visible={showNutritionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNutritionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNutritionModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
                </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Nutrition</Text>
            <TouchableOpacity onPress={handleSubmitNutrition}>
              <Text style={styles.modalSubmitButton}>Save</Text>
                </TouchableOpacity>
              </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Meal Type:</Text>
            <View style={styles.radioGroup}>
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.radioButton,
                    nutritionData.meal_type === type && styles.radioButtonSelected
                  ]}
                  onPress={() => setNutritionData({...nutritionData, meal_type: type as any})}
                >
                  <Text style={[
                    styles.radioButtonText,
                    nutritionData.meal_type === type && styles.radioButtonTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.modalLabel}>Calories:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={nutritionData.calories.toString()}
              onChangeText={(text) => setNutritionData({...nutritionData, calories: parseInt(text) || 0})}
              placeholder="450"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Protein (g):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={nutritionData.protein_g.toString()}
              onChangeText={(text) => setNutritionData({...nutritionData, protein_g: parseFloat(text) || 0})}
              placeholder="25"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Iron (mg):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={nutritionData.iron_mg.toString()}
              onChangeText={(text) => setNutritionData({...nutritionData, iron_mg: parseFloat(text) || 0})}
              placeholder="18"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Calcium (mg):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={nutritionData.calcium_mg.toString()}
              onChangeText={(text) => setNutritionData({...nutritionData, calcium_mg: parseFloat(text) || 0})}
              placeholder="1000"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Water (ml):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={nutritionData.water_ml.toString()}
              onChangeText={(text) => setNutritionData({...nutritionData, water_ml: parseInt(text) || 0})}
              placeholder="250"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Food Items:</Text>
            <TextInput
              style={[styles.modalTextInput, styles.textArea]}
              value={nutritionData.food_items}
              onChangeText={(text) => setNutritionData({...nutritionData, food_items: text})}
              placeholder="What did you eat?"
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Exercise Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Exercise</Text>
            <TouchableOpacity onPress={handleSubmitExercise}>
              <Text style={styles.modalSubmitButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Exercise Type:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={exerciseData.exercise_type}
              onChangeText={(text) => setExerciseData({...exerciseData, exercise_type: text})}
              placeholder="Walking, Yoga, Swimming, etc."
            />
            
            <Text style={styles.modalLabel}>Duration (minutes):</Text>
            <TextInput
              style={styles.modalTextInput}
              value={exerciseData.duration_minutes.toString()}
              onChangeText={(text) => setExerciseData({...exerciseData, duration_minutes: parseInt(text) || 0})}
              placeholder="30"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Intensity:</Text>
            <View style={styles.radioGroup}>
              {['low', 'moderate', 'high'].map((intensity) => (
                <TouchableOpacity
                  key={intensity}
                  style={[
                    styles.radioButton,
                    exerciseData.intensity === intensity && styles.radioButtonSelected
                  ]}
                  onPress={() => setExerciseData({...exerciseData, intensity: intensity as any})}
                >
                  <Text style={[
                    styles.radioButtonText,
                    exerciseData.intensity === intensity && styles.radioButtonTextSelected
                  ]}>
                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.modalLabel}>Calories Burned:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={exerciseData.calories_burned.toString()}
              onChangeText={(text) => setExerciseData({...exerciseData, calories_burned: parseInt(text) || 0})}
              placeholder="200"
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Notes:</Text>
            <TextInput
              style={[styles.modalTextInput, styles.textArea]}
              value={exerciseData.notes}
              onChangeText={(text) => setExerciseData({...exerciseData, notes: text})}
              placeholder="How did the exercise feel?"
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  healthScoreCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  healthScoreTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  healthScoreSubtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  nutritionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  nutritionItem: {
    marginBottom: 16,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  nutritionValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  mealsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mealItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  mealTime: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCalories: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
  },
  mealStatus: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
  },
  healthMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  healthMetricCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  healthMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthMetricName: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  trendIcon: {
    fontSize: Typography.sizes.base,
  },
  healthMetricValue: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    marginBottom: 4,
  },
  healthMetricStatus: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodySemiBold,
  },
  recoveryCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  recoveryItem: {
    marginBottom: 16,
  },
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recoveryName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  recoveryPercentage: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.warning,
  },
  recoveryProgressBar: {
    height: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  recoveryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  insightItem: {
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  alertsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  alertItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: (width - 60) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary,
  },
  secondaryActionButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  successActionButton: {
    backgroundColor: Colors.secondary,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  modalCloseButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  modalSubmitButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  modalTextInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
  },
  mealSuggestions: {
    marginTop: 24,
  },
  suggestionsTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  suggestionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  suggestionText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  checkInStatus: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    marginTop: 8,
    opacity: 0.8,
  },
  checkInsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  checkInItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  checkInDate: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  checkInWellbeing: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    marginBottom: 2,
  },
  checkInMood: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  insightRecommendation: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  radioButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
  },
  radioButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioButtonText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  radioButtonTextSelected: {
    color: Colors.textPrimary,
  },
});
