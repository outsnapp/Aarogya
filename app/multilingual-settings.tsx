import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch, Modal, Alert, TextInput } from 'react-native';
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
// VoiceRecorder removed for clean demo
import { MultilingualService, Language, LanguageSettings, RegionalSettings } from '../lib/multilingualService';

const { width } = Dimensions.get('window');

// Remove duplicate interface since it's imported from service

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
          {/* Voice feature removed for clean demo */}
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
  const [showCulturalModal, setShowCulturalModal] = useState(false);
  const [showPhrasesModal, setShowPhrasesModal] = useState(false);
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // State from service
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    primaryLanguage: 'English',
    secondaryLanguage: 'Hindi',
    voiceRecognitionEnabled: false, // Disabled for clean demo
    textDisplayEnabled: true,
    accentRecognitionEnabled: true,
    mixedLanguageEnabled: true,
    largeTextEnabled: false,
    highContrastEnabled: false,
    voiceNavigationEnabled: false, // Disabled for clean demo
    audioDescriptionsEnabled: false,
    autoTranslateEnabled: true,
    culturalAdaptationEnabled: true
  });
  
  const [regionalSettings, setRegionalSettings] = useState<RegionalSettings>({
    timeZone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'Indian Rupee (₹)',
    measurement: 'Metric system',
    temperatureUnit: 'Celsius'
  });
  
  // voiceTestResults removed for clean demo
  const [languages, setLanguages] = useState<Language[]>([]);
  const [culturalTips, setCulturalTips] = useState<string[]>([]);
  const [healthPhrases, setHealthPhrases] = useState<{ english: string; native: string; pronunciation: string }[]>([]);
  const [pronunciationGuide, setPronunciationGuide] = useState<{ word: string; pronunciation: string; audioUrl?: string }[]>([]);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const sectionOpacity = useSharedValue(0);
  const sectionTranslateY = useSharedValue(30);
  const currentLanguagePulse = useSharedValue(1);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settings, regional, supportedLanguages] = await Promise.all([
        MultilingualService.getLanguageSettings(),
        MultilingualService.getRegionalSettings(),
        Promise.resolve(MultilingualService.getSupportedLanguages())
      ]);
      
      setLanguageSettings(settings);
      setRegionalSettings(regional);
      // Voice test results removed for clean demo
      setLanguages(supportedLanguages);
    } catch (error) {
      console.error('Error loading multilingual data:', error);
      Alert.alert('Error', 'Failed to load language settings');
    } finally {
      setLoading(false);
    }
  };

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

  // Voice recording functions removed for clean demo

  const handleChangeLanguage = () => {
    setShowLanguageModal(true);
  };

  const handleTestVoiceRecognition = () => {
    // Voice recognition test removed for clean demo
    Alert.alert('Voice Test', 'Voice testing feature removed for clean demo.');
  };

  const handleDownloadLanguagePack = () => {
    Alert.alert(
      'Download Language Pack',
      'Select a language to download:',
      languages.filter(l => !l.isDownloaded).map(language => ({
        text: `${language.nativeName} (${language.downloadSize})`,
        onPress: () => downloadLanguagePack(language.code)
      })).concat([{ text: 'Cancel', onPress: async () => {} }])
    );
  };

  const downloadLanguagePack = async (languageCode: string) => {
    setDownloading(languageCode);
    setDownloadProgress(0);
    
    try {
      const result = await MultilingualService.downloadLanguagePack(languageCode);
      
      if (result.success) {
        Alert.alert('Success', 'Language pack downloaded successfully!');
        await loadData(); // Reload data to update download status
      } else {
        Alert.alert('Download Failed', 'Failed to download language pack. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading language pack:', error);
      Alert.alert('Error', 'Failed to download language pack');
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  };

  const handleCulturalPreferences = async () => {
    try {
      const tips = await MultilingualService.getCulturalTips(languageSettings.primaryLanguage);
      setCulturalTips(tips);
      setShowCulturalModal(true);
    } catch (error) {
      console.error('Error loading cultural tips:', error);
      Alert.alert('Error', 'Failed to load cultural tips');
    }
  };

  const handleLanguageSelect = async (language: Language) => {
    try {
      await MultilingualService.updateLanguagePreference('primary', language.name);
      setLanguageSettings(prev => ({ ...prev, primaryLanguage: language.name }));
      setShowLanguageModal(false);
      
      Alert.alert('Success', `Primary language changed to ${language.nativeName}`);
    } catch (error) {
      console.error('Error updating language preference:', error);
      Alert.alert('Error', 'Failed to update language preference');
    }
  };

  const handleToggleSetting = async (settingKey: keyof LanguageSettings) => {
    try {
      const success = await MultilingualService.toggleSetting(settingKey);
      if (success) {
        setLanguageSettings(prev => ({ ...prev, [settingKey]: !prev[settingKey] }));
      } else {
        Alert.alert('Error', 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error toggling setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleShowHealthPhrases = async () => {
    try {
      const phrases = await MultilingualService.getHealthPhrases(languageSettings.primaryLanguage);
      setHealthPhrases(phrases);
      setShowPhrasesModal(true);
    } catch (error) {
      console.error('Error loading health phrases:', error);
      Alert.alert('Error', 'Failed to load health phrases');
    }
  };

  const handleShowPronunciationGuide = async () => {
    try {
      const guide = await MultilingualService.getPronunciationGuide(languageSettings.primaryLanguage);
      setPronunciationGuide(guide);
      setShowPronunciationModal(true);
    } catch (error) {
      console.error('Error loading pronunciation guide:', error);
      Alert.alert('Error', 'Failed to load pronunciation guide');
    }
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
    // Voice recognition test removed for clean demo
    { title: 'Download Language Pack', icon: <DownloadIcon size={24} />, onPress: handleDownloadLanguagePack, type: 'success' as const, delay: 1800 },
    { title: 'Cultural Preferences', icon: <CulturalIcon size={24} />, onPress: handleCulturalPreferences, type: 'secondary' as const, delay: 2100 },
    { title: 'Health Phrases', icon: <CulturalIcon size={24} />, onPress: handleShowHealthPhrases, type: 'primary' as const, delay: 2400 },
    { title: 'Pronunciation Guide', icon: <TestVoiceIcon size={24} />, onPress: handleShowPronunciationGuide, type: 'secondary' as const, delay: 2700 },
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
          <Text style={styles.currentLanguageTitle}>🌍 Currently: {languageSettings.primaryLanguage}</Text>
          <Text style={styles.currentLanguageSubtitle}>Secondary: {languageSettings.secondaryLanguage}</Text>
          {downloading && (
            <View style={styles.downloadProgressContainer}>
              <Text style={styles.downloadProgressText}>
                Downloading {downloading}... {downloadProgress}%
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Supported Languages */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Supported Languages</Text>
          <View style={styles.languagesCard}>
            {languages.map((language, index) => (
              <LanguageOption
                key={language.code}
                language={language}
                isSelected={language.name === languageSettings.primaryLanguage}
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
              <Text style={styles.languageSelectionValue}>{languageSettings.primaryLanguage}</Text>
            </View>
            <View style={styles.languageSelectionItem}>
              <Text style={styles.languageSelectionLabel}>Secondary Language:</Text>
              <Text style={styles.languageSelectionValue}>{languageSettings.secondaryLanguage}</Text>
            </View>
            <View style={styles.languageSelectionItem}>
              <Text style={styles.languageSelectionLabel}>Text Recognition:</Text>
              <Text style={styles.languageSelectionValue}>All languages supported</Text>
            </View>
            <View style={styles.languageSelectionItem}>
              <Text style={styles.languageSelectionLabel}>Text Display:</Text>
              <Text style={styles.languageSelectionValue}>All languages supported</Text>
            </View>
          </View>
        </Animated.View>

        {/* Voice features removed for clean demo */}

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
              // Voice recognition setting removed for clean demo
              { title: 'Text Display', description: 'Show text in selected language', value: languageSettings.textDisplayEnabled, onValueChange: () => handleToggleSetting('textDisplayEnabled'), delay: 1400 },
              { title: 'Accent Recognition', description: 'Recognize regional accents', value: languageSettings.accentRecognitionEnabled, onValueChange: () => handleToggleSetting('accentRecognitionEnabled'), delay: 1600 },
              { title: 'Mixed Language', description: 'Allow mixed language conversations', value: languageSettings.mixedLanguageEnabled, onValueChange: () => handleToggleSetting('mixedLanguageEnabled'), delay: 1800 },
              { title: 'Large Text', description: 'Adjustable font sizes', value: languageSettings.largeTextEnabled, onValueChange: () => handleToggleSetting('largeTextEnabled'), delay: 2000 },
              { title: 'High Contrast', description: 'Better visibility options', value: languageSettings.highContrastEnabled, onValueChange: () => handleToggleSetting('highContrastEnabled'), delay: 2200 },
              // Voice navigation setting removed for clean demo
              { title: 'Audio Descriptions', description: 'Screen reader support', value: languageSettings.audioDescriptionsEnabled, onValueChange: () => handleToggleSetting('audioDescriptionsEnabled'), delay: 2600 },
              { title: 'Auto Translate', description: 'Automatically translate content', value: languageSettings.autoTranslateEnabled, onValueChange: () => handleToggleSetting('autoTranslateEnabled'), delay: 2800 },
              { title: 'Cultural Adaptation', description: 'Adapt content for local culture', value: languageSettings.culturalAdaptationEnabled, onValueChange: () => handleToggleSetting('culturalAdaptationEnabled'), delay: 3000 },
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
            <View style={styles.regionalSettingItem}>
              <Text style={styles.regionalSettingName}>Time Zone:</Text>
              <Text style={styles.regionalSettingValue}>{regionalSettings.timeZone}</Text>
            </View>
            <View style={styles.regionalSettingItem}>
              <Text style={styles.regionalSettingName}>Date Format:</Text>
              <Text style={styles.regionalSettingValue}>{regionalSettings.dateFormat}</Text>
            </View>
            <View style={styles.regionalSettingItem}>
              <Text style={styles.regionalSettingName}>Currency:</Text>
              <Text style={styles.regionalSettingValue}>{regionalSettings.currency}</Text>
            </View>
            <View style={styles.regionalSettingItem}>
              <Text style={styles.regionalSettingName}>Measurement:</Text>
              <Text style={styles.regionalSettingValue}>{regionalSettings.measurement}</Text>
            </View>
            <View style={styles.regionalSettingItem}>
              <Text style={styles.regionalSettingName}>Temperature Unit:</Text>
              <Text style={styles.regionalSettingValue}>{regionalSettings.temperatureUnit}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Language Learning */}
        <Animated.View style={[styles.section, animatedSectionStyle]}>
          <Text style={styles.sectionTitle}>Language Learning</Text>
          <View style={styles.languageLearningCard}>
            <TouchableOpacity style={styles.languageLearningItem} onPress={handleShowHealthPhrases}>
              <Text style={styles.languageLearningTitle}>Basic Health Phrases:</Text>
              <Text style={styles.languageLearningText}>Learn health-related phrases in your language</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageLearningItem} onPress={handleShowPronunciationGuide}>
              <Text style={styles.languageLearningTitle}>Pronunciation Guide:</Text>
              <Text style={styles.languageLearningText}>Text pronunciation help for health terms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageLearningItem} onPress={handleCulturalPreferences}>
              <Text style={styles.languageLearningTitle}>Cultural Tips:</Text>
              <Text style={styles.languageLearningText}>Understanding local customs and health practices</Text>
            </TouchableOpacity>
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

        {/* Voice recording removed for clean demo */}
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
                  languageSettings.primaryLanguage === language.name && styles.modalLanguageOptionSelected
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <View style={styles.modalLanguageInfo}>
                  <Text style={[
                    styles.modalLanguageName,
                    languageSettings.primaryLanguage === language.name && styles.modalLanguageNameSelected
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[
                    styles.modalLanguageEnglish,
                    languageSettings.primaryLanguage === language.name && styles.modalLanguageEnglishSelected
                  ]}>
                    {language.name}
                  </Text>
                  {language.isDownloaded && (
                    <Text style={styles.downloadedText}>✓ Downloaded</Text>
                  )}
                </View>
                <View style={styles.modalLanguageFeatures}>
                  {/* Voice feature removed for clean demo */}
                  {language.textSupported && (
                    <Text style={styles.modalFeatureText}>📝</Text>
                  )}
                  {language.accentSupported && (
                    <Text style={styles.modalFeatureText}>🗣️</Text>
                  )}
                </View>
                {languageSettings.primaryLanguage === language.name && (
                  <Text style={styles.modalSelectedText}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Cultural Tips Modal */}
      <Modal
        visible={showCulturalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCulturalModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCulturalModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Cultural Tips</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>Cultural tips for {languageSettings.primaryLanguage}</Text>
            {culturalTips.map((tip, index) => (
              <View key={index} style={styles.culturalTipItem}>
                <Text style={styles.culturalTipText}>• {tip}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Health Phrases Modal */}
      <Modal
        visible={showPhrasesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPhrasesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPhrasesModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Health Phrases</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>Health phrases in {languageSettings.primaryLanguage}</Text>
            {healthPhrases.map((phrase, index) => (
              <View key={index} style={styles.phraseItem}>
                <Text style={styles.phraseEnglish}>{phrase.english}</Text>
                <Text style={styles.phraseNative}>{phrase.native}</Text>
                <Text style={styles.phrasePronunciation}>Pronunciation: {phrase.pronunciation}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Pronunciation Guide Modal */}
      <Modal
        visible={showPronunciationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPronunciationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPronunciationModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pronunciation Guide</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>Pronunciation guide for {languageSettings.primaryLanguage}</Text>
            {pronunciationGuide.map((guide, index) => (
              <View key={index} style={styles.pronunciationItem}>
                <Text style={styles.pronunciationWord}>{guide.word}</Text>
                <Text style={styles.pronunciationText}>Pronunciation: {guide.pronunciation}</Text>
                {guide.audioUrl && (
                  <TouchableOpacity style={styles.audioButton}>
                    <Text style={styles.audioButtonText}>🔊 Play Audio</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  // Voice features styles removed for clean demo
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
  // Voice section styles removed for clean demo
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
  downloadedText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
    color: Colors.secondary,
    marginTop: 2,
  },
  downloadProgressContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.background + '20',
    borderRadius: 8,
  },
  downloadProgressText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.background,
    textAlign: 'center',
  },
  culturalTipItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  culturalTipText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  phraseItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  phraseEnglish: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  phraseNative: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.primary,
    marginBottom: 8,
  },
  phrasePronunciation: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  pronunciationItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  pronunciationWord: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pronunciationText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  audioButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  audioButtonText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.background,
  },
});
