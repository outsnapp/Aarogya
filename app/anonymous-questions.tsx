import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal, Alert, RefreshControl } from 'react-native';
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
import { AnonymousQuestionsService, AnonymousQuestion, QuestionSubmission, AIResponse } from '../lib/anonymousQuestionsService';

const { width } = Dimensions.get('window');

interface Question {
  id: string;
  text: string;
  category: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  aiResponse: string;
  timestamp: Date;
  isAnonymous: boolean;
  suggestions?: string[];
  followUpQuestions?: string[];
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
  // Voice recording removed for clean demo
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Postpartum Concerns');
  const [selectedUrgency, setSelectedUrgency] = useState<'low' | 'normal' | 'high' | 'urgent'>('low');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [questions, setQuestions] = useState<AnonymousQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<AnonymousQuestion[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'category' | 'urgency'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  const privacyPulse = useSharedValue(1);

  // Load data on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Filter questions when search query or filter changes
  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, selectedFilter, selectedCategory, selectedUrgency]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const recentQuestions = await AnonymousQuestionsService.getRecentQuestions(20);
      setQuestions(recentQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuestions();
    setRefreshing(false);
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(q => 
        q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter === 'category') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Apply urgency filter
    if (selectedFilter === 'urgency') {
      filtered = filtered.filter(q => q.urgency_level === selectedUrgency);
    }

    setFilteredQuestions(filtered);
  };

  // Data
  const categories = AnonymousQuestionsService.getCategories();
  const urgencyLevels = AnonymousQuestionsService.getUrgencyLevels();

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

  // Voice recording functions removed for clean demo

  const handleAskNewQuestion = () => {
    setShowQuestionModal(true);
  };

  const handleViewMyQuestions = () => {
    // Since questions are anonymous, we show all recent questions
    setSelectedFilter('all');
    setSearchQuery('');
  };

  const handleGetHelpNow = () => {
    Alert.alert(
      'Get Help Now',
      'For immediate assistance, please contact:\n\n• Emergency: 108\n• Women\'s Helpline: 181\n• Mental Health: 1800-599-0019\n\nOr visit your nearest healthcare center.',
      [{ text: 'OK' }]
    );
  };

  const handleCommunityTips = () => {
    setShowSearchModal(true);
  };

