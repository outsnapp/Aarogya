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
import { Svg, Circle, Path, G } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
import VoiceRecorder from '../components/VoiceRecorder';

const { width } = Dimensions.get('window');

interface SmartAlertProps {
  type: 'pattern' | 'celebration' | 'family';
  message: string;
  delay: number;
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  delay: number;
}

// Custom icons for quick actions
const VoiceIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 1c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V3c0-1.1-.9-2-2-2z"
      fill={Colors.primary}
    />
    <Path
      d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2h2v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2h2z"
      fill={Colors.primary}
    />
    <Path
      d="M11 21h2v2h-2z"
      fill={Colors.primary}
    />
  </Svg>
);

const TimelineIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill={Colors.secondary}
    />
    <Path
      d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      fill={Colors.secondary}
    />
  </Svg>
);

const ASHAIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.warning}
    />
    <Circle cx="12" cy="12" r="3" fill={Colors.background} />
  </Svg>
);

const EmergencyIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.danger}
    />
    <Path
      d="M12 6v6l4 2"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const FamilyIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      fill={Colors.secondary}
    />
    <Circle cx="8.5" cy="7" r="4" fill={Colors.secondary} />
    <Path
      d="M20 8v6M23 11h-6"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const BabyIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={Colors.primary}
    />
    <Circle cx="12" cy="12" r="3" fill={Colors.secondary} />
  </Svg>
);

const AnonymousIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
      fill={Colors.secondary}
    />
    <Circle cx="12" cy="12" r="2" fill={Colors.background} />
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

const LanguageIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
      fill={Colors.primary}
    />
  </Svg>
);

const SmartAlert = ({ type, message, delay }: SmartAlertProps) => {
  const alertOpacity = useSharedValue(0);
  const alertTranslateY = useSharedValue(20);

  useEffect(() => {
    alertOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    alertTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getAlertStyle = () => {
    switch (type) {
      case 'pattern':
        return { backgroundColor: Colors.warning, borderColor: Colors.warning };
      case 'celebration':
        return { backgroundColor: Colors.primary, borderColor: Colors.primary };
      case 'family':
        return { backgroundColor: Colors.secondary, borderColor: Colors.secondary };
      default:
        return { backgroundColor: Colors.primary, borderColor: Colors.primary };
    }
  };

  const animatedAlertStyle = useAnimatedStyle(() => ({
    opacity: alertOpacity.value,
    transform: [{ translateY: alertTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.alertCard, getAlertStyle(), animatedAlertStyle]}>
      <Text style={styles.alertText}>{message}</Text>
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

export default function DashboardScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [userName] = useState('Priya'); // Demo name

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const insightsOpacity = useSharedValue(0);
  const insightsTranslateY = useSharedValue(30);
  const progressValue = useSharedValue(0);
  const voicePulse = useSharedValue(1);

  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

    // AI Insights animation
    insightsOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    insightsTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    // Progress bar animation
    progressValue.value = withDelay(
      800,
      withTiming(0.65, { duration: 1000, easing: Easing.out(Easing.quad) })
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
    // Navigate to voice check-in screen
    router.push('/voice-checkin');
  };

  const handleVoiceStop = () => {
    setIsListening(false);
  };

  const handleVoiceTranscript = (text: string) => {
    // Handle voice input
    console.log('Voice transcript:', text);
  };

  const handleViewTimeline = () => {
    router.push('/recovery-timeline');
  };

  const handleContactASHA = () => {
    router.push('/asha-worker');
  };

  const handleEmergency = () => {
    router.push('/emergency');
  };

  const handleFamilyNetwork = () => {
    router.push('/family-network');
  };

  const handleChildCare = () => {
    router.push('/child-care');
  };

  const handleAnonymousQuestions = () => {
    router.push('/anonymous-questions');
  };

  const handleMotherHealth = () => {
    router.push('/mother-health');
  };

  const handleMultilingualSettings = () => {
    router.push('/multilingual-settings');
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedInsightsStyle = useAnimatedStyle(() => ({
    opacity: insightsOpacity.value,
    transform: [{ translateY: insightsTranslateY.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const animatedVoiceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voicePulse.value }],
  }));

  const smartAlerts = [
    { type: 'pattern' as const, message: 'Your mood has been low for 2 days. Would you like to talk?', delay: 1200 },
    { type: 'celebration' as const, message: 'Great! Your energy levels are improving', delay: 1500 },
    { type: 'family' as const, message: 'Your husband Rajesh was notified of your progress', delay: 1800 },
  ];

  const quickActions = [
    { title: 'Voice Check-in', icon: <VoiceIcon size={28} />, onPress: handleVoiceStart, delay: 2100 },
    { title: 'View Timeline', icon: <TimelineIcon size={28} />, onPress: handleViewTimeline, delay: 2400 },
    { title: 'Contact ASHA Worker', icon: <ASHAIcon size={28} />, onPress: handleContactASHA, delay: 2700 },
    { title: 'Child Care', icon: <BabyIcon size={28} />, onPress: handleChildCare, delay: 3000 },
    { title: 'Anonymous Q&A', icon: <AnonymousIcon size={28} />, onPress: handleAnonymousQuestions, delay: 3300 },
    { title: 'Mother Health', icon: <HealthIcon size={28} />, onPress: handleMotherHealth, delay: 3600 },
    { title: 'Language Settings', icon: <LanguageIcon size={28} />, onPress: handleMultilingualSettings, delay: 3900 },
    { title: 'Family Network', icon: <FamilyIcon size={28} />, onPress: handleFamilyNetwork, delay: 4200 },
    { title: 'Emergency', icon: <EmergencyIcon size={28} />, onPress: handleEmergency, delay: 4500 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Good morning, {userName} 🌼</Text>
              <Text style={styles.subGreeting}>How are you feeling today?</Text>
            </View>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Main AI Insights Card */}
        <Animated.View style={[styles.insightsCard, animatedInsightsStyle]}>
          <Text style={styles.insightsTitle}>AI Recovery Insights</Text>
          
          {/* Recovery Status */}
          <View style={styles.recoveryStatus}>
            <Text style={styles.statusText}>You're 65% through your healing phase</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
              </View>
            </View>
          </View>

          {/* Today's Focus */}
          <View style={styles.todayFocus}>
            <Text style={styles.focusTitle}>Today's Focus</Text>
            <Text style={styles.focusText}>
              Rest more today - your bleeding pattern suggests you need extra care
            </Text>
          </View>

          {/* Predicted Milestone */}
          <View style={styles.milestone}>
            <Text style={styles.milestoneTitle}>Predicted Milestone</Text>
            <Text style={styles.milestoneText}>
              In 3 days, you should feel strong enough for 10-minute walks
            </Text>
          </View>

          {/* Voice Check-in Button */}
          <Animated.View style={animatedVoiceStyle}>
            <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceStart}>
              <VoiceRecorder
                onTranscript={handleVoiceTranscript}
                onStart={handleVoiceStart}
                onStop={handleVoiceStop}
                isListening={isListening}
                disabled={false}
              />
              <Text style={styles.voiceButtonText}>Speak to Aarogya</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Smart Alerts Section */}
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Smart Alerts</Text>
          {smartAlerts.map((alert, index) => (
            <SmartAlert
              key={index}
              type={alert.type}
              message={alert.message}
              delay={alert.delay}
            />
          ))}
        </View>

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
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  insightsCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  insightsTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  recoveryStatus: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
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
  todayFocus: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 12,
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
  milestone: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  milestoneTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  milestoneText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  voiceButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  voiceButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
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
});

