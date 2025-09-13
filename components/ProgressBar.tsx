import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  animated?: boolean;
}

export default function ProgressBar({ currentStep, totalSteps, animated = true }: ProgressBarProps) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    const targetProgress = currentStep / totalSteps;
    
    if (animated) {
      // Animate progress with elastic easing and bounce
      progress.value = withSequence(
        withTiming(targetProgress, {
          duration: 400,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(targetProgress * 0.95, {
          duration: 100,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(targetProgress, {
          duration: 100,
          easing: Easing.out(Easing.quad),
        })
      );
    } else {
      progress.value = targetProgress;
    }
  }, [currentStep, totalSteps, animated]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps}
      </Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

