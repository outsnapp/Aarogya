import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path, Circle, G, Rect } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function SMSRegistrationScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  // Animate on mount
  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const handleRegisterSMS = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    setIsLoading(true);

    try {
      // Update user profile with phone number and SMS consent
      const { error } = await supabase
        .from('user_profiles')
        .update({
          phone: phoneNumber,
          voice_sms_consent: true
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Send welcome SMS
      const welcomeMessage = `Aarogya: Namaste ${userProfile?.full_name || 'User'}! Welcome to Aarogya. Send your daily symptoms like: "bleeding" or "fever" or "sad". For help reply HELP.`;
      
      // In production, this would use Twilio to send actual SMS
      console.log(`📱 Welcome SMS would be sent to ${phoneNumber}: ${welcomeMessage}`);

      Alert.alert(
        'SMS Registration Successful!',
        `Your phone number ${phoneNumber} is now registered for SMS health monitoring. You can now send symptoms via SMS to get instant health guidance.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/dashboard')
          }
        ]
      );

    } catch (error) {
      console.error('Error registering SMS:', error);
      Alert.alert('Error', 'Failed to register SMS. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showSMSInstructions = () => {
    Alert.alert(
      'How SMS Health Monitoring Works',
      `1. Register your phone number here
2. Send symptoms via SMS to our number
3. Get instant health guidance
4. Receive emergency alerts to family

Example SMS:
- "bleeding heavy" → Urgent medical advice
- "tired and sad" → Home care tips
- "help" → Get help instructions

Works on any basic phone - no app needed!`,
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      {/* Header */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={Colors.textPrimary} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SMS Registration</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Feature Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Real SMS Health Monitoring</Text>
          <Text style={styles.sectionDescription}>
            Register your phone number to receive health guidance via SMS. Perfect for rural areas with limited internet access.
          </Text>
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Register your phone number</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Send symptoms via SMS</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Get instant health guidance</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Receive emergency alerts</Text>
            </View>
          </View>
        </View>

        {/* Registration Form */}
        <Animated.View style={[styles.section, animatedFormStyle]}>
          <Text style={styles.sectionTitle}>Register Your Phone</Text>
          
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="+91 9876543210"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            
            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
              onPress={handleRegisterSMS}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Registering...' : 'Register for SMS'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* SMS Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMS Examples</Text>
          <View style={styles.examplesList}>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleSMS}>"bleeding heavy"</Text>
              <Text style={styles.exampleResponse}>→ Urgent medical advice</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleSMS}>"tired and sad"</Text>
              <Text style={styles.exampleResponse}>→ Home care tips</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleSMS}>"help"</Text>
              <Text style={styles.exampleResponse}>→ Get help instructions</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={showSMSInstructions}>
            <Text style={styles.actionButtonText}>How SMS Works</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/sms-demo')}>
            <Text style={styles.actionButtonText}>View SMS Demo</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 12,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  stepText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  formContainer: {
    gap: 16,
  },
  inputLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.cardBackground,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  examplesList: {
    gap: 12,
  },
  exampleItem: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exampleSMS: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleResponse: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textSecondary,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
