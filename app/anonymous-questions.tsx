import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal } from 'react-native';
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

interface Question {
  id: string;
  text: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  aiResponse: string;
  timestamp: Date;
  isAnonymous: boolean;
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'danger';
  delay: number;
}

// Custom icons for anonymous questions features
const AskIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
      fill={Colors.primary}
    />
  </Svg>
);

const HistoryIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill={Colors.secondary}
    />
    <Path
      d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      fill={Colors.background}
    />
  </Svg>
);

const HelpIcon = ({ size = 24 }: { size?: number }) => (
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

const TipsIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={Colors.primary}
    />
    <Circle cx="12" cy="12" r="3" fill={Colors.secondary} />
  </Svg>
);

const QuestionCard = ({ question, delay }: { question: Question; delay: number }) => {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);

  useEffect(() => {
    cardOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    cardTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getUrgencyColor = () => {
    switch (question.urgency) {
      case 'high':
        return Colors.danger;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.primary;
      default:
        return Colors.textMuted;
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.questionCard, animatedCardStyle]}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionCategory}>{question.category}</Text>
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor() }]}>
          <Text style={styles.urgencyText}>{question.urgency.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.questionText}>{question.text}</Text>
      <View style={styles.responseContainer}>
        <Text style={styles.responseLabel}>AI Response:</Text>
        <Text style={styles.responseText}>{question.aiResponse}</Text>
      </View>
      <View style={styles.questionFooter}>
        <Text style={styles.timestamp}>{question.timestamp.toLocaleDateString()}</Text>
        <View style={styles.anonymousBadge}>
          <Text style={styles.anonymousText}>🔒 Anonymous</Text>
        </View>
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
      <TouchableOpacity style={[styles.actionButton, getButtonStyle()]} onPress={onPress}>
        <View style={styles.actionIcon}>{icon}</View>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AnonymousQuestionsScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Postpartum Concerns');
  const [selectedUrgency, setSelectedUrgency] = useState<'low' | 'medium' | 'high'>('low');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  const privacyPulse = useSharedValue(1);

  // Data
  const categories = [
    'Postpartum Concerns',
    'Baby Care',
    'Mental Health',
    'Family Issues',
    'Medical Questions'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: Colors.primary },
    { value: 'medium', label: 'Medium', color: Colors.warning },
    { value: 'high', label: 'High', color: Colors.danger }
  ];

  const sampleQuestions: Question[] = [
    {
      id: '1',
      text: 'Is it normal to feel very tired 2 weeks after delivery?',
      category: 'Postpartum Concerns',
      urgency: 'low',
      aiResponse: 'Yes, feeling tired is completely normal. Your body is healing and adjusting to new routines. Make sure to rest when baby sleeps and ask for help from family.',
      timestamp: new Date('2024-01-15'),
      isAnonymous: true
    },
    {
      id: '2',
      text: 'My baby cries a lot during feeding. What should I do?',
      category: 'Baby Care',
      urgency: 'medium',
      aiResponse: 'Try different feeding positions, check if baby is too hungry or overfed, and ensure proper burping. If crying persists, consult your pediatrician.',
      timestamp: new Date('2024-01-14'),
      isAnonymous: true
    },
    {
      id: '3',
      text: 'I feel overwhelmed and anxious. Is this normal?',
      category: 'Mental Health',
      urgency: 'high',
      aiResponse: 'Postpartum anxiety is common. Please reach out to your healthcare provider or a mental health professional. You\'re not alone, and help is available.',
      timestamp: new Date('2024-01-13'),
      isAnonymous: true
    }
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

    // Privacy pulse animation
    privacyPulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
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
    setNewQuestion(text);
    setShowQuestionModal(true);
  };

  const handleAskNewQuestion = () => {
    setShowQuestionModal(true);
  };

  const handleViewMyQuestions = () => {
    console.log('View my questions');
  };

  const handleGetHelpNow = () => {
    console.log('Get help now');
  };

  const handleCommunityTips = () => {
    console.log('Community tips');
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim()) {
      console.log('Question submitted:', {
        text: newQuestion,
        category: selectedCategory,
        urgency: selectedUrgency
      });
      setNewQuestion('');
      setShowQuestionModal(false);
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

  const animatedPrivacyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: privacyPulse.value }],
  }));

  const quickActions = [
    { title: 'Ask New Question', icon: <AskIcon size={24} />, onPress: handleAskNewQuestion, type: 'primary' as const, delay: 1200 },
    { title: 'View My Questions', icon: <HistoryIcon size={24} />, onPress: handleViewMyQuestions, type: 'secondary' as const, delay: 1500 },
    { title: 'Get Help Now', icon: <HelpIcon size={24} />, onPress: handleGetHelpNow, type: 'danger' as const, delay: 1800 },
    { title: 'Community Tips', icon: <TipsIcon size={24} />, onPress: handleCommunityTips, type: 'secondary' as const, delay: 2100 },
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
          <Text style={styles.title}>Ask Anonymously</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Privacy Indicator */}
        <Animated.View style={[styles.privacyCard, animatedPrivacyStyle]}>
          <Text style={styles.privacyTitle}>🔒 Your identity is protected</Text>
          <Text style={styles.privacyText}>Ask sensitive questions without fear of judgment</Text>
        </Animated.View>

        {/* Question Categories */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Question Categories</Text>
          <View style={styles.categoriesCard}>
            {categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryText}>• {category}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Ask a Question Section */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Ask a Question</Text>
          <View style={styles.askCard}>
            <Text style={styles.askDescription}>
              Speak your question privately or type it below. Your identity will remain completely anonymous.
            </Text>
            <View style={styles.voiceContainer}>
              <VoiceRecorder
                onTranscript={handleVoiceTranscript}
                onStart={handleVoiceStart}
                onStop={handleVoiceStop}
                isListening={isListening}
                disabled={false}
              />
              <Text style={styles.voiceLabel}>Speak your question privately</Text>
            </View>
            <TouchableOpacity style={styles.textInputButton} onPress={handleAskNewQuestion}>
              <Text style={styles.textInputButtonText}>Type your question here...</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* AI Response System */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>AI Response System</Text>
          <View style={styles.aiCard}>
            <View style={styles.aiFeature}>
              <Text style={styles.aiFeatureTitle}>Instant Response</Text>
              <Text style={styles.aiFeatureText}>Get immediate AI-powered answers to your questions</Text>
            </View>
            <View style={styles.aiFeature}>
              <Text style={styles.aiFeatureTitle}>Personalized Advice</Text>
              <Text style={styles.aiFeatureText}>Responses tailored to your specific situation and history</Text>
            </View>
            <View style={styles.aiFeature}>
              <Text style={styles.aiFeatureTitle}>Cultural Sensitivity</Text>
              <Text style={styles.aiFeatureText}>Answers consider local customs and cultural context</Text>
            </View>
          </View>
        </Animated.View>

        {/* Community Support */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Community Support</Text>
          <View style={styles.communityCard}>
            <View style={styles.communityFeature}>
              <Text style={styles.communityFeatureTitle}>Peer Answers</Text>
              <Text style={styles.communityFeatureText}>Other mothers have asked similar questions</Text>
            </View>
            <View style={styles.communityFeature}>
              <Text style={styles.communityFeatureTitle}>Expert Responses</Text>
              <Text style={styles.communityFeatureText}>ASHA workers and doctors answer complex questions</Text>
            </View>
            <View style={styles.communityFeature}>
              <Text style={styles.communityFeatureTitle}>Success Stories</Text>
              <Text style={styles.communityFeatureText}>How other mothers overcame similar challenges</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Questions */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Recent Questions</Text>
          {sampleQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              delay={900 + (index * 200)}
            />
          ))}
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
                type={action.type}
                delay={action.delay}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Question Modal */}
      <Modal
        visible={showQuestionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuestionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowQuestionModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ask a Question</Text>
            <TouchableOpacity onPress={handleSubmitQuestion}>
              <Text style={styles.modalSubmitButton}>Submit</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Your Question:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={newQuestion}
              onChangeText={setNewQuestion}
              placeholder="Type your question here..."
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.modalLabel}>Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonSelected
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.modalLabel}>Urgency Level:</Text>
            <View style={styles.urgencyContainer}>
              {urgencyLevels.map((level, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.urgencyButton,
                    { borderColor: level.color },
                    selectedUrgency === level.value && { backgroundColor: level.color }
                  ]}
                  onPress={() => setSelectedUrgency(level.value as 'low' | 'medium' | 'high')}
                >
                  <Text style={[
                    styles.urgencyButtonText,
                    { color: level.color },
                    selectedUrgency === level.value && { color: Colors.background }
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
  privacyCard: {
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
  privacyTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  privacyText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    opacity: 0.9,
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
  categoriesCard: {
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
  categoryItem: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
  },
  askCard: {
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
  askDescription: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 16,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  voiceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  voiceLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  textInputButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  textInputButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  aiCard: {
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
  aiFeature: {
    marginBottom: 16,
  },
  aiFeatureTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  aiFeatureText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  communityCard: {
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
  communityFeature: {
    marginBottom: 16,
  },
  communityFeatureTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  communityFeatureText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  questionCard: {
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionCategory: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
  },
  questionText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  responseContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  anonymousBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  anonymousText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
    color: Colors.background,
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
  },
  modalCloseButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  modalSubmitButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  modalTextInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  categoryButtonTextSelected: {
    color: Colors.background,
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  urgencyButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
  },
});
