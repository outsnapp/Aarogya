import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';

import { Colors, Typography } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

const UserIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={Colors.primary}
    />
  </Svg>
);

const EmailIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      fill={Colors.primary}
    />
  </Svg>
);

const EyeIcon = ({ size = 20, closed = false }: { size?: number; closed?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    {closed ? (
      <Path
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
        fill={Colors.textMuted}
      />
    ) : (
      <Path
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
        fill={Colors.textMuted}
      />
    )}
  </Svg>
);

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    // Animate form appearance
    formOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    formTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    buttonScale.value = withSpring(0.95);

    try {
      const { error } = await signUp(
        email.trim().toLowerCase(),
        password,
        fullName.trim()
      );

      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Signup Failed', error.message || 'Please try again.');
      } else {
        Alert.alert(
          'Account Created! 🎉',
          'Welcome to Aarogya! Please check your email to verify your account, then you can start your onboarding.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/onboarding')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      buttonScale.value = withSpring(1);
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size={60} />
          <Text style={styles.title}>Join Aarogya</Text>
          <Text style={styles.subtitle}>Create your account to start your postnatal care journey</Text>
        </View>

        <Animated.View style={[styles.form, animatedFormStyle]}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <UserIcon size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoComplete="name"
                editable={!loading && !isSubmitting}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <EmailIcon size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading && !isSubmitting}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                editable={!loading && !isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <EyeIcon closed={!showPassword} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
                editable={!loading && !isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <EyeIcon closed={!showConfirmPassword} />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={[
                styles.signupButton,
                (loading || isSubmitting) && styles.signupButtonDisabled
              ]}
              onPress={handleSignup}
              disabled={loading || isSubmitting}
            >
              <Text style={styles.signupButtonText}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    paddingVertical: 16,
  },
  lockIcon: {
    fontSize: 20,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0.1,
  },
  signupButtonText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  loginLink: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
  },
});
