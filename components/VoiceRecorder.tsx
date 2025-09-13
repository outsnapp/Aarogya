import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onStart: () => void;
  onStop: () => void;
  isListening: boolean;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onTranscript,
  onStart,
  onStop,
  isListening,
  disabled = false,
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);

  // Animation values
  const pulseScale = useSharedValue(1);
  const waveformHeight = useSharedValue(20);

  useEffect(() => {
    if (isListening) {
      startListening();
    } else {
      stopListening();
    }
  }, [isListening]);

  useEffect(() => {
    if (isListening) {
      // Pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      // Waveform animation
      waveformHeight.value = withRepeat(
        withSequence(
          withTiming(40, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming(20, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming(35, { duration: 200, easing: Easing.inOut(Easing.quad) }),
          withTiming(20, { duration: 200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      waveformHeight.value = withTiming(20, { duration: 300 });
    }
  }, [isListening]);

  const startListening = () => {
    // For demo purposes, we'll simulate voice recognition
    // In production, you would use Web Speech API or Google Cloud Speech-to-Text
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const confidence = event.results[current][0].confidence;
        
        setTranscript(transcript);
        setConfidence(confidence);
        onTranscript(transcript);
      };

      recognitionRef.current.onstart = () => {
        onStart();
      };

      recognitionRef.current.onend = () => {
        onStop();
      };

      recognitionRef.current.start();
    } else {
      // Fallback for demo - simulate voice recognition
      setTimeout(() => {
        onStart();
        setTimeout(() => {
          setTranscript('Demo voice input');
          setConfidence(0.95);
          onTranscript('Demo voice input');
          onStop();
        }, 2000);
      }, 500);
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
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedWaveformStyle = useAnimatedStyle(() => ({
    height: waveformHeight.value,
  }));

  return (
    <View style={styles.container}>
      {/* Microphone Button */}
      <TouchableOpacity
        style={[
          styles.micButton,
          isListening && styles.micButtonActive,
          disabled && styles.micButtonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.micIcon, animatedMicStyle]}>
          <Text style={styles.micEmoji}>🎤</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Waveform Animation */}
      {isListening && (
        <View style={styles.waveformContainer}>
          <Animated.View style={[styles.waveform, animatedWaveformStyle]} />
          <Animated.View style={[styles.waveform, animatedWaveformStyle]} />
          <Animated.View style={[styles.waveform, animatedWaveformStyle]} />
          <Animated.View style={[styles.waveform, animatedWaveformStyle]} />
          <Animated.View style={[styles.waveform, animatedWaveformStyle]} />
        </View>
      )}

      {/* Status Text */}
      <Text style={styles.statusText}>
        {isListening ? 'Listening...' : 'Tap to speak'}
      </Text>

      {/* Transcript Display */}
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>{transcript}</Text>
          {confidence > 0 && (
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(confidence * 100)}%
            </Text>
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
    paddingVertical: 20,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: Colors.secondary,
  },
  micButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  micIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micEmoji: {
    fontSize: 40,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  waveform: {
    width: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  statusText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  transcriptContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    maxWidth: '90%',
  },
  transcriptText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal * Typography.sizes.base,
  },
  confidenceText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
