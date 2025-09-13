import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch, Modal } from 'react-native';
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
import { Svg, Path, Circle, G, Rect } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
import VoiceRecorder from '../components/VoiceRecorder';

const { width } = Dimensions.get('window');

interface Language {
  code: string;
  name: string;
  nativeName: string;
  voiceSupported: boolean;
  textSupported: boolean;
  accentSupported: boolean;
}

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'success';
  delay: number;
}

interface SettingItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  delay: number;
}

interface LanguageOptionProps {
  language: Language;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}

// Custom icons for multilingual features
const ChangeLanguageIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
      fill={Colors.primary}
    />
  </Svg>
);

const TestVoiceIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 1c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V3c0-1.1-.9-2-2-2z"
      fill={Colors.secondary}
    />
    <Path
      d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2h2v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2h2z"
      fill={Colors.secondary}
    />
    <Path
      d="M11 21h2v2h-2z"
      fill={Colors.secondary}
    />
  </Svg>
);

const DownloadIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
      fill={Colors.warning}
    />
  </Svg>
);

const CulturalIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.primary}
    />
    <Path
      d="M12 6v6l4 2"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const LanguageOption = ({ language, isSelected, onSelect, delay }: LanguageOptionProps) => {
  const optionOpacity = useSharedValue(0);
  const optionTranslateX = useSharedValue(-20);

  useEffect(() => {
    optionOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    optionTranslateX.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedOptionStyle = useAnimatedStyle(() => ({
    opacity: optionOpacity.value,
    transform: [{ translateX: optionTranslateX.value }],
  }));

  return (
    <Animated.View style={animatedOptionStyle}>
      <TouchableOpacity 
        style={[
          styles.languageOption,
          isSelected && styles.languageOptionSelected
        ]} 
        onPress={onSelect}
      >
        <View style={styles.languageInfo}>
          <Text style={[
            styles.languageName,
            isSelected && styles.languageNameSelected
          ]}>
            {language.nativeName}
          </Text>
          <Text style={[
            styles.languageEnglish,
            isSelected && styles.languageEnglishSelected
          ]}>
            {language.name}
          </Text>
        </View>
        <View style={styles.languageFeatures}>
          {language.voiceSupported && (
            <View style={[styles.featureBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.featureText}>🎤 Voice</Text>
            </View>
          )}
          {language.textSupported && (
            <View style={[styles.featureBadge, { backgroundColor: Colors.secondary }]}>
              <Text style={styles.featureText}>📝 Text</Text>
            </View>
          )}
          {language.accentSupported && (
            <View style={[styles.featureBadge, { backgroundColor: Colors.warning }]}>
              <Text style={styles.featureText}>🗣️ Accent</Text>
            </View>
          )}
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuickAction = ({ title, icon, onPress, type, delay }: QuickActionProps) => {
  const actionOpacity = useSharedValue(0);
  const actionScale = useSharedValue(0.9);

  useEffect(() => {
    actionOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    actionScale.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryActionButton;
      case 'secondary':
        return styles.secondaryActionButton;
      case 'success':
        return styles.successActionButton;
      default:
        return styles.secondaryActionButton;
    }
  };

  const animatedActionStyle = useAnimatedStyle(() => ({
    opacity: actionOpacity.value,
    transform: [{ scale: actionScale.value }],
  }));

  return (
    <Animated.View style={animatedActionStyle}>
      <TouchableOpacity style={[styles.actionButton, getButtonStyle()]} onPress={onPress}>
        <View style={styles.actionIcon}>{icon}</View>
        <Text style={styles.actionText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SettingItem = ({ title, description, value, onValueChange, delay }: SettingItemProps) => {
  const settingOpacity = useSharedValue(0);
  const settingTranslateX = useSharedValue(-20);

  useEffect(() => {
    settingOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    settingTranslateX.value = withDelay(
      delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedSettingStyle = useAnimatedStyle(() => ({
    opacity: settingOpacity.value,
    transform: [{ translateX: settingTranslateX.value }],
  }));

  return (
    <Animated.View style={[styles.settingItem, animatedSettingStyle]}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.textMuted + '40', true: Colors.primary }}
        thumbColor={value ? Colors.background : Colors.textMuted}
      />
    </Animated.View>
  );
};

export default function MultilingualSettingsScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [secondaryLanguage, setSecondaryLanguage] = useState('Hindi');
  const [voiceRecognitionEnabled, setVoiceRecognitionEnabled] = useState(true);
  const [textDisplayEnabled, setTextDisplayEnabled] = useState(true);
  const [accentRecognitionEnabled, setAccentRecognitionEnabled] = useState(true);
  const [mixedLanguageEnabled, setMixedLanguageEnabled] = useState(true);
  const [largeTextEnabled, setLargeTextEnabled] = useState(false);
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);
  const [voiceNavigationEnabled, setVoiceNavigationEnabled] = useState(false);
  const [audioDescriptionsEnabled, setAudioDescriptionsEnabled] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  const currentLanguagePulse = useSharedValue(1);

  // Data
  const languages: Language[] = [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voiceSupported: true, textSupported: true, accentSupported: true },
    { code: 'en', name: 'English', nativeName: 'English', voiceSupported: true, textSupported: true, accentSupported: true },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceSupported: true, textSupported: true, accentSupported: true },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceSupported: true, textSupported: true, accentSupported: true },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', voiceSupported: true, textSupported: true, accentSupported: true },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', voiceSupported: true, textSupported: true, accentSupported: true },
  ];

  const regionalSettings = [
    { name: 'Time Zone', value: 'Asia/Kolkata' },
    { name: 'Date Format', value: 'DD/MM/YYYY' },
    { name: 'Currency', value: 'Indian Rupee (₹)' },
    { name: 'Measurement', value: 'Metric system' },
  ];

  const languageLearningFeatures = [
    { name: 'Basic Phrases', description: 'Learn health-related phrases' },
    { name: 'Pronunciation Guide', description: 'Voice pronunciation help' },
    { name: 'Cultural Tips', description: 'Understanding local customs' },
  ];

  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });

    // Section animation
    sectionOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    );
    sectionTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) })
    );

    // Current language pulse animation
    currentLanguagePulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const handleVoiceStart = () => {
    setIsListening(true);
  };

  const handleVoiceStop = () => {
    setIsListening(false);
  };

  const handleVoiceTranscript = (text: string) => {
    console.log('Language test transcript:', text);
  };

  const handleChangeLanguage = () => {
    setShowLanguageModal(true);
  };

  const handleTestVoiceRecognition = () => {
    console.log('Test voice recognition');
  };

  const handleDownloadLanguagePack = () => {
    console.log('Download language pack');
  };

  const handleCulturalPreferences = () => {
    console.log('Cultural preferences');
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language.name);
    setShowLanguageModal(false);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedSectionStyle = useAnimatedStyle(() => ({
    opacity: sectionOpacity.value,
    transform: [{ translateY: sectionTranslateY.value }],
  }));

  const animatedCurrentLanguageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: currentLanguagePulse.value }],
  }));

  const quickActions = [
    { title: 'Change Language', icon: <ChangeLanguageIcon size={24} />, onPress: handleChangeLanguage, type: 'primary' as const, delay: 1200 },
    { title: 'Test Voice Recognition', icon: <TestVoiceIcon size={24} />, onPress: handleTestVoiceRecognition, type: 'secondary' as const, delay: 1500 },
    { title: 'Download Language Pack', icon: <DownloadIcon size={24} />, onPress: handleDownloadLanguagePack, type: 'success' as const, delay: 1800 },
    { title: 'Cultural Preferences', icon: <CulturalIcon size={24} />, onPress: handleCulturalPreferences, type: 'secondary' as const, delay: 2100 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Language & Region</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Current Language Header */}
        <Animated.View style={[styles.currentLanguageCard, animatedCurrentLanguageStyle]}>
          <Text style={styles.currentLanguageTitle}>🌍 Currently: {selectedLanguage}</Text>
          <Text style={styles.currentLanguageSubtitle}>Secondary: {secondaryLanguage}</Text>
        </Animated.View>

        {/* Supported Languages */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Supported Languages</Text>
          <View style={styles.languagesCard}>
            {languages.map((language, index) => (
              <LanguageOption
                key={language.code}
                language={language}
                isSelected={language.name === selectedLanguage}
                onSelect={() => handleLanguageSelect(language)}
                delay={600 + (index * 100)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Language Selection */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Language Selection</Text>
          <View style={styles.languageSelectionCard}>
            <View style={styles.languageSelectionItem}>
              <Text style={styles.languageSelectionLabel}>Primary Language:</Text>
              <Text style={styles.languageSelectionValue}>{selectedLanguage}</Text>
            </View>
            <View style={styles.languageSelectionItem}>
              <Text style={styles.languageSelectionLabel}>Secondary Language:</Text>
              <Text style={styles.languageSelectionValue}>{secondaryLanguage}</Text>
            </View>
            <View style={styles.languageSelectionItem}>
              <Text style={styles.languageSelectionLabel}>Voice Recognition:</Text>
              <Text style={styles.languageSelectionValue}>All languages supported</Text>
            </View>
            <View style={styles.languageSelectionItem}>
              <Text style={styles.languageSelectionLabel}>Text Display:</Text>
              <Text style={styles.languageSelectionValue}>All languages supported</Text>
            </View>
          </View>
        </Animated.View>

        {/* Voice Features */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Voice Features</Text>
          <View style={styles.voiceFeaturesCard}>
            <View style={styles.voiceFeatureItem}>
              <Text style={styles.voiceFeatureTitle}>Speech-to-Text:</Text>
              <Text style={styles.voiceFeatureText}>Works in all 6 languages</Text>
            </View>
            <View style={styles.voiceFeatureItem}>
              <Text style={styles.voiceFeatureTitle}>Text-to-Speech:</Text>
              <Text style={styles.voiceFeatureText}>Natural voice synthesis</Text>
            </View>
            <View style={styles.voiceFeatureItem}>
              <Text style={styles.voiceFeatureTitle}>Accent Recognition:</Text>
              <Text style={styles.voiceFeatureText}>Regional accents supported</Text>
            </View>
            <View style={styles.voiceFeatureItem}>
              <Text style={styles.voiceFeatureTitle}>Mixed Language:</Text>
              <Text style={styles.voiceFeatureText}>Hindi-English conversations OK</Text>
            </View>
          </View>
        </Animated.View>

        {/* Localized Content */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Localized Content</Text>
          <View style={styles.localizedContentCard}>
            <View style={styles.localizedContentItem}>
              <Text style={styles.localizedContentTitle}>Cultural Adaptation:</Text>
              <Text style={styles.localizedContentText}>Content adapted for local customs</Text>
            </View>
            <View style={styles.localizedContentItem}>
              <Text style={styles.localizedContentTitle}>Regional Health Tips:</Text>
              <Text style={styles.localizedContentText}>Location-specific advice</Text>
            </View>
            <View style={styles.localizedContentItem}>
              <Text style={styles.localizedContentTitle}>Local Food Suggestions:</Text>
              <Text style={styles.localizedContentText}>Regional cuisine recommendations</Text>
            </View>
            <View style={styles.localizedContentItem}>
              <Text style={styles.localizedContentTitle}>Festival Integration:</Text>
              <Text style={styles.localizedContentText}>Health tips during festivals</Text>
            </View>
          </View>
        </Animated.View>

        {/* Accessibility Features */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Accessibility Features</Text>
          <View style={styles.accessibilityCard}>
            {[
              { title: 'Large Text', description: 'Adjustable font sizes', value: largeTextEnabled, onValueChange: setLargeTextEnabled, delay: 1200 },
              { title: 'High Contrast', description: 'Better visibility options', value: highContrastEnabled, onValueChange: setHighContrastEnabled, delay: 1400 },
              { title: 'Voice Navigation', description: 'Navigate app using voice', value: voiceNavigationEnabled, onValueChange: setVoiceNavigationEnabled, delay: 1600 },
              { title: 'Audio Descriptions', description: 'Screen reader support', value: audioDescriptionsEnabled, onValueChange: setAudioDescriptionsEnabled, delay: 1800 },
            ].map((setting, index) => (
              <SettingItem
                key={index}
                title={setting.title}
                description={setting.description}
                value={setting.value}
                onValueChange={setting.onValueChange}
                delay={setting.delay}
              />
            ))}
          </View>
        </Animated.View>

        {/* Regional Settings */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Regional Settings</Text>
          <View style={styles.regionalSettingsCard}>
            {regionalSettings.map((setting, index) => (
              <View key={index} style={styles.regionalSettingItem}>
                <Text style={styles.regionalSettingName}>{setting.name}:</Text>
                <Text style={styles.regionalSettingValue}>{setting.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Language Learning */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Language Learning</Text>
          <View style={styles.languageLearningCard}>
            {languageLearningFeatures.map((feature, index) => (
              <View key={index} style={styles.languageLearningItem}>
                <Text style={styles.languageLearningTitle}>{feature.name}:</Text>
                <Text style={styles.languageLearningText}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                title={action.title}
                icon={action.icon}
                onPress={action.onPress}
                type={action.type}
                delay={action.delay}
              />
            ))}
          </View>
        </View>

        {/* Voice Integration */}
        <Animated.View style={[styles.voiceSection, animatedSectionStyle]}>
          <Text style={styles.voiceTitle}>Speak in your preferred language</Text>
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            onStart={handleVoiceStart}
            onStop={handleVoiceStop}
            isListening={isListening}
            disabled={false}
          />
        </Animated.View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Language</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>Choose your primary language</Text>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.modalLanguageOption,
                  selectedLanguage === language.name && styles.modalLanguageOptionSelected
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <View style={styles.modalLanguageInfo}>
                  <Text style={[
                    styles.modalLanguageName,
                    selectedLanguage === language.name && styles.modalLanguageNameSelected
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[
                    styles.modalLanguageEnglish,
                    selectedLanguage === language.name && styles.modalLanguageEnglishSelected
                  ]}>
                    {language.name}
                  </Text>
                </View>
                <View style={styles.modalLanguageFeatures}>
                  {language.voiceSupported && (
                    <Text style={styles.modalFeatureText}>🎤</Text>
                  )}
                  {language.textSupported && (
                    <Text style={styles.modalFeatureText}>📝</Text>
                  )}
                  {language.accentSupported && (
                    <Text style={styles.modalFeatureText}>🗣️</Text>
                  )}
                </View>
                {selectedLanguage === language.name && (
                  <Text style={styles.modalSelectedText}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
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
  currentLanguageCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  currentLanguageTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  currentLanguageSubtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  languagesCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
  },
  languageOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  languageNameSelected: {
    color: Colors.background,
  },
  languageEnglish: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  languageEnglishSelected: {
    color: Colors.background,
    opacity: 0.9,
  },
  languageFeatures: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 12,
  },
  featureBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featureText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
    color: Colors.background,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
  },
  languageSelectionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  languageSelectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageSelectionLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  languageSelectionValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.secondary,
  },
  voiceFeaturesCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceFeatureItem: {
    marginBottom: 12,
  },
  voiceFeatureTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  voiceFeatureText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  localizedContentCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  localizedContentItem: {
    marginBottom: 12,
  },
  localizedContentTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  localizedContentText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  accessibilityCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  regionalSettingsCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  regionalSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  regionalSettingName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  regionalSettingValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.warning,
  },
  languageLearningCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  languageLearningItem: {
    marginBottom: 12,
  },
  languageLearningTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  languageLearningText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: (width - 60) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary,
  },
  secondaryActionButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  successActionButton: {
    backgroundColor: Colors.secondary,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  modalCloseButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLanguageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
  },
  modalLanguageOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalLanguageInfo: {
    flex: 1,
  },
  modalLanguageName: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalLanguageNameSelected: {
    color: Colors.background,
  },
  modalLanguageEnglish: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  modalLanguageEnglishSelected: {
    color: Colors.background,
    opacity: 0.9,
  },
  modalLanguageFeatures: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  modalFeatureText: {
    fontSize: Typography.sizes.base,
  },
  modalSelectedText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
  },
});
