import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch, Alert, TextInput, Modal } from 'react-native';
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
import { ASHAWorkerService, ASHAWorkerProfile } from '../lib/ashaWorkerService';
import { useAuth } from '../contexts/AuthContext';
import VoiceRecorder from '../components/VoiceRecorder';

const { width } = Dimensions.get('window');

interface CommunicationOptionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'emergency';
  delay: number;
}

interface EmergencyFeatureProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  delay: number;
}

interface SettingItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  delay: number;
}

// Custom icons for communication options
const VoiceCallIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const VideoCallIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const VoiceMessageIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 1c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V3c0-1.1-.9-2-2-2z"
      fill={Colors.textPrimary}
    />
    <Path
      d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2h2v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2h2z"
      fill={Colors.textPrimary}
    />
    <Path
      d="M11 21h2v2h-2z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const LocationIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const EmergencyCallIcon = ({ size = 24 }: { size?: number }) => (
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

const MedicalSummaryIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"
      fill={Colors.textPrimary}
    />
    <Path
      d="M14 2v6h6"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 13H8M16 17H8M10 9H8"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const HomeVisitIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

const CommunicationOption = ({ title, icon, onPress, type, delay }: CommunicationOptionProps) => {
  const optionOpacity = useSharedValue(0);
  const optionScale = useSharedValue(0.9);

  useEffect(() => {
    optionOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    optionScale.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'emergency':
        return styles.emergencyButton;
      default:
        return styles.secondaryButton;
    }
  };

  const animatedOptionStyle = useAnimatedStyle(() => ({
    opacity: optionOpacity.value,
    transform: [{ scale: optionScale.value }],
  }));

  return (
    <Animated.View style={animatedOptionStyle}>
      <TouchableOpacity style={[styles.communicationButton, getButtonStyle()]} onPress={onPress}>
        <View style={styles.communicationIcon}>{icon}</View>
        <Text style={styles.communicationText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmergencyFeature = ({ title, icon, onPress, delay }: EmergencyFeatureProps) => {
  const featureOpacity = useSharedValue(0);
  const featureTranslateY = useSharedValue(20);

  useEffect(() => {
    featureOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    featureTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedFeatureStyle = useAnimatedStyle(() => ({
    opacity: featureOpacity.value,
    transform: [{ translateY: featureTranslateY.value }],
  }));

  return (
    <Animated.View style={animatedFeatureStyle}>
      <TouchableOpacity style={styles.emergencyFeatureButton} onPress={onPress}>
        <View style={styles.emergencyFeatureIcon}>{icon}</View>
        <Text style={styles.emergencyFeatureText}>{title}</Text>
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

export default function ASHAWorkerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [ashaWorkerProfile, setAshaWorkerProfile] = useState<ASHAWorkerProfile | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  // voiceEnabled removed for clean demo
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [languageHindi, setLanguageHindi] = useState(false);
  const [familyNotifications, setFamilyNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showHomeVisitModal, setShowHomeVisitModal] = useState(false);
  const [homeVisitReason, setHomeVisitReason] = useState('');
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const statusPulse = useSharedValue(1);
  const profileOpacity = useSharedValue(0);
  const profileTranslateY = useSharedValue(30);
  const voiceOpacity = useSharedValue(0);
  const voiceTranslateY = useSharedValue(20);

  useEffect(() => {
    loadASHAWorkerData();
    loadSettings();
    loadMonitoringData();
  }, [user]);

  useEffect(() => {
    if (ashaWorkerProfile) {
      // Header animation
      headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
      headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

      // Profile animation
      profileOpacity.value = withDelay(
        300,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
      );
      profileTranslateY.value = withDelay(
        300,
        withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
      );

      // Status pulse animation
      if (ashaWorkerProfile.isOnline) {
        statusPulse.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          false
        );
      }

      // Voice section animation
      voiceOpacity.value = withDelay(
        600,
        withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
      );
      voiceTranslateY.value = withDelay(
        600,
        withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
      );
    }
  }, [ashaWorkerProfile]);

  const loadASHAWorkerData = async () => {
    try {
      const profile = await ASHAWorkerService.getASHAWorkerProfile();
      setAshaWorkerProfile(profile);
      setIsOnline(profile.isOnline);
    } catch (error) {
      console.error('Error loading ASHA worker data:', error);
    }
  };

  const loadSettings = async () => {
    if (!user?.id) return;
    
    try {
      const settings = await ASHAWorkerService.getSettings(user.id);
      if (settings) {
        setVoiceEnabled(settings.voice_enabled);
        setSmsEnabled(settings.sms_enabled);
        setLanguageHindi(settings.language_hindi);
        setFamilyNotifications(settings.family_notifications);
        setLocationSharing(settings.location_sharing);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadMonitoringData = async () => {
    if (!user?.id) return;
    
    try {
      const data = await ASHAWorkerService.getRealTimeMonitoringData(user.id);
      setMonitoringData(data);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    
    try {
      await ASHAWorkerService.updateSettings(user.id, {
        voice_enabled: voiceEnabled,
        sms_enabled: smsEnabled,
        language_hindi: languageHindi,
        family_notifications: familyNotifications,
        location_sharing: locationSharing
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleVoiceMessage = async (transcript: string) => {
    if (!user?.id || !ashaWorkerProfile) return;

    try {
      const voiceMessage = await ASHAWorkerService.recordVoiceMessage(
        user.id,
        ashaWorkerProfile.id,
        transcript
      );

      if (voiceMessage) {
        Alert.alert(
          'Voice Message Sent! 🎤',
          'Your voice message has been sent to your ASHA worker. They will respond soon.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      Alert.alert('Error', 'Failed to send voice message. Please try again.');
    }
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
  };

  const handleVoiceStop = () => {
    setIsRecording(false);
  };

  const handleVoiceCall = async () => {
    if (!ashaWorkerProfile) return;

    try {
      const success = await ASHAWorkerService.initiateVoiceCall(ashaWorkerProfile.phone);
      if (!success) {
        Alert.alert('Call Failed', 'Unable to initiate voice call. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating voice call:', error);
      Alert.alert('Error', 'Failed to initiate voice call.');
    }
  };

  const handleVideoCall = async () => {
    if (!ashaWorkerProfile || !user?.id) return;
    
    try {
      const success = await ASHAWorkerService.initiateVideoCall(ashaWorkerProfile.phone);
      if (success) {
        Alert.alert('Video Call Initiated', `Starting video call with ${ashaWorkerProfile.name}...`);
      }
    } catch (error) {
      console.error('Error making video call:', error);
    }
  };

  const handleVoiceMessagePress = () => {
    setShowVoiceModal(true);
  };

  // Voice transcript handling removed for clean demo

  const handleShareLocation = async () => {
    if (!user?.id || !ashaWorkerProfile) return;
    
    try {
      const success = await ASHAWorkerService.shareLocation(user.id, ashaWorkerProfile.id);
      if (success) {
        // Refresh monitoring data
        await loadMonitoringData();
      }
    } catch (error) {
      console.error('Error sharing location:', error);
    }
  };

  const handleEmergencyCall = async () => {
    if (!user?.id) return;
    
    try {
      const success = await ASHAWorkerService.makeEmergencyCall(user.id);
      if (!success) {
        Alert.alert('Emergency Call', 'No emergency contact found. Please add an emergency contact in your profile.');
      }
    } catch (error) {
      console.error('Error making emergency call:', error);
    }
  };

  const handleShareMedicalSummary = async () => {
    if (!user?.id || !ashaWorkerProfile) return;
    
    try {
      const success = await ASHAWorkerService.shareMedicalSummary(user.id, ashaWorkerProfile.id);
      if (success) {
        Alert.alert('Medical Summary Shared', 'Your medical summary has been shared with your ASHA worker.');
      }
    } catch (error) {
      console.error('Error sharing medical summary:', error);
    }
  };

  const handleRequestHomeVisit = () => {
    setShowHomeVisitModal(true);
  };

  const handleSubmitHomeVisitRequest = async () => {
    if (!user?.id || !ashaWorkerProfile || !homeVisitReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the home visit request.');
      return;
    }
    
    try {
      const homeVisitRequest = await ASHAWorkerService.requestHomeVisit(
        user.id, 
        ashaWorkerProfile.id, 
        homeVisitReason
      );
      
      if (homeVisitRequest) {
        setShowHomeVisitModal(false);
        setHomeVisitReason('');
      }
    } catch (error) {
      console.error('Error requesting home visit:', error);
    }
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const handleSettingChange = async (setting: string, value: boolean) => {
    switch (setting) {
      case 'voice':
        setVoiceEnabled(value);
        break;
      case 'sms':
        setSmsEnabled(value);
        break;
      case 'hindi':
        setLanguageHindi(value);
        break;
      case 'family':
        setFamilyNotifications(value);
        break;
      case 'location':
        setLocationSharing(value);
        break;
    }
    
    // Save settings after a short delay to avoid too many API calls
    setTimeout(() => {
      saveSettings();
    }, 500);
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedStatusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statusPulse.value }],
  }));

  const animatedProfileStyle = useAnimatedStyle(() => ({
    opacity: profileOpacity.value,
    transform: [{ translateY: profileTranslateY.value }],
  }));

  const animatedVoiceStyle = useAnimatedStyle(() => ({
    opacity: voiceOpacity.value,
    transform: [{ translateY: voiceTranslateY.value }],
  }));

  const communicationOptions = [
    { title: 'Voice Call', icon: <VoiceCallIcon size={24} />, onPress: handleVoiceCall, type: 'primary' as const, delay: 1200 },
    { title: 'Video Call', icon: <VideoCallIcon size={24} />, onPress: handleVideoCall, type: 'secondary' as const, delay: 1400 },
    { title: 'Send Voice Message', icon: <VoiceMessageIcon size={24} />, onPress: handleVoiceMessagePress, type: 'secondary' as const, delay: 1600 },
    { title: 'Share Location', icon: <LocationIcon size={24} />, onPress: handleShareLocation, type: 'secondary' as const, delay: 1800 },
  ];

  const emergencyFeatures = [
    { title: 'Emergency Call', icon: <EmergencyCallIcon size={24} />, onPress: handleEmergencyCall, delay: 2000 },
    { title: 'Share Medical Summary', icon: <MedicalSummaryIcon size={24} />, onPress: handleShareMedicalSummary, delay: 2200 },
    { title: 'Request Home Visit', icon: <HomeVisitIcon size={24} />, onPress: handleRequestHomeVisit, delay: 2400 },
  ];

  const settings = [
    { title: 'Voice Messages', description: 'Enable voice message recording', value: voiceEnabled, onValueChange: (value: boolean) => handleSettingChange('voice', value), delay: 2600 },
    { title: 'SMS Notifications', description: 'Get SMS updates and alerts', value: smsEnabled, onValueChange: (value: boolean) => handleSettingChange('sms', value), delay: 2800 },
    { title: 'Hindi Language', description: 'Use Hindi for communication', value: languageHindi, onValueChange: (value: boolean) => handleSettingChange('hindi', value), delay: 3000 },
    { title: 'Family Notifications', description: 'Notify family members of updates', value: familyNotifications, onValueChange: (value: boolean) => handleSettingChange('family', value), delay: 3200 },
    { title: 'Location Sharing', description: 'Share location for home visits', value: locationSharing, onValueChange: (value: boolean) => handleSettingChange('location', value), delay: 3400 },
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
          <Text style={styles.title}>ASHA Worker</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* ASHA Worker Profile */}
        {ashaWorkerProfile && (
          <Animated.View style={[styles.profileCard, animatedProfileStyle]}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {ashaWorkerProfile.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <Animated.View style={[styles.statusIndicator, animatedStatusStyle]}>
                  <View style={[styles.statusDot, { backgroundColor: ashaWorkerProfile.isOnline ? Colors.primary : Colors.textMuted }]} />
                </Animated.View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.workerName}>{ashaWorkerProfile.name} - ASHA Worker</Text>
                <Text style={styles.workerStatus}>
                  {ashaWorkerProfile.isOnline ? 'Online - Available for calls' : 'Offline'}
                </Text>
                <Text style={styles.workerSpecialization}>{ashaWorkerProfile.specialization}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>{ashaWorkerProfile.rating}/5</Text>
                  <Text style={styles.ratingSubtext}>({ashaWorkerProfile.patientsHelped} mothers helped)</Text>
                </View>
                <Text style={styles.workerExperience}>
                  {ashaWorkerProfile.experience} years experience • Languages: {ashaWorkerProfile.languages.join(', ')}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Real-time Monitoring */}
        <Animated.View style={[styles.monitoringSection, animatedProfileStyle]}>
          <Text style={styles.sectionTitle}>Real-time Monitoring</Text>
          <View style={styles.monitoringCard}>
            <Text style={styles.monitoringText}>
              <Text style={styles.monitoringBold}>Your Progress:</Text> {ashaWorkerProfile?.name} can see your recovery timeline and recent check-ins
            </Text>
            <Text style={styles.monitoringText}>
              <Text style={styles.monitoringBold}>Health Metrics:</Text> {monitoringData?.healthMetrics?.length || 0} recent check-ins recorded
            </Text>
            <Text style={styles.monitoringText}>
              <Text style={styles.monitoringBold}>Messages:</Text> {monitoringData?.voiceCheckins?.length || 0} messages shared
            </Text>
            <Text style={styles.monitoringText}>
              <Text style={styles.monitoringBold}>Last Updated:</Text> {monitoringData?.lastUpdated ? new Date(monitoringData.lastUpdated).toLocaleString() : 'Never'}
            </Text>
          </View>
        </Animated.View>

        {/* Communication Options */}
        <View style={styles.communicationSection}>
          <Text style={styles.sectionTitle}>Communication Options</Text>
          <View style={styles.communicationGrid}>
            {communicationOptions.map((option, index) => (
              <CommunicationOption
                key={index}
                title={option.title}
                icon={option.icon}
                onPress={option.onPress}
                type={option.type}
                delay={option.delay}
              />
            ))}
          </View>
        </View>

        {/* Emergency Features */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Features</Text>
          {emergencyFeatures.map((feature, index) => (
            <EmergencyFeature
              key={index}
              title={feature.title}
              icon={feature.icon}
              onPress={feature.onPress}
              delay={feature.delay}
            />
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
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

        {/* Voice Message Recording */}
        {voiceEnabled && (
          <Animated.View style={[styles.voiceSection, animatedVoiceStyle]}>
            <Text style={styles.voiceSectionTitle}>Send Voice Message</Text>
            <Text style={styles.voiceSectionSubtitle}>
              Record a voice message for your ASHA worker
            </Text>
            <VoiceRecorder
              onTranscript={handleVoiceMessage}
              onStart={handleVoiceStart}
              onStop={handleVoiceStop}
              isListening={isRecording}
              disabled={!ashaWorkerProfile?.isOnline}
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Home Visit Request Modal */}
      <Modal
        visible={showHomeVisitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHomeVisitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Home Visit</Text>
            <Text style={styles.modalDescription}>
              Please provide a reason for the home visit request. Your ASHA worker will confirm the appointment.
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for home visit..."
              value={homeVisitReason}
              onChangeText={setHomeVisitReason}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowHomeVisitModal(false);
                  setHomeVisitReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitHomeVisitRequest}
              >
                <Text style={styles.submitButtonText}>Request Visit</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  profileCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  profileInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  workerStatus: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    marginBottom: 8,
  },
  workerSpecialization: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.warning,
    marginRight: 8,
  },
  ratingSubtext: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  monitoringSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  monitoringCard: {
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
  monitoringText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 8,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  monitoringBold: {
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  communicationSection: {
    marginBottom: 24,
  },
  communicationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  communicationButton: {
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
    borderColor: Colors.primary,
  },
  emergencyButton: {
    backgroundColor: Colors.danger,
  },
  communicationIcon: {
    marginBottom: 8,
  },
  communicationText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emergencySection: {
    marginBottom: 24,
  },
  emergencyFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyFeatureIcon: {
    marginRight: 16,
  },
  emergencyFeatureText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
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
  workerExperience: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginTop: 4,
  },
  // Voice recorder styles removed for clean demo
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    marginBottom: 24,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.textMuted + '20',
    borderWidth: 1,
    borderColor: Colors.textMuted,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textMuted,
  },
  submitButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
  },
  voiceSection: {
    backgroundColor: Colors.textLight,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  voiceSectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  voiceSectionSubtitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
});
