import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../constants/Colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { Svg, Circle, Path, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  animate?: boolean;
}

// Simple pastel flower logo component
const FlowerIcon = ({ size = 60 }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <G>
      {/* Flower petals */}
      <Circle cx="30" cy="20" r="8" fill={Colors.primary} opacity={0.8} />
      <Circle cx="40" cy="30" r="8" fill={Colors.secondary} opacity={0.8} />
      <Circle cx="30" cy="40" r="8" fill={Colors.primary} opacity={0.8} />
      <Circle cx="20" cy="30" r="8" fill={Colors.secondary} opacity={0.8} />
      
      {/* Flower center */}
      <Circle cx="30" cy="30" r="6" fill={Colors.warning} opacity={0.9} />
      
      {/* Small decorative dots */}
      <Circle cx="30" cy="30" r="2" fill={Colors.textPrimary} opacity={0.6} />
    </G>
  </Svg>
);

export default function Logo({ size = 80, animate = false }: LogoProps) {
  const scale = useSharedValue(animate ? 0.8 : 1);
  const opacity = useSharedValue(animate ? 0 : 1);

  React.useEffect(() => {
    if (animate) {
      // Logo animation: fade-in + scale with bounce
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
      
      scale.value = withSequence(
        withTiming(1.05, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, {
          duration: 100,
          easing: Easing.inOut(Easing.quad),
        })
      );
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.logoContainer, animatedStyle]}>
      <FlowerIcon size={size} />
      <Text style={[styles.wordmark, { fontSize: size * 0.3 }]}>
        Aarogya
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
