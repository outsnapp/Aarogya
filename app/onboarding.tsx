import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path, Circle, G, Rect, Text as SvgText } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
// VoiceRecorder removed for clean demo
import ProgressBar from '../components/ProgressBar';
import TextInputModal from '../components/TextInputModal';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../lib/database';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  name: string;
  phone: string;
  motherDob: string;
  motherHeight: string;
  motherWeight: string;
  motherBmi: number;
  babyDob: string;
  babyHeight: string;
  babyWeight: string;
  babyMedicalConditions: string;
  deliveryType: string;
  emergencyContacts: string[];
  preferredLanguage: string;
  voiceSmsConsent: boolean;
}

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  title: string;
}

interface DeliveryTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  title: string;
}

// iOS-Style Scroll Dial Date Picker
const DatePickerModal = ({ visible, onClose, onSelect, title }: DatePickerModalProps) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 400 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 120 });
      modalTranslateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 300 });
      modalScale.value = withTiming(0.9, { duration: 300 });
      modalTranslateY.value = withTiming(50, { duration: 300 });
    }
  }, [visible]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleConfirm = () => {
    const date = `${selectedDay}/${selectedMonth}/${selectedYear}`;
    onSelect(date);
    onClose();
  };

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value }
    ] as any,
  }));

  const SimplePicker = ({ 
    data, 
    selectedValue, 
    onValueChange, 
    label 
  }: { 
    data: any[], 
    selectedValue: any, 
    onValueChange: (value: any) => void,
    label: string 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleSelect = (value: any) => {
      onValueChange(value);
      setIsOpen(false);
    };

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.pickerButtonText}>{selectedValue}</Text>
          <Text style={styles.pickerButtonArrow}>▼</Text>
        </TouchableOpacity>
        
        {isOpen && (
          <Modal transparent visible={isOpen} animationType="fade">
            <TouchableOpacity 
              style={styles.pickerOverlay}
              activeOpacity={1}
              onPress={() => setIsOpen(false)}
            >
              <View style={styles.pickerDropdown}>
                <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                  {data.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerOption,
                        selectedValue === item && styles.pickerOptionSelected
                      ]}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        selectedValue === item && styles.pickerOptionTextSelected
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.datePickerModal, animatedModalStyle]}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.datePickerCancelButton}>
              <Text style={styles.datePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.datePickerConfirmButton}>
              <Text style={styles.datePickerConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.datePickerContent}>
            <View style={styles.pickersRow}>
              <SimplePicker
                data={days}
                selectedValue={selectedDay}
                onValueChange={setSelectedDay}
                label="Day"
              />
              <SimplePicker
                data={months}
                selectedValue={months[selectedMonth - 1]}
                onValueChange={(month) => setSelectedMonth(months.indexOf(month) + 1)}
                label="Month"
              />
              <SimplePicker
                data={years}
                selectedValue={selectedYear}
                onValueChange={setSelectedYear}
                label="Year"
              />
            </View>
          </View>

          <View style={styles.datePickerPreview}>
            <Text style={styles.datePickerPreviewText}>
              Selected: {selectedDay} {months[selectedMonth - 1]} {selectedYear}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Growing Tree Animation Component
