import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
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
import { SMSService } from '../lib/smsService';

const { width } = Dimensions.get('window');

interface SMSMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function SMSDemoScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const messagesOpacity = useSharedValue(0);

  // Sample SMS conversation
  const sampleMessages = [
    { text: "bleeding heavy", isUser: true },
    { text: "Aarogya: ⚠️ Urgent — we found signs of bleeding. Please contact a doctor or nearest clinic now. If you want, reply CALL to connect to a health worker.", isUser: false },
    { text: "help", isUser: true },
    { text: "Aarogya: Send symptoms like: bleeding, fever, pain, sad, tired. Reply STOP to opt out. For emergency call local health services.", isUser: false },
    { text: "tired and sad", isUser: true },
    { text: "Aarogya: Caution — we noticed tired. Try home care: Rest and monitor symptoms Re-check in 24 hrs or reply HELP for more.", isUser: false },
  ];

  // Animate on mount
  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    messagesOpacity.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const animatedMessagesStyle = useAnimatedStyle(() => ({
    opacity: messagesOpacity.value,
  }));

  const simulateSMSConversation = () => {
    setMessages([]);
    setIsTyping(true);

    sampleMessages.forEach((msg, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `${index}`,
          text: msg.text,
          isUser: msg.isUser,
          timestamp: new Date()
        }]);
        
        if (index === sampleMessages.length - 1) {
          setIsTyping(false);
        }
      }, index * 2000);
    });
  };

  const testSMSFeature = () => {
    Alert.alert(
      'SMS Feature Test',
      'This demonstrates how users can send symptoms via SMS and receive instant health guidance. Perfect for rural areas with limited internet access.',
      [
        { text: 'Start Demo', onPress: simulateSMSConversation },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const showSMSTemplates = () => {
    Alert.alert(
      'SMS Templates',
      `Welcome: "Namaste! Send symptoms like: bleeding, fever, sad"\n\nGreen: "All looks OK today. Tip: Drink warm fluids and rest"\n\nYellow: "Caution — we noticed pain. Try home care: Apply warm compress"\n\nRed: "⚠️ Urgent — we found signs of bleeding. Please contact a doctor now"`,
      [{ text: 'OK' }]
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
        <Text style={styles.headerTitle}>D2Buff SMS Feature</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Feature Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 SMS Health Monitoring</Text>
          <Text style={styles.sectionDescription}>
            D2Buff (Day 2 Buffer) allows users to report symptoms via SMS when they can't access the app. 
            Perfect for rural areas with limited internet connectivity.
          </Text>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Key Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureText}>Smart symptom parsing from natural language</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>Instant health risk assessment (Green/Yellow/Red)</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌐</Text>
              <Text style={styles.featureText}>Works on any basic phone - no app required</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚨</Text>
              <Text style={styles.featureText}>Emergency alerts to family contacts</Text>
            </View>
          </View>
        </View>

        {/* Demo Section */}
        <Animated.View style={[styles.section, animatedMessagesStyle]}>
          <Text style={styles.sectionTitle}>💬 Live Demo</Text>
          
          <TouchableOpacity style={styles.demoButton} onPress={testSMSFeature}>
            <Text style={styles.demoButtonText}>Start SMS Conversation Demo</Text>
          </TouchableOpacity>

          {/* SMS Messages */}
          {messages.length > 0 && (
            <View style={styles.messagesContainer}>
              {messages.map((message) => (
                <View key={message.id} style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.botMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.botMessageText
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    message.isUser ? styles.userMessageTime : styles.botMessageTime
                  ]}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
              
              {isTyping && (
                <View style={[styles.messageBubble, styles.botMessage, styles.typingBubble]}>
                  <Text style={styles.typingText}>Aarogya is typing...</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Technical Implementation</Text>
          <View style={styles.techDetails}>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>SMS Provider:</Text>
              <Text style={styles.techValue}>Twilio (webhook-based)</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Parsing:</Text>
              <Text style={styles.techValue}>Keyword matching + NLP</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Response Time:</Text>
              <Text style={styles.techValue}>Under 2 seconds</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Languages:</Text>
              <Text style={styles.techValue}>6 Indian languages</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={showSMSTemplates}>
            <Text style={styles.actionButtonText}>View SMS Templates</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/dashboard')}>
            <Text style={styles.actionButtonText}>Back to Dashboard</Text>
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
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  demoButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  demoButtonText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  messagesContainer: {
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: Colors.cardBackground,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingBubble: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  userMessageText: {
    color: Colors.white,
  },
  botMessageText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.body,
    marginTop: 4,
  },
  userMessageTime: {
    color: Colors.white,
    opacity: 0.8,
  },
  botMessageTime: {
    color: Colors.textMuted,
  },
  typingText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  techDetails: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  techValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
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
