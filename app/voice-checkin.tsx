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
import { Svg, Path, Circle } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
import VoiceRecorder from '../components/VoiceRecorder';

const { width } = Dimensions.get('window');

interface ConversationMessage {
  id: string;
  type: 'ai' | 'user';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface RiskAssessment {
  level: 'green' | 'yellow' | 'red';
  message: string;
  actions: string[];
}

export default function VoiceCheckinScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userName] = useState('Priya'); // Demo name
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const conversationOpacity = useSharedValue(0);
  const conversationTranslateY = useSharedValue(30);
  const voicePulse = useSharedValue(1);

  // Conversation flow steps
  const conversationSteps = [
    {
      aiMessage: `Namaste ${userName}! How are you feeling today? You can tell me anything.`,
      followUpQuestions: [],
      riskLevel: null,
    },
    {
      aiMessage: `I understand you're feeling tired and have some bleeding. Let me ask a few more questions...`,
      followUpQuestions: [
        'How heavy is the bleeding compared to yesterday?',
        'Are you feeling more emotional than usual?',
        'How is your baby doing?',
        'Do you have support at home today?',
      ],
      riskLevel: null,
    },
    {
      aiMessage: `I notice your energy has been low for 3 days. This is normal, but let's watch it.`,
      followUpQuestions: [],
      riskLevel: 'yellow' as const,
    },
  ];

  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

    // Conversation animation
    conversationOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    conversationTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
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

    // Start conversation with AI greeting
    startConversation();
  }, []);

  const startConversation = () => {
    const initialMessage: ConversationMessage = {
      id: '1',
      type: 'ai',
      text: conversationSteps[0].aiMessage,
      timestamp: new Date(),
    };
    setConversation([initialMessage]);
  };

  const handleVoiceStart = () => {
    setIsListening(true);
  };

  const handleVoiceStop = () => {
    setIsListening(false);
  };

  const handleVoiceTranscript = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI processing and response
    setTimeout(() => {
      processUserInput(text);
    }, 1500);
  };

  const processUserInput = (userInput: string) => {
    const nextStep = currentStep + 1;
    
    if (nextStep < conversationSteps.length) {
      // Add AI response
      const aiMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: conversationSteps[nextStep].aiMessage,
        timestamp: new Date(),
        isTyping: true,
      };

      setConversation(prev => [...prev, aiMessage]);
      setCurrentStep(nextStep);

      // Simulate typing effect
      setTimeout(() => {
        setConversation(prev => 
          prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, isTyping: false }
              : msg
          )
        );
        setIsProcessing(false);
      }, 2000);
    } else {
      // Final risk assessment
      performRiskAssessment(userInput);
    }
  };

  const performRiskAssessment = (userInput: string) => {
    // Simulate AI analysis based on user input
    let assessment: RiskAssessment;

    if (userInput.toLowerCase().includes('emergency') || userInput.toLowerCase().includes('severe')) {
      assessment = {
        level: 'red',
        message: 'This needs attention. I\'m calling your emergency contact and connecting you with an ASHA worker.',
        actions: ['Emergency contact notified', 'ASHA worker connecting', 'Medical summary shared'],
      };
    } else if (userInput.toLowerCase().includes('tired') || userInput.toLowerCase().includes('low')) {
      assessment = {
        level: 'yellow',
        message: 'I\'m a bit concerned. Let me send some tips to your phone and check in again tonight.',
        actions: ['Tips sent to phone', 'Evening check-in scheduled', 'Family notified'],
      };
    } else {
      assessment = {
        level: 'green',
        message: 'You\'re doing well! Your recovery is on track. I\'ll check in tomorrow.',
        actions: ['Daily check-in scheduled', 'Progress updated', 'Keep up the great work!'],
      };
    }

    setRiskAssessment(assessment);
    setIsProcessing(false);

    // Add final AI message
    const finalMessage: ConversationMessage = {
      id: (Date.now() + 2).toString(),
      type: 'ai',
      text: assessment.message,
      timestamp: new Date(),
      isTyping: true,
    };

    setConversation(prev => [...prev, finalMessage]);

    // Simulate typing effect
    setTimeout(() => {
      setConversation(prev => 
        prev.map(msg => 
          msg.id === finalMessage.id 
            ? { ...msg, isTyping: false }
            : msg
        )
      );
    }, 2000);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const handleEmergency = () => {
    // Navigate to emergency screen
    router.push('/emergency');
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedConversationStyle = useAnimatedStyle(() => ({
    opacity: conversationOpacity.value,
    transform: [{ translateY: conversationTranslateY.value }],
  }));

  const animatedVoiceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voicePulse.value }],
  }));

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'green':
        return Colors.primary;
      case 'yellow':
        return Colors.warning;
      case 'red':
        return Colors.danger;
      default:
        return Colors.primary;
    }
  };

  const renderMessage = (message: ConversationMessage) => {
    const isAI = message.type === 'ai';
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isAI ? styles.aiMessage : styles.userMessage,
        ]}
      >
        <View style={[styles.messageBubble, isAI ? styles.aiBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isAI ? styles.aiText : styles.userText]}>
            {message.text}
          </Text>
          {message.isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Aarogya is typing...</Text>
            </View>
          )}
        </View>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Voice Check-in</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Conversation */}
        <Animated.View style={[styles.conversationContainer, animatedConversationStyle]}>
          <Text style={styles.conversationTitle}>Your Conversation with Aarogya</Text>
          {conversation.map(renderMessage)}
          
          {isProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>Processing your response...</Text>
            </View>
          )}
        </Animated.View>

        {/* Risk Assessment */}
        {riskAssessment && (
          <Animated.View style={[styles.riskAssessment, { borderColor: getRiskColor(riskAssessment.level) }]}>
            <View style={[styles.riskHeader, { backgroundColor: getRiskColor(riskAssessment.level) }]}>
              <Text style={styles.riskTitle}>
                {riskAssessment.level.toUpperCase()} - Risk Assessment
              </Text>
            </View>
            <View style={styles.riskContent}>
              <Text style={styles.riskMessage}>{riskAssessment.message}</Text>
              <View style={styles.actionsList}>
                {riskAssessment.actions.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <Text style={styles.actionText}>• {action}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Voice Input */}
        <Animated.View style={[styles.voiceContainer, animatedVoiceStyle]}>
          <Text style={styles.voicePrompt}>
            {isListening ? 'Listening...' : 'Tap to speak to Aarogya'}
          </Text>
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            isListening={isListening}
            disabled={isProcessing}
          />
        </Animated.View>

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
          <Text style={styles.emergencyButtonText}>Emergency</Text>
        </TouchableOpacity>
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
  conversationContainer: {
    marginBottom: 24,
  },
  conversationTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  aiBubble: {
    backgroundColor: Colors.primaryLight,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  aiText: {
    color: Colors.textPrimary,
  },
  userText: {
    color: Colors.textPrimary,
  },
  typingIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
  },
  typingText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginHorizontal: 8,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  processingText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  riskAssessment: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  riskHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  riskTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  riskContent: {
    padding: 16,
  },
  riskMessage: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  actionsList: {
    marginTop: 8,
  },
  actionItem: {
    marginBottom: 4,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  voiceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  voicePrompt: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  emergencyButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.danger,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
});