const GrowingTree = ({ progress }: { progress: number }) => {
  const treeOpacity = useSharedValue(0);
  const treeScale = useSharedValue(0.1);
  const leafOpacity = useSharedValue(0);
  const branchRotation = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);

  useEffect(() => {
    // Tree grows based on progress (0 to 1) - Much more visible now
    treeOpacity.value = withTiming(0.8, { duration: 1000 });
    treeScale.value = withSpring(0.2 + (progress * 0.8), { damping: 12, stiffness: 80 });
    leafOpacity.value = withTiming(progress > 0.3 ? 0.9 : 0, { duration: 1500 });
    sparkleOpacity.value = withTiming(progress > 0.7 ? 1 : 0, { duration: 1000 });
    branchRotation.value = withRepeat(
      withTiming(3, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress]);

  const animatedTreeStyle = useAnimatedStyle(() => ({
    opacity: treeOpacity.value,
    transform: [
      { scale: treeScale.value },
      { rotate: `${branchRotation.value}deg` }
    ] as any,
  }));

  const animatedLeafStyle = useAnimatedStyle(() => ({
    opacity: leafOpacity.value,
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  return (
    <View style={styles.treeContainer}>
      <Animated.View style={[styles.tree, animatedTreeStyle]}>
        <Svg width={300} height={400} viewBox="0 0 300 400">
          {/* Tree trunk - more prominent */}
          <Rect
            x="140"
            y="280"
            width="20"
            height="120"
            fill="#8B4513"
            rx="10"
          />
          
          {/* Tree branches - more detailed */}
          <Path
            d="M150 280 Q120 250 80 220 M150 280 Q180 250 220 220 M150 260 Q110 230 70 200 M150 260 Q190 230 230 200 M150 240 Q125 210 100 180 M150 240 Q175 210 200 180"
            stroke="#8B4513"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Progressive tree growth stages */}
          
          {/* Stage 1: Seeds/Roots (0-25%) */}
          {progress >= 0 && (
            <G>
              <Circle cx="150" cy="390" r={12 + (progress * 8)} fill="#8B4513" opacity="0.8" />
              <SvgText x="130" y="420" fontSize="16" fill={Colors.primary}>🌱</SvgText>
            </G>
          )}
          
          {/* Stage 2: Small leaves (25-50%) */}
          {progress > 0.25 && (
            <G opacity={Math.min((progress - 0.25) / 0.25, 1)}>
              <Circle cx="80" cy="220" r="20" fill={Colors.primary} opacity="0.8" />
              <Circle cx="220" cy="220" r="20" fill={Colors.primary} opacity="0.8" />
              <Circle cx="150" cy="200" r="25" fill={Colors.secondary} opacity="0.9" />
            </G>
          )}
          
          {/* Stage 3: Full foliage (50-75%) */}
          {progress > 0.5 && (
            <G opacity={Math.min((progress - 0.5) / 0.25, 1)}>
              <Circle cx="70" cy="200" r="30" fill={Colors.primary} opacity="0.9" />
              <Circle cx="230" cy="200" r="30" fill={Colors.primary} opacity="0.9" />
              <Circle cx="100" cy="180" r="25" fill={Colors.secondary} opacity="0.8" />
              <Circle cx="200" cy="180" r="25" fill={Colors.secondary} opacity="0.8" />
              <Circle cx="150" cy="160" r="35" fill="#32CD32" opacity="0.9" />
            </G>
          )}
          
          {/* Stage 4: Flowers and fruits (75-100%) */}
          {progress > 0.75 && (
            <G opacity={Math.min((progress - 0.75) / 0.25, 1)}>
              <Circle cx="90" cy="190" r="6" fill={Colors.warning} />
              <Circle cx="210" cy="190" r="6" fill={Colors.warning} />
              <Circle cx="120" cy="170" r="5" fill="#FF69B4" />
              <Circle cx="180" cy="170" r="5" fill="#FF69B4" />
              <Circle cx="150" cy="150" r="7" fill="#FF1493" />
              <Circle cx="160" cy="180" r="4" fill="#FFA500" />
              <Circle cx="140" cy="185" r="4" fill="#FFA500" />
            </G>
          )}
        </Svg>
        
        {/* Magical sparkles when tree is growing */}
        {progress > 0.2 && (
          <Animated.View style={[styles.sparkleContainer, animatedSparkleStyle]}>
            {[...Array(6)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.sparkle,
                  {
                    left: 50 + (index * 40) + Math.sin(index) * 20,
                    top: 100 + (index * 30) + Math.cos(index) * 15,
                  }
                ]}
              >
                <Text style={styles.sparkleEmoji}>✨</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}
        
        {/* Floating leaves animation */}
        {progress > 0.4 && (
          <Animated.View style={[styles.floatingLeaves, animatedLeafStyle]}>
            {[...Array(5)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.floatingLeaf,
                  {
                    left: 40 + (index * 50),
                    animationDelay: `${index * 800}ms`,
                  }
                ]}
              >
                <Text style={styles.leafEmoji}>🍃</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Progress indicator */}
        <View style={styles.treeProgress}>
          <Text style={styles.treeProgressText}>
            {progress < 0.25 ? '🌱 Sprouting...' : 
             progress < 0.5 ? '🌿 Growing...' : 
             progress < 0.75 ? '🌳 Flourishing...' : 
             '🌸 Blooming!'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// Delivery Type Selection Modal
const DeliveryTypeModal = ({ visible, onClose, onSelect, title }: DeliveryTypeModalProps) => {
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 400 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 120 });
      modalTranslateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 300 });
      modalScale.value = withTiming(0.9, { duration: 300 });
      modalTranslateY.value = withTiming(50, { duration: 300 });
    }
  }, [visible]);

  const deliveryTypes = [
    { value: 'normal_delivery', label: 'Normal Delivery', description: 'Vaginal birth without complications' },
    { value: 'c_section', label: 'C-Section', description: 'Cesarean section delivery' }
  ];

  const handleSelect = (type: string) => {
    onSelect(type);
    onClose();
  };

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value }
    ] as any,
  }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.datePickerModal, animatedModalStyle]}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.datePickerCancelButton}>
              <Text style={styles.datePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>{title}</Text>
            <View style={styles.datePickerConfirmButton} />
          </View>
          
          <View style={styles.deliveryTypeContent}>
            {deliveryTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.deliveryTypeOption}
                onPress={() => {
                  console.log('Delivery type selected:', type.value);
                  handleSelect(type.value);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.deliveryTypeInfo}>
                  <Text style={styles.deliveryTypeLabel}>{type.label}</Text>
                  <Text style={styles.deliveryTypeDescription}>{type.description}</Text>
                </View>
                <View style={styles.deliveryTypeIcon}>
                  <Text style={styles.deliveryTypeIconText}>
                    {type.value === 'normal_delivery' ? '👶' : '🏥'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// BMI Calculation Component
const BMICalculator = ({ height, weight, onBmiCalculated }: { height: string; weight: string; onBmiCalculated: (bmi: number) => void }) => {
  useEffect(() => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = weightInKg / (heightInMeters * heightInMeters);
        const roundedBmi = Math.round(bmi * 10) / 10;
        onBmiCalculated(roundedBmi);
      }
    }
  }, [height, weight]); // Only depend on height and weight

  return null;
};

