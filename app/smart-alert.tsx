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

const { width } = Dimensions.get('window');

interface FamilyMember {
  name: string;
  relationship: string;
  status: 'notified' | 'on_way' | 'arrived';
  time: string;
}

interface EmergencyActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'danger';
  delay: number;
}

// Custom icons for emergency actions
const CallIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const ShareIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const VideoIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const CancelIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const EmergencyAction = ({ title, icon, onPress, type, delay }: EmergencyActionProps) => {
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
      case 'danger':
        return styles.dangerButton;
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      default:
        return styles.secondaryButton;
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

export default function SmartAlertScreen() {
  const router = useRouter();
  const [ashaCountdown, setAshaCountdown] = useState(5); // 5 minutes countdown
  const [familyMembers] = useState<FamilyMember[]>([
    { name: 'Rajesh', relationship: 'Husband', status: 'on_way', time: '2 min' },
    { name: 'Sita', relationship: 'Mother', status: 'notified', time: '5 min' },
  ]);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const alertPulse = useSharedValue(1);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);

  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

    // Alert pulse animation
    alertPulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    // Sections animation
    sectionOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    sectionTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    // Start countdown timer
    const timer = setInterval(() => {
      setAshaCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Decrease every minute

    return () => clearInterval(timer);
  }, []);

  const handleCallEmergency = () => {
    // Navigate to emergency call screen
    router.push('/emergency-call');
  };

  const handleShareMedicalSummary = () => {
    // Navigate to medical summary screen
    router.push('/medical-summary');
  };

  const handleConnectASHA = () => {
    // Navigate to ASHA worker video call
    router.push('/asha-video-call');
  };

  const handleCancelAlert = () => {
    // Go back to dashboard
    router.back();
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedAlertStyle = useAnimatedStyle(() => ({
    transform: [{ scale: alertPulse.value }],
  }));

  const animatedSectionStyle = useAnimatedStyle(() => ({
    opacity: sectionOpacity.value,
    transform: [{ translateY: sectionTranslateY.value }],
  }));

  const getFamilyStatusColor = (status: string) => {
    switch (status) {
      case 'notified':
        return Colors.warning;
      case 'on_way':
        return Colors.primary;
      case 'arrived':
        return Colors.primary;
      default:
        return Colors.textMuted;
    }
  };

  const getFamilyStatusText = (status: string) => {
    switch (status) {
      case 'notified':
        return 'Notified';
      case 'on_way':
        return 'On the way';
      case 'arrived':
        return 'Arrived';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <Text style={styles.title}>AI Alert</Text>
          <Text style={styles.subtitle}>Bleeding Pattern Detected — Medical Attention Needed</Text>
        </Animated.View>

        {/* Alert Card */}
        <Animated.View style={[styles.alertCard, animatedAlertStyle]}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>⚠️ Urgent Health Alert</Text>
            <Text style={styles.alertSubtitle}>I'm here with you. Your family is being notified and help is on the way.</Text>
          </View>
        </Animated.View>

        {/* Pattern Analysis */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Pattern Analysis</Text>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>
              Your bleeding has increased 40% over 3 days. This pattern suggests you need medical attention.
            </Text>
          </View>
        </Animated.View>

        {/* Immediate Actions */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Immediate Actions</Text>
          <View style={styles.actionsCard}>
            <Text style={styles.actionItem}>1) Rest immediately</Text>
            <Text style={styles.actionItem}>2) Keep wound area clean</Text>
            <Text style={styles.actionItem}>3) Monitor for fever</Text>
          </View>
        </Animated.View>

        {/* Family Network Activated */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Family Network Activated</Text>
          <View style={styles.familyCard}>
            <Text style={styles.familyStatusText}>
              I've notified your family members. They're being updated on your condition.
            </Text>
            {familyMembers.map((member, index) => (
              <View key={index} style={styles.familyMember}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelationship}>{member.relationship}</Text>
                </View>
                <View style={styles.memberStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getFamilyStatusColor(member.status) }]}>
                    <Text style={styles.statusText}>{getFamilyStatusText(member.status)}</Text>
                  </View>
                  <Text style={styles.statusTime}>{member.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ASHA Worker Connected */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>ASHA Worker Connected</Text>
          <View style={styles.ashaCard}>
            <Text style={styles.ashaStatusText}>
              Local health worker Priya is calling you in {ashaCountdown} minutes.
            </Text>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{ashaCountdown}</Text>
              <Text style={styles.countdownLabel}>minutes</Text>
            </View>
          </View>
        </Animated.View>

        {/* Location Sharing */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Location Sharing</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>
              Your family can see your location for safety. Location sharing is active.
            </Text>
            <View style={styles.locationStatus}>
              <View style={styles.locationDot} />
              <Text style={styles.locationStatusText}>Location Active</Text>
            </View>
          </View>
        </Animated.View>

        {/* Emergency Actions */}
        <Animated.View style={[styles.emergencyActions, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Emergency Actions</Text>
          <View style={styles.actionsGrid}>
            <EmergencyAction
              title="Call Emergency Contact"
              icon={<CallIcon size={24} />}
              onPress={handleCallEmergency}
              type="danger"
              delay={1200}
            />
            <EmergencyAction
              title="Share Medical Summary"
              icon={<ShareIcon size={24} />}
              onPress={handleShareMedicalSummary}
              type="primary"
              delay={1400}
            />
            <EmergencyAction
              title="Connect to ASHA Worker"
              icon={<VideoIcon size={24} />}
              onPress={handleConnectASHA}
              type="primary"
              delay={1600}
            />
            <EmergencyAction
              title="Cancel Alert"
              icon={<CancelIcon size={24} />}
              onPress={handleCancelAlert}
              type="secondary"
              delay={1800}
            />
          </View>
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
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.heading,
    color: Colors.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  alertCard: {
    backgroundColor: Colors.danger,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  alertHeader: {
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  analysisCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  analysisText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  actionsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  actionItem: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  familyCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  familyStatusText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  familyMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  memberRelationship: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  memberStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  statusTime: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  ashaCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  ashaStatusText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  countdownContainer: {
    alignItems: 'center',
    backgroundColor: Colors.warning,
    borderRadius: 8,
    padding: 12,
  },
  countdownText: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  countdownLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
  },
  locationCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  locationText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  locationStatusText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
  },
  emergencyActions: {
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
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.textMuted,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
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
});
