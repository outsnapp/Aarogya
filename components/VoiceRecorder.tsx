import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography } from '../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path, Circle, G } from 'react-native-svg';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onStart: () => void;
  onStop: () => void;
  isListening: boolean;
  disabled?: boolean;
}

// Professional Microphone Icon Component
const MicrophoneIcon = ({ size = 48, isActive = false }: { size?: number; isActive?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      {/* Microphone body */}
      <Path
        d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
        fill={isActive ? Colors.background : Colors.background}
        opacity={isActive ? 1 : 0.9}
      />
      {/* Microphone stand */}
      <Path
        d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
        fill={isActive ? Colors.background : Colors.background}
        opacity={isActive ? 1 : 0.9}
      />
      {/* Active indicator */}
      {isActive && (
        <Circle
          cx="12"
          cy="8"
          r="2"
          fill={Colors.warning}
          opacity={0.8}
        />
      )}
    </G>
  </Svg>
);

export default function VoiceRecorder({
  onTranscript,
  onStart,
  onStop,
  isListening,
  disabled = false,
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Enhanced animation values
  const pulseScale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const waveformHeight = useSharedValue(20);
  const buttonRotation = useSharedValue(0);

  // Remove automatic permission check on component mount
  // Permission will be requested when user clicks microphone

  useEffect(() => {
    if (isListening) {
      startListening();
    } else {
      stopListening();
    }
  }, [isListening]);

  useEffect(() => {
    if (isListening) {
      // Enhanced pulse animation with spring physics
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 10, stiffness: 100 }),
          withSpring(1, { damping: 10, stiffness: 100 })
        ),
        -1,
        false
      );

      // Ripple effect
      rippleScale.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(2, { duration: 1500, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      );

      rippleOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 0 }),
          withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      );

      // Button rotation for active state
      buttonRotation.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );

      // Enhanced waveform animation
      waveformHeight.value = withRepeat(
        withSequence(
          withTiming(45, { duration: 200, easing: Easing.inOut(Easing.quad) }),
          withTiming(25, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming(40, { duration: 150, easing: Easing.inOut(Easing.quad) }),
          withTiming(30, { duration: 250, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      rippleScale.value = withTiming(0, { duration: 300 });
      rippleOpacity.value = withTiming(0, { duration: 300 });
      waveformHeight.value = withTiming(20, { duration: 300 });
      buttonRotation.value = withTiming(0, { duration: 500 });
    }
  }, [isListening]);

  const checkMicrophonePermission = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // First check if we already have permission
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (permissionStatus.state === 'granted') {
            setHasPermission(true);
            return;
          }
        }
        
        // If we don't have permission, request it
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
        console.log('Microphone permission granted');
      } else {
        console.log('getUserMedia not supported');
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Microphone permission error:', error);
      setHasPermission(false);
    }
  };

  const startListening = async () => {
    // Always try to get permission when user clicks microphone
    try {
      // Check if we're in a browser environment with media devices support
      if (typeof window === 'undefined') {
        console.log('Not in browser environment, using demo mode');
        // Continue with demo mode below
      } else if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('Requesting microphone permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
        console.log('Microphone permission granted, starting listening...');
        // Continue with speech recognition after getting permission
      } else {
        console.log('getUserMedia not supported, using demo mode');
        setHasPermission(false);
        // Continue with demo mode below instead of showing error
      }
    } catch (error) {
      console.error('Microphone access error:', error);
      setHasPermission(false);
      // Continue with demo mode instead of showing error alert
    }

    try {
      // Enhanced Web Speech API implementation
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          const confidence = event.results[current][0].confidence || 0.9;
          
          setTranscript(transcript);
          setConfidence(confidence);
          
          if (event.results[current].isFinal) {
            onTranscript(transcript);
          }
        };

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          onStart();
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          onStop();
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            Alert.alert('No Speech Detected', 'Please try speaking again.');
          } else if (event.error === 'network') {
            Alert.alert('Network Error', 'Please check your internet connection.');
          }
          onStop();
        };

        recognitionRef.current.start();
      } else {
        // Enhanced fallback for demo with realistic simulation
        onStart();
        setTimeout(() => {
          const demoResponses = [
            'Priya Sharma',
            '9876543210',
            '15/03/1995',
            '165',
            '58',
            '12/09/2024',
            '50',
            '3.2',
            'No medical conditions',
            'Normal delivery',
            'My husband Rajesh',
            'Hindi',
            'Yes'
          ];
          
          const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
          setTranscript(randomResponse);
          setConfidence(0.95);
          onTranscript(randomResponse);
          
          setTimeout(() => {
            onStop();
          }, 500);
        }, 2000);
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      Alert.alert('Voice Recognition Error', 'Please try again or use text input.');
      onStop();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handlePress = () => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const animatedMicStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${buttonRotation.value}deg` }
    ],
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const animatedWaveformStyle = useAnimatedStyle(() => ({
    height: waveformHeight.value,
  }));

  return (
    <View style={styles.container}>
      {/* Ripple Effect Background */}
      <Animated.View style={[styles.rippleEffect, animatedRippleStyle]} />
      
      {/* Professional Microphone Button */}
      <TouchableOpacity
        style={[
          styles.micButton,
          isListening && styles.micButtonActive,
          disabled && styles.micButtonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.micIcon, animatedMicStyle]}>
          <MicrophoneIcon size={52} isActive={isListening} />
        </Animated.View>
        
        {/* Outer Ring for Active State */}
        {isListening && (
          <View style={styles.outerRing} />
        )}
      </TouchableOpacity>

      {/* Enhanced Waveform Animation */}
      {isListening && (
        <View style={styles.waveformContainer}>
          {[...Array(7)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveform,
                animatedWaveformStyle,
                { 
                  backgroundColor: Colors.primary,
                  animationDelay: `${index * 50}ms` 
                }
              ]}
            />
          ))}
        </View>
      )}

      {/* Permission status removed - will be handled automatically */}

      {/* Enhanced Transcript Display */}
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>"{transcript}"</Text>
          {confidence > 0 && (
            <View style={styles.confidenceContainer}>
              <View style={[styles.confidenceBar, { width: `${confidence * 100}%` }]} />
              <Text style={styles.confidenceText}>
                {Math.round(confidence * 100)}% confident
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    position: 'relative',
  },
  rippleEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: Colors.background,
    position: 'relative',
  },
  micButtonActive: {
    backgroundColor: Colors.warning,
    shadowColor: Colors.warning,
    borderColor: Colors.warning + '40',
  },
  micButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  micButtonNoPermission: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  micIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.warning + '60',
    top: -10,
    left: -10,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 3,
    height: 50,
  },
  waveform: {
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginHorizontal: 1,
    minHeight: 8,
  },
  permissionText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.danger,
    marginTop: 12,
    textAlign: 'center',
  },
  transcriptContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    maxWidth: '95%',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  transcriptText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
    fontStyle: 'italic',
  },
  confidenceContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  confidenceBar: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginBottom: 6,
    minWidth: 20,
  },
  confidenceText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

