import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
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
import VoiceRecorder from '../components/VoiceRecorder';

const { width } = Dimensions.get('window');

interface Milestone {
  type: 'motor' | 'social' | 'cognitive';
  description: string;
  isAchieved: boolean;
  expectedDate: string;
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  delay: number;
}

// Custom icons for baby care features
const FeedingIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={Colors.primary}
    />
    <Circle cx="12" cy="12" r="3" fill={Colors.secondary} />
  </Svg>
);

const MilestoneIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.warning}
    />
    <Path
      d="M12 6l-1.5 3L7 8.5l2.5 2.5L8.5 14l3-1.5L14.5 14l-1-3L17 8.5l-3.5.5L12 6z"
      fill={Colors.background}
    />
  </Svg>
);

const QuestionIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
      fill={Colors.secondary}
    />
  </Svg>
);

const ChartIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-4h2v14h-2V7z"
      fill={Colors.primary}
    />
  </Svg>
);

const MilestoneCard = ({ milestone, delay }: { milestone: Milestone; delay: number }) => {
  const cardOpacity = useSharedValue(0);
  const cardTranslateX = useSharedValue(-20);

  useEffect(() => {
    cardOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    cardTranslateX.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }],
  }));

  const getMilestoneStyle = () => {
    if (milestone.isAchieved) {
      return { backgroundColor: Colors.primary, borderColor: Colors.primary };
    } else {
      return { backgroundColor: Colors.background, borderColor: Colors.textMuted };
    }
  };

  return (
    <Animated.View style={[styles.milestoneCard, getMilestoneStyle(), animatedCardStyle]}>
      <View style={styles.milestoneHeader}>
        <Text style={styles.milestoneType}>{milestone.type.charAt(0).toUpperCase() + milestone.type.slice(1)} Skills</Text>
        <View style={[
          styles.milestoneStatus,
          milestone.isAchieved && styles.milestoneAchieved
        ]}>
          {milestone.isAchieved && <Text style={styles.statusText}>✓</Text>}
        </View>
      </View>
      <Text style={styles.milestoneDescription}>{milestone.description}</Text>
      {!milestone.isAchieved && (
        <Text style={styles.expectedDate}>Expected: {milestone.expectedDate}</Text>
      )}
    </Animated.View>
  );
};

