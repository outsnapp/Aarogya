import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  voiceSupported: boolean;
  textSupported: boolean;
  accentSupported: boolean;
  isDownloaded?: boolean;
  downloadSize?: string;
}

export interface LanguageSettings {
  primaryLanguage: string;
  secondaryLanguage: string;
  voiceRecognitionEnabled: boolean;
  textDisplayEnabled: boolean;
  accentRecognitionEnabled: boolean;
  mixedLanguageEnabled: boolean;
  largeTextEnabled: boolean;
  highContrastEnabled: boolean;
  voiceNavigationEnabled: boolean;
  audioDescriptionsEnabled: boolean;
  autoTranslateEnabled: boolean;
  culturalAdaptationEnabled: boolean;
}

export interface RegionalSettings {
  timeZone: string;
  dateFormat: string;
  currency: string;
  measurement: string;
  temperatureUnit: string;
}

export interface VoiceTestResult {
  language: string;
  accuracy: number;
  confidence: number;
  transcript: string;
  timestamp: string;
}

export interface LanguagePack {
  language: string;
  version: string;
  size: string;
  features: string[];
  lastUpdated: string;
}

export class MultilingualService {
  private static readonly STORAGE_KEY = 'multilingual_settings';
  private static readonly VOICE_TEST_KEY = 'voice_test_results';
  private static readonly LANGUAGE_PACKS_KEY = 'language_packs';

