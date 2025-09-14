import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Colors, Typography } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface VoiceRecorderProps {
  onTranscript?: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  isListening?: boolean;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

export default function VoiceRecorder({
  onTranscript,
  onStart,
  onStop,
  isListening = false,
  disabled = false,
  maxDuration = 60,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const pulseAnimation = useSharedValue(1);
  const waveAnimation = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);

  const startPulseAnimation = () => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    waveAnimation.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  };

  const stopPulseAnimation = () => {
    pulseAnimation.value = withTiming(1, { duration: 300 });
    waveAnimation.value = withTiming(0, { duration: 300 });
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to record voice messages.');
      return;
    }

    if (disabled) return;

    try {
      setIsRecording(true);
      setRecordingDuration(0);
      onStart?.();

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      onStop?.();

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      // Simulate transcription (in a real app, you'd use a speech-to-text service)
      const simulatedTranscript = await simulateTranscription();
      onTranscript?.(simulatedTranscript);

      setRecordingDuration(0);

    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording.');
    }
  };

  const simulateTranscription = async (): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a simulated transcript based on duration
    const duration = recordingDuration;
    if (duration < 5) {
      return "Hello, I need help with my recovery.";
    } else if (duration < 15) {
      return "I'm feeling some pain in my abdomen area and wanted to ask about it.";
    } else {
      return "I've been experiencing some discomfort and would like to schedule a home visit to discuss my recovery progress.";
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const animatedWaveStyle = useAnimatedStyle(() => ({
    opacity: waveAnimation.value * 0.3,
    transform: [{ scale: 1 + waveAnimation.value * 0.5 }],
  }));

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Microphone permission is required for voice messages.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.recorderContainer}>
        {/* Recording Button */}
        <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              disabled && styles.recordButtonDisabled
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color={isRecording ? Colors.danger : Colors.textLight}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Wave Animation */}
        {isRecording && (
          <Animated.View style={[styles.waveContainer, animatedWaveStyle]} />
        )}

        {/* Status Text */}
        <Text style={styles.statusText}>
          {isRecording 
            ? `Recording... ${formatDuration(recordingDuration)}`
            : 'Tap to record voice message'
          }
        </Text>

        {/* Duration Indicator */}
        {isRecording && (
          <View style={styles.durationContainer}>
            <View style={styles.durationBar}>
              <View 
                style={[
                  styles.durationProgress, 
                  { width: `${(recordingDuration / maxDuration) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.durationText}>
              {formatDuration(maxDuration - recordingDuration)} remaining
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recorderContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: Colors.danger,
  },
  recordButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
  },
  waveContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
    top: -20,
    left: -20,
  },
  statusText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  durationContainer: {
    width: width * 0.8,
    alignItems: 'center',
  },
  durationBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.textMuted + '30',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  durationProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  durationText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  permissionText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