const QuickAction = ({ title, icon, onPress, delay }: QuickActionProps) => {
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

  const animatedActionStyle = useAnimatedStyle(() => ({
    opacity: actionOpacity.value,
    transform: [{ scale: actionScale.value }],
  }));

  return (
    <Animated.View style={animatedActionStyle}>
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={styles.actionIcon}>{icon}</View>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ChildCareScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [babyName] = useState('Arjun'); // Demo baby name
  const [babyAge] = useState('3 months old'); // Demo age

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  const voicePulse = useSharedValue(1);

  // Data
  const milestones: Milestone[] = [
    { type: 'motor', description: 'Lifts head during tummy time', isAchieved: true, expectedDate: 'Achieved' },
    { type: 'social', description: 'Smiles responsively', isAchieved: true, expectedDate: 'Achieved' },
    { type: 'cognitive', description: 'Rolling over', isAchieved: false, expectedDate: 'In 2 weeks' },
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

    // Voice button pulse animation
    voicePulse.value = withRepeat(
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
    // Handle voice input for baby care questions
    console.log('Baby care question:', text);
  };

  const handleLogFeeding = () => {
    console.log('Log feeding');
  };

  const handleRecordMilestone = () => {
    console.log('Record milestone');
  };

  const handleAskAboutBaby = () => {
    console.log('Ask about baby');
  };

  const handleGrowthChart = () => {
    console.log('View growth chart');
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

  const animatedVoiceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voicePulse.value }],
  }));

  const quickActions = [
    { title: 'Log Feeding', icon: <FeedingIcon size={28} />, onPress: handleLogFeeding, delay: 1200 },
    { title: 'Record Milestone', icon: <MilestoneIcon size={28} />, onPress: handleRecordMilestone, delay: 1500 },
    { title: 'Ask About Baby', icon: <QuestionIcon size={28} />, onPress: handleAskAboutBaby, delay: 1800 },
    { title: 'Growth Chart', icon: <ChartIcon size={28} />, onPress: handleGrowthChart, delay: 2100 },
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
          <Text style={styles.title}>Baby Care Center</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Baby Info Header */}
        <Animated.View style={[styles.babyInfoCard, animatedHeaderStyle]}>
          <Text style={styles.babyInfoTitle}>👶 {babyName} - {babyAge}</Text>
        </Animated.View>

        {/* Growth Tracking Section */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Growth Tracking</Text>
          <View style={styles.growthCard}>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Current Weight:</Text>
              <Text style={styles.growthValue}>6.2 kg</Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Height:</Text>
              <Text style={styles.growthValue}>62 cm</Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Head Circumference:</Text>
              <Text style={styles.growthValue}>40 cm</Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Next Check-up:</Text>
              <Text style={styles.growthValue}>In 2 weeks - Vaccination due</Text>
            </View>
          </View>
        </Animated.View>

        {/* Nutrition & Feeding Section */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Nutrition & Feeding</Text>
          <View style={styles.nutritionCard}>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Feeding Schedule:</Text>
              <Text style={styles.nutritionValue}>Every 3 hours - 120ml per feed</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Nutrition Score:</Text>
              <Text style={styles.nutritionValue}>85/100 - Excellent growth</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Food Introduction:</Text>
              <Text style={styles.nutritionValue}>Ready for solid foods - Start with rice cereal</Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Hydration:</Text>
              <Text style={styles.nutritionValue}>Good - 6 wet diapers today</Text>
            </View>
          </View>
        </Animated.View>

        {/* Developmental Milestones */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Developmental Milestones</Text>
          {milestones.map((milestone, index) => (
            <MilestoneCard
              key={index}
              milestone={milestone}
              delay={900 + (index * 200)}
            />
          ))}
        </Animated.View>

        {/* Exercise & Movement */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Exercise & Movement</Text>
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseRow}>
              <Text style={styles.exerciseLabel}>Tummy Time:</Text>
              <Text style={styles.exerciseValue}>15 minutes today - Great job!</Text>
            </View>
            <View style={styles.exerciseRow}>
              <Text style={styles.exerciseLabel}>Play Activities:</Text>
              <Text style={styles.exerciseValue}>Sensory play with colorful toys</Text>
            </View>
            <View style={styles.exerciseRow}>
              <Text style={styles.exerciseLabel}>Sleep Pattern:</Text>
              <Text style={styles.exerciseValue}>14 hours total - 3 naps + night sleep</Text>
            </View>
          </View>
        </Animated.View>

        {/* Health Monitoring */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Health Monitoring</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Temperature:</Text>
              <Text style={styles.healthValue}>Normal - 98.6°F</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Vaccination Status:</Text>
              <Text style={styles.healthValue}>Up to date - Next: 4-month vaccines</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Growth Concerns:</Text>
              <Text style={styles.healthValue}>None detected - Baby is thriving</Text>
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
                delay={action.delay}
              />
            ))}
          </View>
        </View>

        {/* Voice Integration */}
        <Animated.View style={[styles.voiceSection, animatedVoiceStyle]}>
          <Text style={styles.voiceTitle}>Ask me about your baby's development</Text>
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            isListening={isListening}
            disabled={false}
          />
        </Animated.View>
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
  babyInfoCard: {
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
  babyInfoTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
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
  growthCard: {
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
  growthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  growthLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  growthValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
    textAlign: 'right',
    flex: 1,
  },
  nutritionCard: {
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
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  nutritionValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.secondary,
    textAlign: 'right',
    flex: 1,
  },
  milestoneCard: {
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
  milestoneType: {
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
  statusText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  milestoneDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 4,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  expectedDate: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
    color: Colors.warning,
  },
  exerciseCard: {
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
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  exerciseValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.warning,
    textAlign: 'right',
    flex: 1,
  },
  healthCard: {
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
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  healthValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
    textAlign: 'right',
    flex: 1,
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
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  actionIcon: {
    marginBottom: 12,
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
});