  const handleSearchQuestions = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term.');
      return;
    }

    setLoading(true);
    try {
      const searchResults = await AnonymousQuestionsService.searchQuestions(searchQuery.trim(), 20);
      setQuestions(searchResults);
      setShowSearchModal(false);
    } catch (error) {
      console.error('Error searching questions:', error);
      Alert.alert('Error', 'Failed to search questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedFilter('category');
  };

  const handleFilterByUrgency = (urgency: string) => {
    setSelectedUrgency(urgency as any);
    setSelectedFilter('urgency');
  };

  const handleClearFilters = () => {
    setSelectedFilter('all');
    setSearchQuery('');
    loadQuestions();
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert('Error', 'Please enter your question before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const questionData: QuestionSubmission = {
        questionText: newQuestion.trim(),
        category: selectedCategory,
        urgency: selectedUrgency,
        isVoiceQuestion: false
      };

      const result = await AnonymousQuestionsService.submitAnonymousQuestion(questionData);
      
      if (result.success) {
        Alert.alert(
          'Question Submitted!',
          'Your anonymous question has been submitted successfully. You can view the AI response in the recent questions section.',
          [{ text: 'OK', onPress: () => {
            setNewQuestion('');
            setShowQuestionModal(false);
            loadQuestions(); // Refresh the questions list
          }}]
        );
      } else {
        // Provide more specific error messages
        let errorMessage = 'Failed to submit your question. Please try again.';
        if (result.error?.code === '42501') {
          errorMessage = 'Database security policy blocked the submission. Your question was saved locally and will be processed.';
        } else if (result.error?.message) {
          errorMessage = `Error: ${result.error.message}`;
        }
        Alert.alert('Submission Issue', errorMessage);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
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
    { title: 'Recent Questions', icon: <HistoryIcon size={24} />, onPress: handleViewMyQuestions, type: 'secondary' as const, delay: 1500 },
    { title: 'Get Help Now', icon: <HelpIcon size={24} />, onPress: handleGetHelpNow, type: 'danger' as const, delay: 1800 },
    { title: 'Search Questions', icon: <TipsIcon size={24} />, onPress: handleCommunityTips, type: 'secondary' as const, delay: 2100 },
  ];

  // Convert database questions to display format
  const convertToDisplayQuestions = (dbQuestions: AnonymousQuestion[]): Question[] => {
    return dbQuestions.map(q => ({
      id: q.id,
      text: q.question_text,
      category: q.category,
      urgency: q.urgency_level as any,
      aiResponse: q.ai_response || 'Response pending...',
      timestamp: new Date(q.created_at),
      isAnonymous: q.is_anonymous,
      suggestions: [],
      followUpQuestions: []
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
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
          <Text style={styles.privacyTitle}>🔒 Complete Anonymity Guaranteed</Text>
          <Text style={styles.privacyText}>No user information is stored. Your identity remains completely anonymous.</Text>
        </Animated.View>

        {/* Question Categories */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Question Categories</Text>
          <View style={styles.categoriesCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected
                  ]}
                  onPress={() => handleFilterByCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        {/* Ask a Question Section */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Ask a Question</Text>
          <View style={styles.askCard}>
            <Text style={styles.askDescription}>
              Speak your question privately or type it below. Your identity will remain completely anonymous.
            </Text>
            {/* Voice recording removed for clean demo */}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'Recent Questions' : 
               selectedFilter === 'category' ? `${selectedCategory} Questions` :
               `${selectedUrgency.toUpperCase()} Priority Questions`}
            </Text>
            {selectedFilter !== 'all' && (
              <TouchableOpacity onPress={handleClearFilters} style={styles.clearFilterButton}>
                <Text style={styles.clearFilterText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
          ) : filteredQuestions.length > 0 ? (
            convertToDisplayQuestions(filteredQuestions).map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                delay={900 + (index * 200)}
              />
            ))
          ) : (
            <View style={styles.noQuestionsContainer}>
              <Text style={styles.noQuestionsText}>
                {searchQuery ? 'No questions found matching your search.' : 'No questions available yet.'}
              </Text>
              <TouchableOpacity style={styles.askFirstButton} onPress={handleAskNewQuestion}>
                <Text style={styles.askFirstButtonText}>Be the first to ask a question!</Text>
              </TouchableOpacity>
            </View>
          )}
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
            <TouchableOpacity onPress={handleSubmitQuestion} disabled={submitting}>
              <Text style={[styles.modalSubmitButton, submitting && styles.modalSubmitButtonDisabled]}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
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
                  onPress={() => setSelectedUrgency(level.value as any)}
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
            
            <Text style={styles.urgencyDescription}>
              {urgencyLevels.find(l => l.value === selectedUrgency)?.description}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search Questions</Text>
            <TouchableOpacity onPress={handleSearchQuestions} disabled={!searchQuery.trim()}>
              <Text style={[styles.modalSubmitButton, !searchQuery.trim() && styles.modalSubmitButtonDisabled]}>
                Search
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Search for questions:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Enter keywords to search..."
              autoFocus
            />
            
            <Text style={styles.searchHint}>
              Search by keywords, categories, or topics. All searches are completely anonymous.
            </Text>
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
  // Voice recording styles removed for clean demo
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
  urgencyDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalSubmitButtonDisabled: {
    opacity: 0.5,
  },
  // Category Chips
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  categoryChipTextSelected: {
    color: Colors.background,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
  },
  clearFilterText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
  },
  // Loading and Empty States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  noQuestionsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  askFirstButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  askFirstButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
  },
  // Search Modal
  searchHint: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
