import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch } from 'react-native';
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

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  type: 'primary' | 'secondary' | 'emergency';
  status: 'active' | 'inactive';
}

interface Notification {
  id: string;
  time: string;
  message: string;
  contact: string;
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'danger';
  delay: number;
}

interface SettingItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  delay: number;
}

interface PrivacyControlProps {
  title: string;
  description: string;
  value: string;
  onPress: () => void;
  delay: number;
}

// Custom icons for quick actions
const TestAlertIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.textPrimary}
    />
    <Path
      d="M12 6v6l4 2"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const AddContactIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      fill={Colors.textPrimary}
    />
    <Circle cx="8.5" cy="7" r="4" fill={Colors.textPrimary} />
    <Path
      d="M20 8v6M23 11h-6"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const EditContactIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      fill={Colors.textPrimary}
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HistoryIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill={Colors.textPrimary}
    />
    <Path
      d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      fill={Colors.background}
    />
  </Svg>
);

const ContactCard = ({ contact, delay }: { contact: Contact; delay: number }) => {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);
  const statusPulse = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    cardTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );

    // Status pulse animation for active contacts
    if (contact.status === 'active') {
      statusPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    }
  }, [contact.status, delay]);

  const getContactStyle = () => {
    switch (contact.type) {
      case 'primary':
        return { backgroundColor: Colors.primary, borderColor: Colors.primary };
      case 'secondary':
        return { backgroundColor: Colors.secondary, borderColor: Colors.secondary };
      case 'emergency':
        return { backgroundColor: Colors.danger, borderColor: Colors.danger };
      default:
        return { backgroundColor: Colors.background, borderColor: Colors.textMuted };
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const animatedStatusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statusPulse.value }],
  }));

  return (
    <Animated.View style={[styles.contactCard, getContactStyle(), animatedCardStyle]}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
        <Animated.View style={[styles.statusContainer, animatedStatusStyle]}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: contact.status === 'active' ? Colors.background : Colors.textMuted }
          ]}>
            <Text style={[
              styles.statusText,
              { color: contact.status === 'active' ? Colors.primary : Colors.textMuted }
            ]}>
              {contact.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </Animated.View>
      </View>
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
      case 'danger':
        return styles.dangerActionButton;
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
      <TouchableOpacity style={[styles.quickActionButton, getButtonStyle()]} onPress={onPress}>
        <View style={styles.actionIcon}>{icon}</View>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SettingItem = ({ title, description, value, onValueChange, delay }: SettingItemProps) => {
  const settingOpacity = useSharedValue(0);
  const settingTranslateX = useSharedValue(-20);

  useEffect(() => {
    settingOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    settingTranslateX.value = withDelay(
      delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedSettingStyle = useAnimatedStyle(() => ({
    opacity: settingOpacity.value,
    transform: [{ translateX: settingTranslateX.value }],
  }));

  return (
    <Animated.View style={[styles.settingItem, animatedSettingStyle]}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.textMuted + '40', true: Colors.primary }}
        thumbColor={value ? Colors.background : Colors.textMuted}
      />
    </Animated.View>
  );
};

const PrivacyControl = ({ title, description, value, onPress, delay }: PrivacyControlProps) => {
  const controlOpacity = useSharedValue(0);
  const controlTranslateY = useSharedValue(20);

  useEffect(() => {
    controlOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    controlTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedControlStyle = useAnimatedStyle(() => ({
    opacity: controlOpacity.value,
    transform: [{ translateY: controlTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.privacyControl, animatedControlStyle]}>
      <TouchableOpacity style={styles.privacyControlButton} onPress={onPress}>
        <View style={styles.privacyContent}>
          <Text style={styles.privacyTitle}>{title}</Text>
          <Text style={styles.privacyDescription}>{description}</Text>
        </View>
        <View style={styles.privacyValue}>
          <Text style={styles.privacyValueText}>{value}</Text>
          <Text style={styles.privacyArrow}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FamilyNetworkScreen() {
  const router = useRouter();
  const [dailyProgress, setDailyProgress] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [voiceMessages, setVoiceMessages] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  // Data
  const contacts: Contact[] = [
    { id: '1', name: 'Rajesh', relationship: 'Husband', phone: '+91 98765 43210', type: 'primary', status: 'active' },
    { id: '2', name: 'Sita', relationship: 'Mother', phone: '+91 98765 43211', type: 'secondary', status: 'active' },
    { id: '3', name: 'Dr. Sharma', relationship: 'Family Doctor', phone: '+91 98765 43212', type: 'emergency', status: 'active' },
  ];

  const notifications: Notification[] = [
    { id: '1', time: 'Today 2:30 PM', message: 'Notified Rajesh about your low energy', contact: 'Rajesh' },
    { id: '2', time: 'Yesterday 10:15 AM', message: 'Sent progress update to Sita', contact: 'Sita' },
    { id: '3', time: '2 days ago', message: 'Emergency alert sent to all contacts', contact: 'All Contacts' },
  ];

  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
  }, []);

  const handleTestEmergencyAlert = () => {
    console.log('Test emergency alert sent');
  };

  const handleAddNewContact = () => {
    console.log('Add new contact');
  };

  const handleEditContactDetails = () => {
    console.log('Edit contact details');
  };

  const handleViewNotificationHistory = () => {
    console.log('View notification history');
  };

  const handleShareMedicalHistory = () => {
    console.log('Share medical history settings');
  };

  const handleLocationSharingDuration = () => {
    console.log('Location sharing duration settings');
  };

  const handleEmergencyContactAccess = () => {
    console.log('Emergency contact access settings');
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const quickActions = [
    { title: 'Test Emergency Alert', icon: <TestAlertIcon size={24} />, onPress: handleTestEmergencyAlert, type: 'danger' as const, delay: 1200 },
    { title: 'Add New Contact', icon: <AddContactIcon size={24} />, onPress: handleAddNewContact, type: 'primary' as const, delay: 1400 },
    { title: 'Edit Contact Details', icon: <EditContactIcon size={24} />, onPress: handleEditContactDetails, type: 'secondary' as const, delay: 1600 },
    { title: 'View Notification History', icon: <HistoryIcon size={24} />, onPress: handleViewNotificationHistory, type: 'secondary' as const, delay: 1800 },
  ];

  const settings = [
    { title: 'Daily Progress Updates', description: 'Send daily progress updates to family', value: dailyProgress, onValueChange: setDailyProgress, delay: 2000 },
    { title: 'Emergency Alerts Only', description: 'Only send emergency alerts', value: emergencyAlerts, onValueChange: setEmergencyAlerts, delay: 2200 },
    { title: 'Voice Message Notifications', description: 'Send voice message notifications', value: voiceMessages, onValueChange: setVoiceMessages, delay: 2400 },
    { title: 'Location Sharing', description: 'Share location with family members', value: locationSharing, onValueChange: setLocationSharing, delay: 2600 },
  ];

  const privacyControls = [
    { title: 'Share Medical History', description: 'What family can see', value: 'Limited', onPress: handleShareMedicalHistory, delay: 2800 },
    { title: 'Location Sharing Duration', description: 'How long to share location', value: '24 hours', onPress: handleLocationSharingDuration, delay: 3000 },
    { title: 'Emergency Contact Access', description: 'Who can be contacted', value: 'All contacts', onPress: handleEmergencyContactAccess, delay: 3200 },
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
          <Text style={styles.title}>Family Network</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Family Network Section */}
        <Animated.View style={[styles.familyNetworkSection, animatedHeaderStyle]}>
          <Text style={styles.sectionTitle}>Family Network</Text>
          {contacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              delay={600 + (index * 200)}
            />
          ))}
        </Animated.View>

        {/* Recent Notifications */}
        <Animated.View style={[styles.notificationsSection, animatedHeaderStyle]}>
          <Text style={styles.sectionTitle}>Recent Notifications Sent</Text>
          <View style={styles.notificationsCard}>
            {notifications.map((notification, index) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Text style={styles.notificationTime}>{notification.time}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
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

        {/* Notification Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          {settings.map((setting, index) => (
            <SettingItem
              key={index}
              title={setting.title}
              description={setting.description}
              value={setting.value}
              onValueChange={setting.onValueChange}
              delay={setting.delay}
            />
          ))}
        </View>

        {/* Privacy Controls */}
        <View style={styles.privacySection}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>
          {privacyControls.map((control, index) => (
            <PrivacyControl
              key={index}
              title={control.title}
              description={control.description}
              value={control.value}
              onPress={control.onPress}
              delay={control.delay}
            />
          ))}
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
  familyNetworkSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  contactCard: {
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
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
  },
  notificationsSection: {
    marginBottom: 24,
  },
  notificationsCard: {
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
  notificationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  notificationTime: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
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
  dangerActionButton: {
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
  settingsSection: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  privacySection: {
    marginBottom: 24,
  },
  privacyControl: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  privacyControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  privacyContent: {
    flex: 1,
    marginRight: 16,
  },
  privacyTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  privacyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyValueText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    marginRight: 8,
  },
  privacyArrow: {
    fontSize: Typography.sizes.lg,
    color: Colors.textMuted,
  },
});
