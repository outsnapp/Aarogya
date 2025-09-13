import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Typography } from '../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface TextInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  placeholder: string;
  title: string;
  inputType?: 'text' | 'phone' | 'date';
}

export default function TextInputModal({
  visible,
  onClose,
  onSubmit,
  placeholder,
  title,
  inputType = 'text',
}: TextInputModalProps) {
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      setInputText(''); // Clear input when modal closes
    }
  }, [visible]);

  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit(inputText.trim());
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const getKeyboardType = () => {
    switch (inputType) {
      case 'phone':
        return 'phone-pad';
      case 'date':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    
    switch (inputType) {
      case 'phone':
        return 'Enter phone number (e.g., 9876543210)';
      case 'date':
        return 'Enter date (e.g., 15 January 2024)';
      default:
        return 'Type your answer here...';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder={getPlaceholderText()}
                placeholderTextColor={Colors.textMuted}
                keyboardType={getKeyboardType()}
                multiline={inputType === 'date'}
                numberOfLines={inputType === 'date' ? 2 : 1}
                autoFocus
                onFocus={() => setIsKeyboardVisible(true)}
                onBlur={() => setIsKeyboardVisible(false)}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !inputText.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!inputText.trim()}
              >
                <Text style={[
                  styles.submitButtonText,
                  !inputText.trim() && styles.submitButtonTextDisabled,
                ]}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.textMuted + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textMuted + '40',
  },
  submitButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  submitButtonTextDisabled: {
    color: Colors.textMuted,
  },
});

