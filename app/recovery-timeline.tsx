import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
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
import { Svg, Path, Circle, G } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
// VoiceRecorder removed for clean demo
import { RecoveryTimelineService, RecoveryTimelineData } from '../lib/recoveryTimelineService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface Milestone {
  day: number;
  title: string;
  description: string;
  isAchieved: boolean;
  isUpcoming: boolean;
}

interface Prediction {
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'insight';
}

interface Tip {
  title: string;
  description: string;
  category: 'sleep' | 'family' | 'health';
}

// Custom icons for different categories
const SleepIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-13.5-6.41-13.5-13.5 0-.66.06-1.32.18-1.96z"
      fill={Colors.primary}
    />
  </Svg>
);

const FamilyIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5 12.01 8.99A2.5 2.5 0 0 0 10 8H8.46c-.8 0-1.54.37-2.01.99L4 10.5V22h2v-6h2.5l2.5 6h2l-2.5-6H14v6h2z"
      fill={Colors.secondary}
    />
  </Svg>
);

const HealthIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={Colors.warning}
    />
  </Svg>
);

const MilestoneItem = ({ milestone, delay }: { milestone: Milestone; delay: number }) => {
  const itemOpacity = useSharedValue(0);
  const itemTranslateX = useSharedValue(-20);

  useEffect(() => {
    itemOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    itemTranslateX.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedItemStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ translateX: itemTranslateX.value }],
  }));

  const getMilestoneStyle = () => {
    if (milestone.isAchieved) {
      return { backgroundColor: Colors.primary, borderColor: Colors.primary };
    } else if (milestone.isUpcoming) {
      return { backgroundColor: Colors.warning, borderColor: Colors.warning };
    } else {
      return { backgroundColor: Colors.background, borderColor: Colors.textMuted };
    }
  };

  return (
    <Animated.View style={[styles.milestoneItem, getMilestoneStyle(), animatedItemStyle]}>
      <View style={styles.milestoneHeader}>
        <Text style={styles.milestoneDay}>Day {milestone.day}</Text>
        <View style={[
          styles.milestoneStatus,
          milestone.isAchieved && styles.milestoneAchieved,
          milestone.isUpcoming && styles.milestoneUpcoming
        ]}>
          {milestone.isAchieved && <Text style={styles.statusText}>✓</Text>}
          {milestone.isUpcoming && <Text style={styles.statusText}>→</Text>}
        </View>
      </View>
      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
      <Text style={styles.milestoneDescription}>{milestone.description}</Text>
    </Animated.View>
  );
};

