import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Logo from '../components/Logo';
import { Colors, Typography } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  
  // Animation values
  const backgroundAnimation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  const navigateToOnboarding = () => {
    router.replace('/onboarding');
  };

  useEffect(() => {
    // Start animations
    startAnimations();
    
    // Navigate to onboarding after 4 seconds (longer to see the splash screen)
    const timer = setTimeout(() => {
      navigateToOnboarding();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const startAnimations = () => {
    // Background gradient shift
    backgroundAnimation.value = withTiming(1, {
      duration: 1200,
      easing: Easing.inOut(Easing.quad),
    });

    // Title fade-in after logo animation starts
    titleOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });

    // Tagline fade-in with delay
    taglineOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
  };

  // Animated background gradient
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      backgroundAnimation.value,
      [0, 0.5, 1],
      [Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]
    );

    return {
      backgroundColor,
    };
  });

  // Animated title style
  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      {
        translateY: withTiming(titleOpacity.value === 1 ? 0 : 20, {
          duration: 400,
        }),
      },
    ],
  }));

  // Animated tagline style
  const animatedTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [
      {
        translateY: withTiming(taglineOpacity.value === 1 ? 0 : 20, {
          duration: 400,
        }),
      },
    ],
  }));

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={navigateToOnboarding}
    >
      <Animated.View style={[styles.container, animatedBackgroundStyle]}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        
        {/* Subtle gradient overlay for depth */}
        <LinearGradient
          colors={[Colors.background + '00', Colors.background + '20']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.content}>
          {/* Logo with animation */}
          <Logo size={120} animate={true} />

          {/* Welcome text */}
          <Animated.Text style={[styles.title, animatedTitleStyle]}>
            Welcome to Aarogya
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, animatedTaglineStyle]}>
            Care for Maa & Baby
          </Animated.Text>
        </View>

        {/* Bottom decorative element with tap hint */}
        <View style={styles.bottomDecoration}>
          <View style={styles.dotsRow}>
            <View style={styles.decorativeDot} />
            <View style={[styles.decorativeDot, { backgroundColor: Colors.secondary }]} />
            <View style={[styles.decorativeDot, { backgroundColor: Colors.warning }]} />
          </View>
          <Text style={styles.tapHint}>Tap anywhere to continue</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 32,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  tapHint: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginTop: 8,
    opacity: 0.7,
  },
});
