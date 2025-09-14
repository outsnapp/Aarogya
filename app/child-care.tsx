import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, Alert } from 'react-native';
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
import { useAuth } from '../contexts/AuthContext';
import { ChildCareService, BabyProfile, BabyGrowth, BabyMilestone, BabyFeeding, DailyCheckIn, HealthAssessment } from '../lib/childCareService';

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
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [latestGrowth, setLatestGrowth] = useState<BabyGrowth | null>(null);
  const [milestones, setMilestones] = useState<BabyMilestone[]>([]);
  const [recentFeeding, setRecentFeeding] = useState<BabyFeeding[]>([]);
  const [todaysCheckIn, setTodaysCheckIn] = useState<DailyCheckIn | null>(null);
  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  
  // Modal states
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  
  // Form states
  const [checkInData, setCheckInData] = useState<Partial<DailyCheckIn>>({});
  const [feedingData, setFeedingData] = useState<Partial<BabyFeeding>>({});
  const [milestoneData, setMilestoneData] = useState<Partial<BabyMilestone>>({});
  const [growthData, setGrowthData] = useState<Partial<BabyGrowth>>({});

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  // voicePulse removed for clean demo

  // Load baby data on component mount
  useEffect(() => {
    if (user) {
      loadBabyData();
    }
  }, [user]);

  const loadBabyData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load baby profile
      const profile = await ChildCareService.getBabyProfile(user.id);
      setBabyProfile(profile);
      
      if (profile) {
        // Load related data
        const [growth, milestoneData, feedingData, checkIn] = await Promise.all([
          ChildCareService.getLatestGrowth(profile.id),
          ChildCareService.getMilestones(profile.id),
          ChildCareService.getRecentFeeding(profile.id, 7),
          ChildCareService.getTodaysCheckIn(profile.id)
        ]);
        
        setLatestGrowth(growth);
        setMilestones(milestoneData);
        setRecentFeeding(feedingData);
        setTodaysCheckIn(checkIn);
        
        // If we have today's check-in, assess health
        if (checkIn) {
          const ageInMonths = ChildCareService.calculateAgeInMonths(profile.date_of_birth);
          const assessment = ChildCareService.assessHealth(checkIn, ageInMonths);
          setHealthAssessment(assessment);
        }
      }
    } catch (error) {
      console.error('Error loading baby data:', error);
      Alert.alert('Error', 'Failed to load baby data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

    // Voice button pulse animation removed for clean demo
  }, []);

  // Voice recording functions removed for clean demo

  const handleDailyCheckIn = () => {
    if (!babyProfile) {
      Alert.alert('Error', 'No baby profile found. Please complete onboarding first.');
      return;
    }
    setShowDailyCheckIn(true);
  };

  const handleLogFeeding = () => {
    if (!babyProfile) {
      Alert.alert('Error', 'No baby profile found. Please complete onboarding first.');
      return;
    }
    setFeedingData({
      baby_id: babyProfile.id,
      feeding_date: new Date().toISOString(),
      feeding_type: 'bottle',
      amount_ml: null,
      duration_minutes: null,
      food_items: null,
      notes: null
    });
    setShowFeedingModal(true);
  };

  const handleRecordMilestone = () => {
    if (!babyProfile) {
      Alert.alert('Error', 'No baby profile found. Please complete onboarding first.');
      return;
    }
    setMilestoneData({
      baby_id: babyProfile.id,
      milestone_type: 'motor',
      milestone_name: '',
      expected_age_months: null,
      achieved_date: new Date().toISOString().split('T')[0],
      is_achieved: true,
      notes: null
    });
    setShowMilestoneModal(true);
  };

  const handleAskAboutBaby = () => {
    // Voice input removed for clean demo
    console.log('Ask about baby');
  };

  const handleGrowthChart = () => {
    if (!babyProfile) {
      Alert.alert('Error', 'No baby profile found. Please complete onboarding first.');
      return;
    }
    setGrowthData({
      baby_id: babyProfile.id,
      recorded_date: new Date().toISOString().split('T')[0],
      weight: null,
      height: null,
      head_circumference: null,
      notes: null
    });
    setShowGrowthModal(true);
  };

  const handleSaveDailyCheckIn = async () => {
    if (!babyProfile || !checkInData) return;
    
    try {
      const fullCheckIn: DailyCheckIn = {
        baby_id: babyProfile.id,
        checkin_date: new Date().toISOString().split('T')[0],
        temperature: checkInData.temperature || null,
        weight: checkInData.weight || null,
        height: checkInData.height || null,
        head_circumference: checkInData.head_circumference || null,
        feeding_count: checkInData.feeding_count || null,
        sleep_hours: checkInData.sleep_hours || null,
        mood_score: checkInData.mood_score || null,
        activity_level: checkInData.activity_level || null,
        diaper_changes: checkInData.diaper_changes || null,
        concerns: checkInData.concerns || null,
        notes: checkInData.notes || null,
      };
      
      const result = await ChildCareService.saveDailyCheckIn(fullCheckIn);
      
      if (result.success) {
        Alert.alert('Success', 'Daily check-in saved successfully!');
        setShowDailyCheckIn(false);
        setCheckInData({});
        // Reload data
        await loadBabyData();
      } else {
        Alert.alert('Error', 'Failed to save daily check-in. Please try again.');
      }
    } catch (error) {
      console.error('Error saving daily check-in:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSaveFeeding = async () => {
    if (!feedingData) return;
    
    try {
      const result = await ChildCareService.saveFeeding(feedingData as Omit<BabyFeeding, 'id' | 'created_at'>);
      
      if (result.success) {
        Alert.alert('Success', 'Feeding record saved successfully!');
        setShowFeedingModal(false);
        setFeedingData({});
        await loadBabyData();
      } else {
        Alert.alert('Error', 'Failed to save feeding record. Please try again.');
      }
    } catch (error) {
      console.error('Error saving feeding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSaveMilestone = async () => {
    if (!milestoneData) return;
    
    try {
      const result = await ChildCareService.saveMilestone(milestoneData as Omit<BabyMilestone, 'id' | 'created_at'>);
      
      if (result.success) {
        Alert.alert('Success', 'Milestone recorded successfully!');
        setShowMilestoneModal(false);
        setMilestoneData({});
        await loadBabyData();
      } else {
        Alert.alert('Error', 'Failed to save milestone. Please try again.');
      }
    } catch (error) {
      console.error('Error saving milestone:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSaveGrowth = async () => {
    if (!growthData) return;
    
    try {
      const result = await ChildCareService.saveGrowth(growthData as Omit<BabyGrowth, 'id' | 'created_at'>);
      
      if (result.success) {
        Alert.alert('Success', 'Growth measurement saved successfully!');
        setShowGrowthModal(false);
        setGrowthData({});
        await loadBabyData();
      } else {
        Alert.alert('Error', 'Failed to save growth measurement. Please try again.');
      }
    } catch (error) {
      console.error('Error saving growth:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
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

  // Voice animation removed for clean demo

  const quickActions = [
    { title: 'Daily Check-in', icon: <FeedingIcon size={28} />, onPress: handleDailyCheckIn, delay: 1200 },
    { title: 'Log Feeding', icon: <FeedingIcon size={28} />, onPress: handleLogFeeding, delay: 1500 },
    { title: 'Record Milestone', icon: <MilestoneIcon size={28} />, onPress: handleRecordMilestone, delay: 1800 },
    { title: 'Growth Chart', icon: <ChartIcon size={28} />, onPress: handleGrowthChart, delay: 2100 },
  ];

  // Helper functions
  const getBabyAge = () => {
    if (!babyProfile) return 'Unknown';
    const ageInMonths = ChildCareService.calculateAgeInMonths(babyProfile.date_of_birth);
    if (ageInMonths < 1) return 'Newborn';
    if (ageInMonths < 12) return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''} old`;
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''} old`;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return Colors.primary;
      case 'good': return Colors.secondary;
      case 'fair': return Colors.warning;
      case 'poor': return '#FF6B6B';
      default: return Colors.textMuted;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading baby data...</Text>
      </View>
    );
  }

  if (!babyProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No baby profile found. Please complete onboarding first.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/onboarding')}>
          <Text style={styles.retryButtonText}>Go to Onboarding</Text>
        </TouchableOpacity>
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
          <Text style={styles.title}>Baby Care Center</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Baby Info Header */}
        <Animated.View style={[styles.babyInfoCard, animatedHeaderStyle]}>
          <Text style={styles.babyInfoTitle}>👶 {babyProfile.name} - {getBabyAge()}</Text>
          {healthAssessment && (
            <View style={styles.healthStatusContainer}>
              <Text style={[styles.healthStatus, { color: getHealthStatusColor(healthAssessment.overall_health) }]}>
                Health: {healthAssessment.overall_health.toUpperCase()}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Growth Tracking Section */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Growth Tracking</Text>
          <View style={styles.growthCard}>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Current Weight:</Text>
              <Text style={styles.growthValue}>{latestGrowth?.weight ? `${latestGrowth.weight} kg` : 'Not recorded'}</Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Height:</Text>
              <Text style={styles.growthValue}>{latestGrowth?.height ? `${latestGrowth.height} cm` : 'Not recorded'}</Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Head Circumference:</Text>
              <Text style={styles.growthValue}>{latestGrowth?.head_circumference ? `${latestGrowth.head_circumference} cm` : 'Not recorded'}</Text>
            </View>
            <View style={styles.growthRow}>
              <Text style={styles.growthLabel}>Last Updated:</Text>
              <Text style={styles.growthValue}>{latestGrowth ? new Date(latestGrowth.recorded_date).toLocaleDateString() : 'Never'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Today's Check-in Section */}
        {todaysCheckIn && (
          <Animated.View style={[styles.section, animatedSectionStyle]}>
            <Text style={styles.sectionTitle}>Today's Health Check-in</Text>
            <View style={styles.checkInCard}>
              <View style={styles.checkInRow}>
                <Text style={styles.checkInLabel}>Temperature:</Text>
                <Text style={styles.checkInValue}>{todaysCheckIn.temperature ? `${todaysCheckIn.temperature}°F` : 'Not recorded'}</Text>
              </View>
              <View style={styles.checkInRow}>
                <Text style={styles.checkInLabel}>Feedings Today:</Text>
                <Text style={styles.checkInValue}>{todaysCheckIn.feeding_count || 'Not recorded'}</Text>
              </View>
              <View style={styles.checkInRow}>
                <Text style={styles.checkInLabel}>Sleep Hours:</Text>
                <Text style={styles.checkInValue}>{todaysCheckIn.sleep_hours ? `${todaysCheckIn.sleep_hours}h` : 'Not recorded'}</Text>
              </View>
              <View style={styles.checkInRow}>
                <Text style={styles.checkInLabel}>Mood Score:</Text>
                <Text style={styles.checkInValue}>{todaysCheckIn.mood_score ? `${todaysCheckIn.mood_score}/10` : 'Not recorded'}</Text>
              </View>
              {todaysCheckIn.concerns && (
                <View style={styles.concernsRow}>
                  <Text style={styles.concernsLabel}>Concerns:</Text>
                  <Text style={styles.concernsValue}>{todaysCheckIn.concerns}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Health Assessment */}
        {healthAssessment && (
          <Animated.View style={[styles.section, animatedSectionStyle]}>
            <Text style={styles.sectionTitle}>Health Assessment</Text>
            <View style={styles.assessmentCard}>
              {healthAssessment.alerts.length > 0 && (
                <View style={styles.alertsContainer}>
                  <Text style={styles.alertsTitle}>⚠️ Alerts:</Text>
                  {healthAssessment.alerts.map((alert, index) => (
                    <Text key={index} style={styles.alertText}>• {alert}</Text>
                  ))}
                </View>
              )}
              {healthAssessment.recommendations.length > 0 && (
                <View style={styles.recommendationsContainer}>
                  <Text style={styles.recommendationsTitle}>💡 Recommendations:</Text>
                  {healthAssessment.recommendations.map((rec, index) => (
                    <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Developmental Milestones */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Developmental Milestones</Text>
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={{
                  type: milestone.milestone_type,
                  description: milestone.milestone_name,
                  isAchieved: milestone.is_achieved,
                  expectedDate: milestone.is_achieved ? 'Achieved' : `Expected at ${milestone.expected_age_months} months`
                }}
                delay={900 + (index * 200)}
              />
            ))
          ) : (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataText}>No milestones recorded yet. Record your first milestone!</Text>
            </View>
          )}
        </Animated.View>

        {/* Recent Feeding History */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Recent Feeding History</Text>
          {recentFeeding.length > 0 ? (
            <View style={styles.feedingCard}>
              {recentFeeding.slice(0, 3).map((feeding, index) => (
                <View key={feeding.id} style={styles.feedingRow}>
                  <Text style={styles.feedingLabel}>
                    {new Date(feeding.feeding_date).toLocaleDateString()} - {feeding.feeding_type}
                  </Text>
                  <Text style={styles.feedingValue}>
                    {feeding.amount_ml ? `${feeding.amount_ml}ml` : ''} {feeding.duration_minutes ? `(${feeding.duration_minutes}min)` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataText}>No feeding records yet. Log your first feeding!</Text>
            </View>
          )}
        </Animated.View>

        {/* Health Monitoring */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Health Monitoring</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Birth Date:</Text>
              <Text style={styles.healthValue}>{new Date(babyProfile.date_of_birth).toLocaleDateString()}</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Delivery Type:</Text>
              <Text style={styles.healthValue}>{babyProfile.delivery_type || 'Not specified'}</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Medical Conditions:</Text>
              <Text style={styles.healthValue}>{babyProfile.medical_conditions || 'None recorded'}</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>Profile Created:</Text>
              <Text style={styles.healthValue}>{new Date(babyProfile.created_at).toLocaleDateString()}</Text>
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

        {/* Voice recording removed for clean demo */}
      </ScrollView>

      {/* Daily Check-in Modal */}
      <Modal visible={showDailyCheckIn} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daily Health Check-in</Text>
            <TouchableOpacity onPress={() => setShowDailyCheckIn(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Temperature (°F)</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.temperature?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, temperature: parseFloat(text) || null }))}
                placeholder="98.6"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.weight?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, weight: parseFloat(text) || null }))}
                placeholder="6.2"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.height?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, height: parseFloat(text) || null }))}
                placeholder="62"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Head Circumference (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.head_circumference?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, head_circumference: parseFloat(text) || null }))}
                placeholder="40"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Number of Feedings Today</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.feeding_count?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, feeding_count: parseInt(text) || null }))}
                placeholder="6"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sleep Hours</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.sleep_hours?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, sleep_hours: parseFloat(text) || null }))}
                placeholder="14"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mood Score (1-10)</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.mood_score?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, mood_score: parseInt(text) || null }))}
                placeholder="8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level (1-10)</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.activity_level?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, activity_level: parseInt(text) || null }))}
                placeholder="7"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Diaper Changes</Text>
              <TextInput
                style={styles.textInput}
                value={checkInData.diaper_changes?.toString() || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, diaper_changes: parseInt(text) || null }))}
                placeholder="6"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Concerns (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={checkInData.concerns || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, concerns: text }))}
                placeholder="Any concerns about baby's health..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={checkInData.notes || ''}
                onChangeText={(text) => setCheckInData(prev => ({ ...prev, notes: text }))}
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDailyCheckIn(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDailyCheckIn}>
              <Text style={styles.saveButtonText}>Save Check-in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feeding Modal */}
      <Modal visible={showFeedingModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Feeding</Text>
            <TouchableOpacity onPress={() => setShowFeedingModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Feeding Type</Text>
              <View style={styles.radioGroup}>
                {['breastfeeding', 'bottle', 'solid'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, feedingData.feeding_type === type && styles.radioSelected]}
                    onPress={() => setFeedingData(prev => ({ ...prev, feeding_type: type as any }))}
                  >
                    <Text style={[styles.radioText, feedingData.feeding_type === type && styles.radioTextSelected]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (ml)</Text>
              <TextInput
                style={styles.textInput}
                value={feedingData.amount_ml?.toString() || ''}
                onChangeText={(text) => setFeedingData(prev => ({ ...prev, amount_ml: parseInt(text) || null }))}
                placeholder="120"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={feedingData.duration_minutes?.toString() || ''}
                onChangeText={(text) => setFeedingData(prev => ({ ...prev, duration_minutes: parseInt(text) || null }))}
                placeholder="15"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Items (for solid food)</Text>
              <TextInput
                style={styles.textInput}
                value={feedingData.food_items || ''}
                onChangeText={(text) => setFeedingData(prev => ({ ...prev, food_items: text }))}
                placeholder="Rice cereal, banana..."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={feedingData.notes || ''}
                onChangeText={(text) => setFeedingData(prev => ({ ...prev, notes: text }))}
                placeholder="How did the feeding go?"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFeedingModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveFeeding}>
              <Text style={styles.saveButtonText}>Save Feeding</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Milestone Modal */}
      <Modal visible={showMilestoneModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Milestone</Text>
            <TouchableOpacity onPress={() => setShowMilestoneModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Milestone Type</Text>
              <View style={styles.radioGroup}>
                {['motor', 'social', 'cognitive', 'language'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.radioOption, milestoneData.milestone_type === type && styles.radioSelected]}
                    onPress={() => setMilestoneData(prev => ({ ...prev, milestone_type: type as any }))}
                  >
                    <Text style={[styles.radioText, milestoneData.milestone_type === type && styles.radioTextSelected]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Milestone Name</Text>
              <TextInput
                style={styles.textInput}
                value={milestoneData.milestone_name || ''}
                onChangeText={(text) => setMilestoneData(prev => ({ ...prev, milestone_name: text }))}
                placeholder="e.g., Rolling over, First smile..."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected Age (months)</Text>
              <TextInput
                style={styles.textInput}
                value={milestoneData.expected_age_months?.toString() || ''}
                onChangeText={(text) => setMilestoneData(prev => ({ ...prev, expected_age_months: parseInt(text) || null }))}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Achieved Date</Text>
              <TextInput
                style={styles.textInput}
                value={milestoneData.achieved_date || ''}
                onChangeText={(text) => setMilestoneData(prev => ({ ...prev, achieved_date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={milestoneData.notes || ''}
                onChangeText={(text) => setMilestoneData(prev => ({ ...prev, notes: text }))}
                placeholder="Additional details about this milestone..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowMilestoneModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMilestone}>
              <Text style={styles.saveButtonText}>Save Milestone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Growth Modal */}
      <Modal visible={showGrowthModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Growth Measurement</Text>
            <TouchableOpacity onPress={() => setShowGrowthModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={growthData.weight?.toString() || ''}
                onChangeText={(text) => setGrowthData(prev => ({ ...prev, weight: parseFloat(text) || null }))}
                placeholder="6.2"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={growthData.height?.toString() || ''}
                onChangeText={(text) => setGrowthData(prev => ({ ...prev, height: parseFloat(text) || null }))}
                placeholder="62"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Head Circumference (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={growthData.head_circumference?.toString() || ''}
                onChangeText={(text) => setGrowthData(prev => ({ ...prev, head_circumference: parseFloat(text) || null }))}
                placeholder="40"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={growthData.notes || ''}
                onChangeText={(text) => setGrowthData(prev => ({ ...prev, notes: text }))}
                placeholder="Any observations about baby's growth..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowGrowthModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGrowth}>
              <Text style={styles.saveButtonText}>Save Measurement</Text>
            </TouchableOpacity>
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
  // Voice recording styles removed for clean demo
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
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
  // Health Status
  healthStatusContainer: {
    marginTop: 8,
  },
  healthStatus: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    textAlign: 'center',
  },
  // Check-in Card
  checkInCard: {
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
  checkInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkInLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  checkInValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
    textAlign: 'right',
    flex: 1,
  },
  concernsRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.primaryLight,
  },
  concernsLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.warning,
    marginBottom: 4,
  },
  concernsValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  // Assessment Card
  assessmentCard: {
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
  alertsContainer: {
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.warning,
    marginBottom: 8,
  },
  alertText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  // Feeding Card
  feedingCard: {
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
  feedingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedingLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  feedingValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.secondary,
    textAlign: 'right',
    flex: 1,
  },
  // No Data Card
  noDataCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
    backgroundColor: Colors.primary + '10',
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textMuted,
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.primaryLight,
    backgroundColor: Colors.primary + '10',
  },
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Radio Group Styles
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
  },
  radioSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  radioTextSelected: {
    color: Colors.background,
  },
  // Button Styles
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
    textAlign: 'center',
  },
});