const PredictionCard = ({ prediction, delay }: { prediction: Prediction; delay: number }) => {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    cardOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    cardScale.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getCardStyle = () => {
    switch (prediction.type) {
      case 'positive':
        return { backgroundColor: Colors.primary, borderColor: Colors.primary };
      case 'neutral':
        return { backgroundColor: Colors.warning, borderColor: Colors.warning };
      case 'insight':
        return { backgroundColor: Colors.secondary, borderColor: Colors.secondary };
      default:
        return { backgroundColor: Colors.background, borderColor: Colors.textMuted };
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View style={[styles.predictionCard, getCardStyle(), animatedCardStyle]}>
      <Text style={styles.predictionTitle}>{prediction.title}</Text>
      <Text style={styles.predictionDescription}>{prediction.description}</Text>
    </Animated.View>
  );
};

const TipCard = ({ tip, delay }: { tip: Tip; delay: number }) => {
  const tipOpacity = useSharedValue(0);
  const tipTranslateY = useSharedValue(20);

  useEffect(() => {
    tipOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    tipTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getIcon = () => {
    switch (tip.category) {
      case 'sleep':
        return <SleepIcon size={20} />;
      case 'family':
        return <FamilyIcon size={20} />;
      case 'health':
        return <HealthIcon size={20} />;
      default:
        return <HealthIcon size={20} />;
    }
  };

  const animatedTipStyle = useAnimatedStyle(() => ({
    opacity: tipOpacity.value,
    transform: [{ translateY: tipTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.tipCard, animatedTipStyle]}>
      <View style={styles.tipHeader}>
        <View style={styles.tipIcon}>{getIcon()}</View>
        <Text style={styles.tipTitle}>{tip.title}</Text>
      </View>
      <Text style={styles.tipDescription}>{tip.description}</Text>
    </Animated.View>
  );
};

export default function RecoveryTimelineScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [timelineData, setTimelineData] = useState<RecoveryTimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    loadTimelineData();
  }, [user]);

  useEffect(() => {
    if (timelineData) {
      // Header animation
      headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
      headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

      // Progress bar animation based on real data
      const progressDecimal = timelineData.progressPercentage / 100;
      progressValue.value = withDelay(
        800,
        withTiming(progressDecimal, { duration: 1000, easing: Easing.out(Easing.quad) })
      );

    }
  }, [timelineData]);

  const loadTimelineData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await RecoveryTimelineService.getRecoveryTimelineData(user.id);
      setTimelineData(data);
    } catch (error) {
      console.error('Error loading timeline data:', error);
      Alert.alert('Error', 'Failed to load recovery timeline data. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleBackToDashboard = () => {
    router.back();
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));


  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your recovery timeline...</Text>
        </View>
      </View>
    );
  }

  if (!timelineData) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load recovery timeline data.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTimelineData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.title}>AI Recovery Timeline</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Current Phase */}
        <Animated.View style={[styles.currentPhaseCard, animatedHeaderStyle]}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseTitle}>Your Recovery Journey</Text>
            <Text style={styles.phaseSubtitle}>
              {timelineData.currentPhase} • Day {timelineData.daysSinceDelivery} of Recovery
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Recovery Progress</Text>
              <Text style={styles.progressPercentage}>{timelineData.progressPercentage}%</Text>
            </View>
            <View style={styles.progressBackground}>
              <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
            </View>
            <Text style={styles.progressDescription}>
              {timelineData.progressPercentage < 25 ? 'Early healing phase - focus on rest' :
               timelineData.progressPercentage < 50 ? 'Building strength - gentle movement OK' :
               timelineData.progressPercentage < 75 ? 'Strong recovery - more activities allowed' :
               'Near complete recovery - almost back to normal'}
            </Text>
          </View>
        </Animated.View>

        {/* Today's Focus */}
        <Animated.View style={[styles.focusCard, animatedHeaderStyle]}>
          <Text style={styles.focusTitle}>{timelineData.todayFocus.title}</Text>
          <Text style={styles.focusText}>
            {timelineData.todayFocus.message}
          </Text>
        </Animated.View>

        {/* Recovery Milestones with Better Explanation */}
        <View style={styles.milestonesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recovery Milestones</Text>
            <Text style={styles.sectionSubtitle}>
              Key healing stages after childbirth - these are typical recovery markers
            </Text>
          </View>
          
          {/* Milestone Explanation */}
          <View style={styles.milestoneExplanation}>
            <Text style={styles.explanationTitle}>📅 What do these days mean?</Text>
            <Text style={styles.explanationText}>
              These are standard recovery milestones based on medical research. Every woman's recovery is unique, but these are typical healing stages.
            </Text>
          </View>
          
          {timelineData.milestones.map((milestone, index) => (
            <MilestoneItem
              key={index}
              milestone={milestone}
              delay={1200 + (index * 200)}
            />
          ))}
          
          {/* Next Milestone Highlight */}
          {timelineData.milestones.find(m => m.isUpcoming) && (
            <View style={styles.nextMilestoneHighlight}>
              <Text style={styles.nextMilestoneTitle}>🎯 Your Next Milestone</Text>
              <Text style={styles.nextMilestoneText}>
                {timelineData.milestones.find(m => m.isUpcoming)?.title} in {
                  (timelineData.milestones.find(m => m.isUpcoming)?.day || 0) - timelineData.daysSinceDelivery
                } days
              </Text>
            </View>
          )}
        </View>

        {/* AI Predictions */}
        <View style={styles.predictionsSection}>
          <Text style={styles.sectionTitle}>AI Predictions</Text>
          {timelineData.predictions.map((prediction, index) => (
            <PredictionCard
              key={index}
              prediction={prediction}
              delay={1800 + (index * 200)}
            />
          ))}
        </View>

        {/* Personalized Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Personalized Tips</Text>
          {timelineData.tips.map((tip, index) => (
            <TipCard
              key={index}
              tip={tip}
              delay={2400 + (index * 200)}
            />
          ))}
        </View>

        {/* Recovery Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Understanding Your Recovery</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Why These Milestones Matter</Text>
            <Text style={styles.infoText}>
              Postpartum recovery follows predictable healing patterns. These milestones help you understand what's normal and when to expect improvements in your energy, comfort, and ability to return to activities.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📊 How We Track Your Progress</Text>
            <Text style={styles.infoText}>
              Your recovery percentage is calculated based on your delivery type, days since birth, and daily health check-ins. C-section recoveries typically take 6-8 weeks, while vaginal deliveries take 4-6 weeks.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🤝 When to Seek Help</Text>
            <Text style={styles.infoText}>
              If you're not meeting expected milestones, experiencing severe pain, or have concerns about your recovery, please contact your healthcare provider or use the ASHA worker feature for guidance.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  currentPhaseCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  phaseTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  phaseSubtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  phaseHeader: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  progressDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  milestoneExplanation: {
    backgroundColor: Colors.primaryLight + '40',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  explanationTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  nextMilestoneHighlight: {
    backgroundColor: Colors.warning + '30',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  nextMilestoneTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  nextMilestoneText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  focusCard: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  focusTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  focusText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  milestonesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  milestoneItem: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneDay: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  milestoneStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneAchieved: {
    backgroundColor: Colors.primary,
  },
  milestoneUpcoming: {
    backgroundColor: Colors.warning,
  },
  statusText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  milestoneTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  predictionsSection: {
    marginBottom: 24,
  },
  predictionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  predictionTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  predictionDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  tipDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
});
