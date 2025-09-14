import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Colors, Typography } from '../constants/Colors';
import { NotificationService, NotificationSettings } from '../lib/notificationService';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyCheckInReminders: true,
    reminderTime: '09:00',
    motherCheckInReminder: true,
    babyCheckInReminder: true,
    weeklyProgressReminder: true,
    milestoneReminders: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await NotificationService.getNotificationSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await NotificationService.saveNotificationSettings(newSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleTestNotification = async () => {
    Alert.alert(
      'Test Notification',
      'This will show you how the daily check-in reminder will appear.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: () => {
            Alert.alert(
              '📊 Daily Check-in Reminder',
              'Time for your daily health check-in! Track: Mother\'s health & Baby\'s progress.',
              [
                { text: 'Later', style: 'cancel' },
                { text: "Mother's Health", onPress: () => console.log('Mother check-in') },
                { text: "Baby's Progress", onPress: () => console.log('Baby check-in') },
                { text: 'Both', onPress: () => console.log('Both check-ins') }
              ]
            );
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Daily Check-in Reminders</Text>
              <Text style={styles.settingDescription}>
                Get reminded to track your daily health progress
              </Text>
            </View>
            <Switch
              value={settings.dailyCheckInReminders}
              onValueChange={(value) => handleToggleSetting('dailyCheckInReminders', value)}
              trackColor={{ false: Colors.textMuted + '40', true: Colors.primary }}
              thumbColor={settings.dailyCheckInReminders ? Colors.background : Colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Mother's Health Reminder</Text>
              <Text style={styles.settingDescription}>
                Remind me to track my recovery progress
              </Text>
            </View>
            <Switch
              value={settings.motherCheckInReminder}
              onValueChange={(value) => handleToggleSetting('motherCheckInReminder', value)}
              trackColor={{ false: Colors.textMuted + '40', true: Colors.primary }}
              thumbColor={settings.motherCheckInReminder ? Colors.background : Colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Baby's Progress Reminder</Text>
              <Text style={styles.settingDescription}>
                Remind me to track baby's growth and development
              </Text>
            </View>
            <Switch
              value={settings.babyCheckInReminder}
              onValueChange={(value) => handleToggleSetting('babyCheckInReminder', value)}
              trackColor={{ false: Colors.textMuted + '40', true: Colors.primary }}
              thumbColor={settings.babyCheckInReminder ? Colors.background : Colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Progress Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Weekly Progress Summary</Text>
              <Text style={styles.settingDescription}>
                Get a weekly summary of your health progress
              </Text>
            </View>
            <Switch
              value={settings.weeklyProgressReminder}
              onValueChange={(value) => handleToggleSetting('weeklyProgressReminder', value)}
              trackColor={{ false: Colors.textMuted + '40', true: Colors.primary }}
              thumbColor={settings.weeklyProgressReminder ? Colors.background : Colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Milestone Celebrations</Text>
              <Text style={styles.settingDescription}>
                Celebrate recovery milestones and achievements
              </Text>
            </View>
            <Switch
              value={settings.milestoneReminders}
              onValueChange={(value) => handleToggleSetting('milestoneReminders', value)}
              trackColor={{ false: Colors.textMuted + '40', true: Colors.primary }}
              thumbColor={settings.milestoneReminders ? Colors.background : Colors.textMuted}
            />
          </View>
        </View>

        {/* Test Notification */}
        <View style={styles.testContainer}>
          <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
            <Text style={styles.testButtonText}>Test Notification</Text>
            <Text style={styles.testButtonSubtext}>See how reminders will appear</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            • Daily reminders help you stay consistent with health tracking{'\n'}
            • Progress summaries show your improvement over time{'\n'}
            • Milestone celebrations motivate you to keep going{'\n'}
            • You can change these settings anytime
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  settingsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
  testContainer: {
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  testButtonText: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.background,
    marginBottom: 4,
  },
  testButtonSubtext: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.background,
    opacity: 0.9,
  },
  infoContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
});