// 3D Animated Card Component
const AnimatedCard = ({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: any }) => {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const cardScale = useSharedValue(0.9);
  const cardRotateX = useSharedValue(15);

  useEffect(() => {
    cardOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    cardTranslateY.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    cardScale.value = withDelay(
      delay,
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    cardRotateX.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
  }, [delay]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateY: cardTranslateY.value },
      { scale: cardScale.value },
      { perspective: 1000 },
      { rotateX: `${cardRotateX.value}deg` }
    ] as any,
  }));

  return (
    <Animated.View style={[styles.animatedCard, style, animatedCardStyle]}>
      {children}
    </Animated.View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, updateProfile, checkOnboardingStatus, markOnboardingCompleted } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    phone: '',
    motherDob: '',
    motherHeight: '',
    motherWeight: '',
    motherBmi: 0,
    babyDob: '',
    babyHeight: '',
    babyWeight: '',
    babyMedicalConditions: '',
    deliveryType: '',
    emergencyContacts: [],
    preferredLanguage: '',
    voiceSmsConsent: false,
  });

  // Animation values
  const promptOpacity = useSharedValue(0);
  const promptTranslateY = useSharedValue(30);
  const promptScale = useSharedValue(0.95);
  // voicePulse removed for clean demo
  const backgroundShift = useSharedValue(0);

  const totalSteps = 10; // Increased from 7 to 10

  // Voice prompts for each step
  const voicePrompts = [
    'What should I call you?',
    'What\'s your phone number?',
    'When were you born?',
    'How tall are you in centimeters?',
    'What\'s your weight in kilograms?',
    'When was your baby born?',
    'How tall is your baby in centimeters?',
    'What\'s your baby\'s weight in kilograms?',
    'Does your baby have any medical conditions?',
    'How did you deliver your baby?',
    'Who is your emergency contact?',
    'What language do you prefer?',
    'Do you consent to voice and SMS features?'
  ];

  // Voice prompts removed for clean demo

  useEffect(() => {
    // Enhanced animations
    promptOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    promptTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    promptScale.value = withSpring(1, { damping: 15, stiffness: 150 });

    // Voice button pulse removed for clean demo

    // Background gradient shift
    backgroundShift.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [currentStep]);

  // Voice transcript handling removed for clean demo

  // Voice recording functions removed for clean demo

  const completeOnboarding = async () => {
    setSaving(true);
    
    try {
      // Save data to database if user is logged in
      if (user) {
        const { data, error } = await dbService.saveOnboardingData(user.id, onboardingData);
        
        if (error) {
          console.error('Error saving onboarding data:', error);
          Alert.alert('Error', 'Failed to save your information. Please try again.');
          return;
        }

        console.log('Onboarding data saved successfully:', data);
        
        // Wait a moment for database to process the changes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Explicitly mark onboarding as completed
      await markOnboardingCompleted();

      // Wait a moment to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🎉 Onboarding completion process finished');

      // Show completion message with BMI info
      const bmiStatus = getBmiStatus(onboardingData.motherBmi);
      Alert.alert(
        'Welcome to Aarogya! 🎉',
        `Setup complete! ${onboardingData.motherBmi > 0 ? `Your BMI is ${onboardingData.motherBmi} (${bmiStatus}).` : ''} We'll help you track your health journey.`,
        [{ 
          text: 'Continue', 
          onPress: () => {
            console.log('🎉 Onboarding completed successfully, navigating to dashboard');
            // Navigate to dashboard
            router.replace('/dashboard');
          }
        }]
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
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
    // Process text input based on current step
    switch (currentStep) {
      case 1:
        setOnboardingData(prev => ({ ...prev, name: text }));
        break;
      case 2:
        setOnboardingData(prev => ({ ...prev, phone: text }));
        break;
      case 3:
        setOnboardingData(prev => ({ ...prev, motherDob: text }));
        break;
      case 4:
        setOnboardingData(prev => ({ ...prev, motherHeight: text }));
        break;
      case 5:
        setOnboardingData(prev => ({ ...prev, motherWeight: text }));
        break;
      case 6:
        setOnboardingData(prev => ({ ...prev, babyDob: text }));
        break;
      case 7:
        setOnboardingData(prev => ({ ...prev, babyHeight: text }));
        break;
      case 8:
        setOnboardingData(prev => ({ ...prev, babyWeight: text }));
        break;
      case 9:
        setOnboardingData(prev => ({ ...prev, babyMedicalConditions: text }));
        break;
      case 10:
        // Smart delivery type processing
        const normalizedText = text.toLowerCase().trim();
        let deliveryType = text; // Default to original text
        
        if (normalizedText.includes('normal') || normalizedText.includes('vaginal') || normalizedText.includes('natural')) {
          deliveryType = 'Normal Delivery';
        } else if (normalizedText.includes('c section') || normalizedText.includes('cesarean') || normalizedText.includes('caesarean') || normalizedText.includes('c-section')) {
          deliveryType = 'C-Section';
        }
        
        setOnboardingData(prev => ({ ...prev, deliveryType: deliveryType }));
        break;
      case 11:
        setOnboardingData(prev => ({ 
          ...prev, 
          emergencyContacts: [...prev.emergencyContacts, text] 
        }));
        break;
      case 12:
        setOnboardingData(prev => ({ ...prev, preferredLanguage: text }));
        break;
    }
    
    // Auto-advance to next step after text input
    setTimeout(() => {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        completeOnboarding();
      }
    }, 500);
  };

  const handleCalendarSelect = (date: string) => {
    if (currentStep === 3) {
      setOnboardingData(prev => ({ ...prev, motherDob: date }));
    } else if (currentStep === 6) {
      setOnboardingData(prev => ({ ...prev, babyDob: date }));
    }
    // Auto-advance after date selection
    setTimeout(() => {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }, 500);
  };


  const handleBmiCalculated = useCallback((bmi: number) => {
    setOnboardingData(prev => {
      // Only update if BMI has actually changed
      if (prev.motherBmi !== bmi) {
        return { ...prev, motherBmi: bmi };
      }
      return prev;
    });
  }, []);

  const getInputType = () => {
    switch (currentStep) {
      case 2:
        return 'phone';
      case 4:
      case 5:
      case 7:
      case 8:
        return 'numeric';
      default:
        return 'text';
    }
  };

  const getExampleText = () => {
    switch (currentStep) {
      case 1:
        return 'Priya Sharma';
      case 2:
        return '+91 98765 43210';
      case 4:
        return '165 cm';
      case 5:
        return '65 kg';
      case 7:
        return '50 cm';
      case 8:
        return '3.2 kg';
      case 9:
        return 'None or Jaundice (if any)';
      case 11:
        return 'Rajesh (Husband) - +91 98765 43210';
      case 12:
        return 'Hindi or English';
      default:
        return undefined;
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 1:
        return 'What should I call you?';
      case 2:
        return 'Your phone number';
      case 3:
        return 'Your date of birth';
      case 4:
        return 'Your height (cm)';
      case 5:
        return 'Your weight (kg)';
      case 6:
        return 'Baby\'s date of birth';
      case 7:
        return 'Baby\'s height (cm)';
      case 8:
        return 'Baby\'s weight (kg)';
      case 9:
        return 'Baby\'s medical conditions';
      case 10:
        return 'How did you deliver?';
      case 11:
        return 'Emergency contact';
      case 12:
        return 'Preferred language';
      case 13:
        return 'Voice & SMS consent';
      default:
        return 'Enter your answer';
    }
  };

  const animatedPromptStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
    transform: [
      { translateY: promptTranslateY.value },
      { scale: promptScale.value }
    ] as any,
  }));


  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: backgroundShift.value * 10 }] as any,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      {/* Animated Background */}
      <Animated.View style={[styles.backgroundGradient, animatedBackgroundStyle]} />
      
      {/* Growing Tree Background */}
      <GrowingTree progress={currentStep / totalSteps} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Progress Bar */}
        <AnimatedCard delay={0}>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </AnimatedCard>

        {/* 3D AI Prompt Card */}
        <AnimatedCard delay={200}>
          <View style={styles.promptCard}>
            <View style={styles.promptIcon}>
              <Text style={styles.promptEmoji}>🤖</Text>
            </View>
            <Animated.Text style={[styles.promptText, animatedPromptStyle]}>
              {voicePrompts[currentStep - 1]}
            </Animated.Text>
          </View>
        </AnimatedCard>

        {/* Enhanced Voice Recorder */}
        {/* Voice recording removed for clean demo */}

        {/* Enhanced Fallback Options */}
        <AnimatedCard delay={600}>
          <View style={styles.fallbackContainer}>
            {/* For DOB questions, show only date picker */}
            {(currentStep === 3 || currentStep === 6) ? (
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setShowCalendar(true)}
              >
                <Text style={styles.datePickerButtonText}>📅 Select Date</Text>
              </TouchableOpacity>
            ) : currentStep === 10 ? (
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setShowTextModal(true)}
              >
                <Text style={styles.datePickerButtonText}>✏️ Type your delivery type</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.fallbackButton} onPress={handleTextFallback}>
                <Text style={styles.fallbackButtonText}>✏️ Type instead</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>⏭️ Skip this step</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Enhanced Data Display with BMI */}
        {onboardingData.name && (
          <AnimatedCard delay={800}>
            <View style={styles.dataCard}>
              <Text style={styles.dataTitle}>📋 Collected Information:</Text>
              <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Name:</Text>
                  <Text style={styles.dataValue}>{onboardingData.name}</Text>
                </View>
                {onboardingData.phone && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Phone:</Text>
                    <Text style={styles.dataValue}>{onboardingData.phone}</Text>
                  </View>
                )}
                {onboardingData.motherDob && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Mother DOB:</Text>
                    <Text style={styles.dataValue}>{onboardingData.motherDob}</Text>
                  </View>
                )}
                {onboardingData.motherHeight && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Height:</Text>
                    <Text style={styles.dataValue}>{onboardingData.motherHeight} cm</Text>
                  </View>
                )}
                {onboardingData.motherWeight && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Weight:</Text>
                    <Text style={styles.dataValue}>{onboardingData.motherWeight} kg</Text>
                  </View>
                )}
                {onboardingData.motherBmi > 0 && (
                  <View style={[styles.dataItem, styles.bmiItem]}>
                    <Text style={styles.dataLabel}>BMI:</Text>
                    <Text style={[styles.dataValue, styles.bmiValue]}>
                      {onboardingData.motherBmi} ({getBmiStatus(onboardingData.motherBmi)})
                    </Text>
                  </View>
                )}
                {onboardingData.babyDob && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Baby DOB:</Text>
                    <Text style={styles.dataValue}>{onboardingData.babyDob}</Text>
                  </View>
                )}
                {onboardingData.babyHeight && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Baby Height:</Text>
                    <Text style={styles.dataValue}>{onboardingData.babyHeight} cm</Text>
                  </View>
                )}
                {onboardingData.babyWeight && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Baby Weight:</Text>
                    <Text style={styles.dataValue}>{onboardingData.babyWeight} kg</Text>
                  </View>
                )}
                {onboardingData.babyMedicalConditions && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Medical Conditions:</Text>
                    <Text style={styles.dataValue}>{onboardingData.babyMedicalConditions}</Text>
                  </View>
                )}
                {onboardingData.deliveryType && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Delivery:</Text>
                    <Text style={styles.dataValue}>{onboardingData.deliveryType}</Text>
                  </View>
                )}
                {onboardingData.emergencyContacts.length > 0 && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Emergency Contacts:</Text>
                    <Text style={styles.dataValue}>{onboardingData.emergencyContacts.join(', ')}</Text>
                  </View>
                )}
                {onboardingData.preferredLanguage && (
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Language:</Text>
                    <Text style={styles.dataValue}>{onboardingData.preferredLanguage}</Text>
                  </View>
                )}
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* BMI Calculator - Only render when both height and weight are available */}
        {onboardingData.motherHeight && onboardingData.motherWeight && (
          <BMICalculator
            height={onboardingData.motherHeight}
            weight={onboardingData.motherWeight}
            onBmiCalculated={handleBmiCalculated}
          />
        )}
      </ScrollView>

      {/* Enhanced Text Input Modal */}
      <TextInputModal
        visible={showTextModal}
        onClose={() => setShowTextModal(false)}
        onSubmit={handleTextSubmit}
        placeholder={currentStep === 10 ? "Type 'normal delivery' or 'c section'" : voicePrompts[currentStep - 1]}
        title={getModalTitle()}
        inputType={getInputType()}
        example={currentStep === 10 ? "Examples: 'normal delivery', 'c section', 'vaginal birth', 'cesarean'" : getExampleText()}
      />

      {/* iOS-Style Date Picker Modal */}
      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelect={handleCalendarSelect}
        title={currentStep === 3 ? 'Your Date of Birth' : 'Baby\'s Date of Birth'}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primaryLight,
    opacity: 0.1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  animatedCard: {
    marginBottom: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  promptCard: {
    backgroundColor: Colors.background + 'F0', // Semi-transparent background
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  promptIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  promptEmoji: {
    fontSize: 28,
  },
  promptText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
  },
  // Voice recording styles removed for clean demo
  fallbackContainer: {
    alignItems: 'center',
    gap: 12,
  },
  fallbackButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fallbackButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  datePickerButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  datePickerButtonText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.background,
    textAlign: 'center',
  },
  skipButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  skipButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  dataCard: {
    backgroundColor: Colors.background + 'F0', // Semi-transparent background
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dataTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  dataGrid: {
    gap: 8,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    marginBottom: 4,
  },
  bmiItem: {
    backgroundColor: Colors.warning + '20',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  dataLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  dataValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    flex: 1,
    textAlign: 'right',
  },
  bmiValue: {
    color: Colors.warning,
    fontFamily: Typography.bodySemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // iOS-Style Date Picker Styles
  datePickerModal: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.6,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
    backgroundColor: Colors.primary + '10',
  },
  datePickerTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  datePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  datePickerCancelText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  datePickerConfirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  datePickerConfirmText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
  },
  datePickerContent: {
    height: 300,
    position: 'relative',
  },
  datePickerSelectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 40,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
    marginTop: -20,
    zIndex: 1,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  pickersRow: {
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: 10,
  },
  pickerContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    paddingVertical: 8,
    textAlign: 'center',
  },
  pickerButton: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 50,
  },
  pickerButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  pickerButtonArrow: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginLeft: 8,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerDropdown: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    maxHeight: 200,
    width: '80%',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerScrollView: {
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary + '20',
  },
  pickerOptionText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontFamily: Typography.bodySemiBold,
  },
  deliveryTypeContent: {
    padding: 20,
  },
  deliveryTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryTypeInfo: {
    flex: 1,
  },
  deliveryTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  deliveryTypeDescription: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  deliveryTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryTypeIconText: {
    fontSize: 20,
  },
  datePickerPreview: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '20',
  },
  datePickerPreviewText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  // Growing Tree Animation Styles - Positioned on the left side
  treeContainer: {
    position: 'absolute',
    top: 200,
    left: -80,
    width: 180,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Above background but below content cards
    opacity: 0.8,
    transform: [{ scale: 0.5 }, { rotate: '15deg' }], // Smaller and slightly tilted for charm
  },
  tree: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleEmoji: {
    fontSize: 16,
    opacity: 0.8,
  },
  floatingLeaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  floatingLeaf: {
    position: 'absolute',
    top: 20,
  },
  leafEmoji: {
    fontSize: 24,
    opacity: 0.8,
  },
  treeProgress: {
    position: 'absolute',
    bottom: -30,
    alignSelf: 'center',
    backgroundColor: Colors.background + 'CC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  treeProgressText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    textAlign: 'center',
  },
});