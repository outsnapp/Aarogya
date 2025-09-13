import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal } from 'react-native';
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
  const [isListening, setIsListening] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [newMeal, setNewMeal] = useState('');
  const [mealCalories, setMealCalories] = useState('');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  const healthScorePulse = useSharedValue(1);

  // Data
  const nutritionMetrics: NutritionMetric[] = [
    { name: 'Calories', current: 1800, target: 2200, unit: 'kcal', color: Colors.primary },
    { name: 'Protein', current: 65, target: 80, unit: 'g', color: Colors.secondary },
    { name: 'Iron', current: 18, target: 27, unit: 'mg', color: Colors.warning },
    { name: 'Calcium', current: 1000, target: 1300, unit: 'mg', color: Colors.primary },
    { name: 'Water', current: 8, target: 10, unit: 'glasses', color: Colors.primary },
  ];

  const meals: Meal[] = [
    { name: 'Oatmeal with fruits', calories: 350, status: 'completed', time: '8:00 AM' },
    { name: 'Dal, rice, vegetables', calories: 450, status: 'completed', time: '1:00 PM' },
    { name: 'Nuts and yogurt', calories: 200, status: 'completed', time: '4:00 PM' },
    { name: 'Roti with vegetables', calories: 400, status: 'planned', time: '8:00 PM' },
  ];

  const healthMetrics: HealthMetric[] = [
    { name: 'Weight', value: '58 kg', status: 'good', trend: 'stable' },
    { name: 'Blood Pressure', value: '110/70', status: 'good', trend: 'stable' },
    { name: 'Energy Level', value: '7/10', status: 'good', trend: 'up' },
    { name: 'Sleep Quality', value: '6.5 hours', status: 'warning', trend: 'down' },
  ];

  const recoveryProgress = [
    { name: 'Physical Recovery', progress: 85, color: Colors.primary },
    { name: 'Energy Restoration', progress: 70, color: Colors.secondary },
    { name: 'Emotional Well-being', progress: 75, color: Colors.warning },
    { name: 'Overall Health', progress: 78, color: Colors.primary },
  ];

  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

    // Section animation
    sectionOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    sectionTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    // Health score pulse animation
    healthScorePulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const handleVoiceStart = () => {
    setIsListening(true);
  };

  const handleVoiceStop = () => {
    setIsListening(false);
  };

  const handleVoiceTranscript = (text: string) => {
    console.log('Meal transcript:', text);
  };

  const handleLogMeal = () => {
    setShowMealModal(true);
  };

  const handleTrackWater = () => {
    console.log('Track water intake');
  };

  const handleHealthCheckin = () => {
    console.log('Health check-in');
  };

  const handleNutritionTips = () => {
    console.log('Nutrition tips');
  };

  const handleSubmitMeal = () => {
    if (newMeal.trim() && mealCalories.trim()) {
      console.log('Meal logged:', {
        name: newMeal,
        calories: parseInt(mealCalories)
      });
      setNewMeal('');
      setMealCalories('');
      setShowMealModal(false);
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
    { title: 'Log Meal', icon: <LogMealIcon size={24} />, onPress: handleLogMeal, type: 'primary' as const, delay: 1200 },
    { title: 'Track Water', icon: <WaterIcon size={24} />, onPress: handleTrackWater, type: 'success' as const, delay: 1500 },
    { title: 'Health Check-in', icon: <HealthIcon size={24} />, onPress: handleHealthCheckin, type: 'secondary' as const, delay: 1800 },
    { title: 'Nutrition Tips', icon: <TipsIcon size={24} />, onPress: handleNutritionTips, type: 'secondary' as const, delay: 2100 },
  ];

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
          <Text style={styles.healthScoreTitle}>💪 Health Score: 78/100</Text>
          <Text style={styles.healthScoreSubtitle}>You're doing great! Keep up the good work.</Text>
        </Animated.View>

        {/* Daily Nutrition Tracking */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Daily Nutrition Tracking</Text>
          <View style={styles.nutritionCard}>
            {nutritionMetrics.map((metric, index) => (
              <NutritionBar
                key={index}
                metric={metric}
                delay={600 + (index * 100)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Meal Planning */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Meal Planning</Text>
          <View style={styles.mealsCard}>
            {meals.map((meal, index) => (
              <MealItem
                key={index}
                meal={meal}
                delay={1100 + (index * 150)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Health Metrics */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.healthMetricsGrid}>
            {healthMetrics.map((metric, index) => (
              <HealthMetricCard
                key={index}
                metric={metric}
                delay={1700 + (index * 100)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Recovery Progress */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Recovery Progress</Text>
          <View style={styles.recoveryCard}>
            {recoveryProgress.map((item, index) => (
              <View key={index} style={styles.recoveryItem}>
                <View style={styles.recoveryHeader}>
                  <Text style={styles.recoveryName}>{item.name}</Text>
                  <Text style={styles.recoveryPercentage}>{item.progress}%</Text>
                </View>
                <View style={styles.recoveryProgressBar}>
                  <View style={[
                    styles.recoveryProgressFill,
                    { 
                      width: `${item.progress}%`,
                      backgroundColor: item.color
                    }
                  ]} />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Nutritional Insights */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Nutritional Insights</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightItem}>
              <Text style={styles.insightTitle}>Strengths:</Text>
              <Text style={styles.insightText}>Good protein intake, regular meals</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightTitle}>Areas to Improve:</Text>
              <Text style={styles.insightText}>Need more iron-rich foods</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightTitle}>Recommendations:</Text>
              <Text style={styles.insightText}>Add spinach, dates, and lentils</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightTitle}>Supplements:</Text>
              <Text style={styles.insightText}>Continue prenatal vitamins</Text>
            </View>
          </View>
        </Animated.View>

        {/* Health Alerts */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Health Alerts</Text>
          <View style={styles.alertsCard}>
            <View style={[styles.alertItem, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.alertText, { color: Colors.primary }]}>
                ✅ Your energy is improving daily!
              </Text>
            </View>
            <View style={[styles.alertItem, { backgroundColor: Colors.warning + '20' }]}>
              <Text style={[styles.alertText, { color: Colors.warning }]}>
                ⚠️ Drink more water - you're slightly dehydrated
              </Text>
            </View>
            <View style={[styles.alertItem, { backgroundColor: Colors.secondary + '20' }]}>
              <Text style={[styles.alertText, { color: Colors.secondary }]}>
                💡 Don't forget your evening walk
              </Text>
            </View>
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
          <Text style={styles.voiceTitle}>Tell me about your meals today</Text>
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            isListening={isListening}
            disabled={false}
          />
        </Animated.View>
      </ScrollView>

      {/* Meal Logging Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMealModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMealModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Meal</Text>
            <TouchableOpacity onPress={handleSubmitMeal}>
              <Text style={styles.modalSubmitButton}>Log</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Meal Name:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={newMeal}
              onChangeText={setNewMeal}
              placeholder="e.g., Dal with rice and vegetables"
            />
            
            <Text style={styles.modalLabel}>Calories:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={mealCalories}
              onChangeText={setMealCalories}
              placeholder="e.g., 450"
              keyboardType="numeric"
            />
            
            <View style={styles.mealSuggestions}>
              <Text style={styles.suggestionsTitle}>Quick Add:</Text>
              <View style={styles.suggestionButtons}>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>Breakfast (350 kcal)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>Lunch (450 kcal)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>Snack (200 kcal)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>Dinner (400 kcal)</Text>
                </TouchableOpacity>
              </View>
            </View>
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
});
