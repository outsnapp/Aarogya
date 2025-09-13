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
  Easing,
} from 'react-native-reanimated';
import { Svg, Path, G, Circle } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface TimelineCardProps {
  phase: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  isActive?: boolean;
}

// Custom icons for timeline phases
const HealingHeartIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={Colors.primary}
      opacity={0.8}
    />
    <Path
      d="M12 6.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"
      fill={Colors.secondary}
    />
  </Svg>
);

const GrowingPlantIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75S7 14 17 8z"
      fill={Colors.secondary}
      opacity={0.8}
    />
    <Circle cx="12" cy="4" r="2" fill={Colors.warning} />
    <Path
      d="M10 6c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"
      fill={Colors.primary}
    />
  </Svg>
);

const BalancedScalesIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.warning}
      opacity={0.8}
    />
    <Path
      d="M12 6l-1.5 3L7 8.5l2.5 2.5L8.5 14l3-1.5L14.5 14l-1-3L17 8.5l-3.5.5L12 6z"
      fill={Colors.primary}
    />
  </Svg>
);

const TimelineCard = ({ phase, title, description, icon, delay, isActive = false }: TimelineCardProps) => {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    const startAnimation = () => {
      cardOpacity.value = withDelay(
        delay,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
      );
      
      cardTranslateY.value = withDelay(
        delay,
        withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
      );
      
      cardScale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.02, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 200, easing: Easing.inOut(Easing.quad) })
        )
      );
    };

    startAnimation();
  }, [delay]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateY: cardTranslateY.value },
      { scale: cardScale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.timelineCard, animatedCardStyle]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
          {icon}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.phaseText}>{phase}</Text>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      </View>
      <Text style={styles.descriptionText}>{description}</Text>
      {isActive && (
        <View style={styles.activeIndicator}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Your current phase</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default function TimelinePreviewScreen() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(0); // 0 = Week 1-2, 1 = Week 3-4, 2 = Month 2-3

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(20);

  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

    // CTA buttons animation (delayed)
    ctaOpacity.value = withDelay(
      1500,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    ctaTranslateY.value = withDelay(
      1500,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );

    // Simulate current phase based on "delivery date" (for demo)
    // In production, this would be calculated based on actual delivery date
    setCurrentPhase(0); // Start with Week 1-2 for demo
  }, []);

  const handleStartJourney = () => {
    router.replace('/dashboard');
  };

  const handleSkipTutorial = () => {
    router.replace('/dashboard');
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedCTAStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  const timelineData = [
    {
      phase: 'Week 1-2',
      title: 'Healing Phase',
      description: 'Your body is recovering. Focus on rest and gentle movement.',
      icon: <HealingHeartIcon size={28} />,
      delay: 300,
    },
    {
      phase: 'Week 3-4',
      title: 'Energy Building',
      description: 'You\'ll start feeling stronger. Light walks and bonding time.',
      icon: <GrowingPlantIcon size={28} />,
      delay: 600,
    },
    {
      phase: 'Month 2-3',
      title: 'New Normal',
      description: 'Finding your rhythm with baby. Self-care becomes easier.',
      icon: <BalancedScalesIcon size={28} />,
      delay: 900,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <Text style={styles.title}>Your Recovery Journey</Text>
          <Text style={styles.subtitle}>
            AI-powered timeline personalized for your healing
          </Text>
        </Animated.View>

        {/* Timeline Cards */}
        <View style={styles.timelineContainer}>
          {timelineData.map((item, index) => (
            <TimelineCard
              key={index}
              phase={item.phase}
              title={item.title}
              description={item.description}
              icon={item.icon}
              delay={item.delay}
              isActive={index === currentPhase}
            />
          ))}
        </View>

        {/* Personalization Note */}
        <View style={styles.personalizationNote}>
          <Text style={styles.noteText}>
            ✨ This timeline adapts to your delivery type and recovery progress
          </Text>
        </View>

        {/* CTA Buttons */}
        <Animated.View style={[styles.ctaContainer, animatedCTAStyle]}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartJourney}>
            <Text style={styles.primaryButtonText}>Start your personalized journey</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipTutorial}>
            <Text style={styles.secondaryButtonText}>Skip tutorial</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
  },
  timelineContainer: {
    marginBottom: 30,
  },
  timelineCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
  },
  phaseText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  titleText: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  descriptionText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.primaryLight,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  activeText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
  },
  personalizationNote: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  noteText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  ctaContainer: {
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
});