  // Supported languages with full feature set
  static readonly SUPPORTED_LANGUAGES: Language[] = [
    { 
      code: 'hi', 
      name: 'Hindi', 
      nativeName: 'हिन्दी', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: true,
      downloadSize: '45 MB'
    },
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: true,
      downloadSize: '32 MB'
    },
    { 
      code: 'te', 
      name: 'Telugu', 
      nativeName: 'తెలుగు', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '52 MB'
    },
    { 
      code: 'ta', 
      name: 'Tamil', 
      nativeName: 'தமிழ்', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '48 MB'
    },
    { 
      code: 'kn', 
      name: 'Kannada', 
      nativeName: 'ಕನ್ನಡ', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '46 MB'
    },
    { 
      code: 'ml', 
      name: 'Malayalam', 
      nativeName: 'മലയാളം', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '50 MB'
    },
    { 
      code: 'bn', 
      name: 'Bengali', 
      nativeName: 'বাংলা', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '44 MB'
    },
    { 
      code: 'gu', 
      name: 'Gujarati', 
      nativeName: 'ગુજરાતી', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '42 MB'
    },
    { 
      code: 'mr', 
      name: 'Marathi', 
      nativeName: 'मराठी', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '47 MB'
    },
    { 
      code: 'pa', 
      name: 'Punjabi', 
      nativeName: 'ਪੰਜਾਬੀ', 
      voiceSupported: true, 
      textSupported: true, 
      accentSupported: true,
      isDownloaded: false,
      downloadSize: '43 MB'
    }
  ];

  // Get current language settings
  static async getLanguageSettings(): Promise<LanguageSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading language settings:', error);
    }

    // Default settings
    return {
      primaryLanguage: 'English',
      secondaryLanguage: 'Hindi',
      voiceRecognitionEnabled: true,
      textDisplayEnabled: true,
      accentRecognitionEnabled: true,
      mixedLanguageEnabled: true,
      largeTextEnabled: false,
      highContrastEnabled: false,
      voiceNavigationEnabled: false,
      audioDescriptionsEnabled: false,
      autoTranslateEnabled: true,
      culturalAdaptationEnabled: true
    };
  }

  // Save language settings
  static async saveLanguageSettings(settings: LanguageSettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      
      // Also save to database for backup
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('user_profiles')
          .update({
            language_preferences: settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving language settings:', error);
      return false;
    }
  }

  // Get regional settings
  static async getRegionalSettings(): Promise<RegionalSettings> {
    try {
      const stored = await AsyncStorage.getItem('regional_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading regional settings:', error);
    }

    // Default regional settings for India
    return {
      timeZone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'Indian Rupee (₹)',
      measurement: 'Metric system',
      temperatureUnit: 'Celsius'
    };
  }

  // Save regional settings
  static async saveRegionalSettings(settings: RegionalSettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem('regional_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving regional settings:', error);
      return false;
    }
  }

  // Test voice recognition for a specific language
  static async testVoiceRecognition(language: string, transcript: string): Promise<VoiceTestResult> {
    try {
      // Simulate voice recognition testing
      const accuracy = Math.random() * 20 + 80; // 80-100% accuracy
      const confidence = Math.random() * 15 + 85; // 85-100% confidence
      
      const result: VoiceTestResult = {
        language,
        accuracy: Math.round(accuracy),
        confidence: Math.round(confidence),
        transcript,
        timestamp: new Date().toISOString()
      };

      // Save test result
      const testResults = await this.getVoiceTestResults();
      testResults.push(result);
      await AsyncStorage.setItem(this.VOICE_TEST_KEY, JSON.stringify(testResults));

      return result;
    } catch (error) {
      console.error('Error testing voice recognition:', error);
      throw error;
    }
  }

  // Get voice test results
  static async getVoiceTestResults(): Promise<VoiceTestResult[]> {
    try {
      const stored = await AsyncStorage.getItem(this.VOICE_TEST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading voice test results:', error);
      return [];
    }
  }

  // Download language pack
  static async downloadLanguagePack(languageCode: string): Promise<{ success: boolean; progress?: number }> {
    try {
      // Simulate download progress
      const language = this.SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
      if (!language) {
        throw new Error('Language not supported');
      }

      // Simulate download with progress updates
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            clearInterval(interval);
            
            // Mark as downloaded
            language.isDownloaded = true;
            
            // Save to storage
            this.saveLanguagePackInfo(languageCode, {
              language: language.name,
              version: '1.0.0',
              size: language.downloadSize || '0 MB',
              features: ['Voice Recognition', 'Text Display', 'Accent Recognition'],
              lastUpdated: new Date().toISOString()
            });
            
            resolve({ success: true, progress: 100 });
          } else {
            resolve({ success: false, progress });
          }
        }, 200);
      });
    } catch (error) {
      console.error('Error downloading language pack:', error);
      return { success: false };
    }
  }

  // Save language pack info
  private static async saveLanguagePackInfo(languageCode: string, packInfo: LanguagePack): Promise<void> {
    try {
      const packs = await this.getLanguagePacks();
      packs[languageCode] = packInfo;
      await AsyncStorage.setItem(this.LANGUAGE_PACKS_KEY, JSON.stringify(packs));
    } catch (error) {
      console.error('Error saving language pack info:', error);
    }
  }

  // Get language packs info
  static async getLanguagePacks(): Promise<Record<string, LanguagePack>> {
    try {
      const stored = await AsyncStorage.getItem(this.LANGUAGE_PACKS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading language packs:', error);
      return {};
    }
  }

  // Translate text using AI service
  static async translateText(text: string, fromLanguage: string, toLanguage: string): Promise<string> {
    try {
      // For now, return a simple translation simulation
      // In a real app, this would use a translation API
      const translations: Record<string, Record<string, string>> = {
        'English': {
          'Hindi': 'यह एक स्वास्थ्य ऐप है',
          'Telugu': 'ఇది ఒక ఆరోగ్య అనువర్తనం',
          'Tamil': 'இது ஒரு சுகாதார பயன்பாடு',
          'Kannada': 'ಇದು ಒಂದು ಆರೋಗ್ಯ ಅಪ್ಲಿಕೇಶನ್',
          'Malayalam': 'ഇത് ഒരു ആരോഗ്യ ആപ്ലിക്കേഷനാണ്'
        },
        'Hindi': {
          'English': 'This is a health app',
          'Telugu': 'ఇది ఒక ఆరోగ్య అనువర్తనం',
          'Tamil': 'இது ஒரு சுகாதார பயன்பாடு'
        }
      };

      return translations[fromLanguage]?.[toLanguage] || text;
    } catch (error) {
      console.error('Error translating text:', error);
      return text;
    }
  }

  // Get cultural tips for a language
  static async getCulturalTips(language: string): Promise<string[]> {
    const culturalTips: Record<string, string[]> = {
      'Hindi': [
        'Use "आप" (aap) for formal address, "तुम" (tum) for informal',
        'Health discussions are often family-oriented',
        'Traditional remedies are highly respected',
        'Festivals like Diwali affect health routines'
      ],
      'Telugu': [
        'Use "మీరు" (meeru) for respect, "నువ్వు" (nuvvu) for close relationships',
        'Family health decisions involve elders',
        'Ayurvedic practices are common',
        'Regional festivals influence health practices'
      ],
      'Tamil': [
        'Use "நீங்கள்" (neengal) for formal, "நீ" (nee) for informal',
        'Traditional medicine (Siddha) is popular',
        'Family health is community concern',
        'Temple festivals affect health routines'
      ],
      'Kannada': [
        'Use "ನೀವು" (neevu) for respect, "ನೀನು" (neenu) for informal',
        'Joint family health decisions are common',
        'Traditional practices are valued',
        'Local festivals impact health schedules'
      ],
      'Malayalam': [
        'Use "നിങ്ങൾ" (ningal) for formal, "നീ" (nee) for informal',
        'Ayurvedic treatments are preferred',
        'Family health is collective responsibility',
        'Onam and other festivals affect health routines'
      ]
    };

    return culturalTips[language] || [
      'Be respectful in health discussions',
      'Consider family involvement in health decisions',
      'Respect traditional health practices',
      'Be aware of cultural health beliefs'
    ];
  }

  // Get health phrases in different languages
  static async getHealthPhrases(language: string): Promise<{ english: string; native: string; pronunciation: string }[]> {
    const phrases: Record<string, { english: string; native: string; pronunciation: string }[]> = {
      'Hindi': [
        { english: 'How are you feeling?', native: 'आप कैसा महसूस कर रहे हैं?', pronunciation: 'Aap kaisa mehsoos kar rahe hain?' },
        { english: 'Do you have any pain?', native: 'क्या आपको कोई दर्द है?', pronunciation: 'Kya aapko koi dard hai?' },
        { english: 'Take your medicine', native: 'अपनी दवा लें', pronunciation: 'Apni dawa lein' },
        { english: 'Rest well', native: 'अच्छी तरह आराम करें', pronunciation: 'Acchi tarah aaram karein' }
      ],
      'Telugu': [
        { english: 'How are you feeling?', native: 'మీరు ఎలా ఉన్నారు?', pronunciation: 'Meeru ela unnaru?' },
        { english: 'Do you have any pain?', native: 'మీకు ఏదైనా నొప్పి ఉందా?', pronunciation: 'Meeku edaina noppi unda?' },
        { english: 'Take your medicine', native: 'మీ మందు తీసుకోండి', pronunciation: 'Mee mandu teesukondi' },
        { english: 'Rest well', native: 'బాగా విశ్రాంతి తీసుకోండి', pronunciation: 'Baga visranti teesukondi' }
      ],
      'Tamil': [
        { english: 'How are you feeling?', native: 'நீங்கள் எப்படி உணர்கிறீர்கள்?', pronunciation: 'Neengal eppadi unarkireergal?' },
        { english: 'Do you have any pain?', native: 'உங்களுக்கு வலி இருக்கிறதா?', pronunciation: 'Ungalukku vali irukkiradha?' },
        { english: 'Take your medicine', native: 'உங்கள் மருந்து எடுத்துக்கொள்ளுங்கள்', pronunciation: 'Ungal marunthu eduthukkollungal' },
        { english: 'Rest well', native: 'நன்றாக ஓய்வெடுங்கள்', pronunciation: 'Nandraaga oyvedungal' }
      ]
    };

    return phrases[language] || [
      { english: 'How are you feeling?', native: 'How are you feeling?', pronunciation: 'How are you feeling?' },
      { english: 'Do you have any pain?', native: 'Do you have any pain?', pronunciation: 'Do you have any pain?' }
    ];
  }

  // Get pronunciation guide
  static async getPronunciationGuide(language: string): Promise<{ word: string; pronunciation: string; audioUrl?: string }[]> {
    const guides: Record<string, { word: string; pronunciation: string; audioUrl?: string }[]> = {
      'Hindi': [
        { word: 'स्वास्थ्य', pronunciation: 'svaasthya', audioUrl: 'audio/hindi_health.mp3' },
        { word: 'दवा', pronunciation: 'dawa', audioUrl: 'audio/hindi_medicine.mp3' },
        { word: 'डॉक्टर', pronunciation: 'doctor', audioUrl: 'audio/hindi_doctor.mp3' }
      ],
      'Telugu': [
        { word: 'ఆరోగ్యం', pronunciation: 'aarogyam', audioUrl: 'audio/telugu_health.mp3' },
        { word: 'మందు', pronunciation: 'mandu', audioUrl: 'audio/telugu_medicine.mp3' },
        { word: 'వైద్యుడు', pronunciation: 'vaidyudu', audioUrl: 'audio/telugu_doctor.mp3' }
      ]
    };

    return guides[language] || [];
  }

  // Update language preference
  static async updateLanguagePreference(languageType: 'primary' | 'secondary', language: string): Promise<boolean> {
    try {
      const settings = await this.getLanguageSettings();
      if (languageType === 'primary') {
        settings.primaryLanguage = language;
      } else {
        settings.secondaryLanguage = language;
      }
      return await this.saveLanguageSettings(settings);
    } catch (error) {
      console.error('Error updating language preference:', error);
      return false;
    }
  }

  // Toggle setting
  static async toggleSetting(settingKey: keyof LanguageSettings): Promise<boolean> {
    try {
      const settings = await this.getLanguageSettings();
      settings[settingKey] = !settings[settingKey];
      return await this.saveLanguageSettings(settings);
    } catch (error) {
      console.error('Error toggling setting:', error);
      return false;
    }
  }

  // Get supported languages
  static getSupportedLanguages(): Language[] {
    return this.SUPPORTED_LANGUAGES;
  }

  // Check if language pack is downloaded
  static async isLanguagePackDownloaded(languageCode: string): Promise<boolean> {
    const language = this.SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
    return language?.isDownloaded || false;
  }

  // Get language by code
  static getLanguageByCode(code: string): Language | undefined {
    return this.SUPPORTED_LANGUAGES.find(l => l.code === code);
  }

  // Get language by name
  static getLanguageByName(name: string): Language | undefined {
    return this.SUPPORTED_LANGUAGES.find(l => l.name === name);
  }

  // Clear all settings
  static async clearAllSettings(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEY,
        this.VOICE_TEST_KEY,
        this.LANGUAGE_PACKS_KEY,
        'regional_settings'
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing settings:', error);
      return false;
    }
  }
}
