import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { Colors, Typography } from '../constants/Colors';
import VoiceRecorder from '../components/VoiceRecorder';
import ProgressBar from '../components/ProgressBar';
import TextInputModal from '../components/TextInputModal';

interface OnboardingData {
  name: string;
  phone: string;
  motherDob: string;
  babyDob: string;
  deliveryType: string;
  emergencyContacts: string[];
  preferredLanguage: string;
  voiceSmsConsent: boolean;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    phone: '',
    motherDob: '',
    babyDob: '',
    deliveryType: '',
    emergencyContacts: [],
    preferredLanguage: '',
    voiceSmsConsent: false,
  });

  // Animation values
  const promptOpacity = useSharedValue(0);
  const promptTranslateY = useSharedValue(20);

  const totalSteps = 7;

  // Voice prompts as specified in context.md
  const voicePrompts = [
    `👋 Namaste! I am Aarogya — your AI postnatal companion. You can speak to me in Hindi or English. What should I call you?`,
    `Thank you, ${onboardingData.name}! I need your phone number for emergency alerts. Please say it slowly.`,
    `When did your little one arrive? Please say the date.`,
    `How did you deliver your baby? Please say "normal delivery" or "C-section".`,
    `Who should I contact in emergencies? Please say their name and relationship, like "My husband Rajesh" or "My mother Sita".`,
    `Which language do you prefer for our conversations?`,
    `Can I send you voice messages and SMS alerts?`,
  ];

  useEffect(() => {
    // Animate prompt appearance
    promptOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
    promptTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) });
  }, [currentStep]);

  const handleTranscript = (text: string) => {
    // Process the voice input based on current step
    switch (currentStep) {
      case 1:
        setOnboardingData(prev => ({ ...prev, name: text }));
        break;
      case 2:
        setOnboardingData(prev => ({ ...prev, phone: text }));
        break;
      case 3:
        setOnboardingData(prev => ({ ...prev, babyDob: text }));
        break;
      case 4:
        setOnboardingData(prev => ({ ...prev, deliveryType: text }));
        break;
      case 5:
        setOnboardingData(prev => ({ 
          ...prev, 
          emergencyContacts: [...prev.emergencyContacts, text] 
        }));
        break;
      case 6:
        setOnboardingData(prev => ({ ...prev, preferredLanguage: text }));
        break;
      case 7:
        setOnboardingData(prev => ({ ...prev, voiceSmsConsent: text.toLowerCase().includes('yes') }));
        break;
    }
  };

  const handleVoiceStart = () => {
    setIsListening(true);
  };

  const handleVoiceStop = () => {
    setIsListening(false);
    
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Complete onboarding
        completeOnboarding();
      }
    }, 1000);
  };

  const completeOnboarding = () => {
    // Navigate to next screen (Screen 2 - AI Recovery Timeline Preview)
    router.replace('/dashboard');
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleTextFallback = () => {
    setShowTextModal(true);
  };

  const handleTextSubmit = (text: string) => {
    handleTranscript(text);
    // Auto-advance to next step after text input
    setTimeout(() => {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        completeOnboarding();
      }
    }, 500);
  };

  const getInputType = () => {
    switch (currentStep) {
      case 2:
        return 'phone';
      case 3:
        return 'date';
      default:
        return 'text';
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 1:
        return 'What should I call you?';
      case 2:
        return 'Your phone number';
      case 3:
        return 'When did your baby arrive?';
      case 4:
        return 'How did you deliver?';
      case 5:
        return 'Emergency contact';
      case 6:
        return 'Preferred language';
      case 7:
        return 'Voice & SMS consent';
      default:
        return 'Enter your answer';
    }
  };

  const animatedPromptStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
    transform: [{ translateY: promptTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* AI Prompt */}
        <Animated.View style={[styles.promptContainer, animatedPromptStyle]}>
          <Text style={styles.promptText}>
            {voicePrompts[currentStep - 1]}
          </Text>
        </Animated.View>

        {/* Voice Recorder */}
        <View style={styles.voiceContainer}>
          <VoiceRecorder
            onTranscript={handleTranscript}
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            isListening={isListening}
          />
        </View>

        {/* Fallback Options */}
        <View style={styles.fallbackContainer}>
          <TouchableOpacity style={styles.fallbackButton} onPress={handleTextFallback}>
            <Text style={styles.fallbackButtonText}>Type instead</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip this step</Text>
          </TouchableOpacity>
        </View>

        {/* Current Data Display (for demo) */}
        {onboardingData.name && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Collected Information:</Text>
            <Text style={styles.dataText}>Name: {onboardingData.name}</Text>
            {onboardingData.phone && <Text style={styles.dataText}>Phone: {onboardingData.phone}</Text>}
            {onboardingData.babyDob && <Text style={styles.dataText}>Baby DOB: {onboardingData.babyDob}</Text>}
            {onboardingData.deliveryType && <Text style={styles.dataText}>Delivery: {onboardingData.deliveryType}</Text>}
            {onboardingData.emergencyContacts.length > 0 && (
              <Text style={styles.dataText}>
                Emergency Contacts: {onboardingData.emergencyContacts.join(', ')}
              </Text>
            )}
            {onboardingData.preferredLanguage && (
              <Text style={styles.dataText}>Language: {onboardingData.preferredLanguage}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Text Input Modal */}
      <TextInputModal
        visible={showTextModal}
        onClose={() => setShowTextModal(false)}
        onSubmit={handleTextSubmit}
        placeholder={voicePrompts[currentStep - 1]}
        title={getModalTitle()}
        inputType={getInputType()}
      />
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
  promptContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  promptText: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.xl,
  },
  voiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  fallbackContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
  },
  fallbackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.secondary,
    borderRadius: 25,
  },
  fallbackButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.textMuted,
  },
  skipButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  dataContainer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  dataTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  dataText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 4,
  },
});
