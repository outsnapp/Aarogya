import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface NotificationSettings {
  dailyCheckInReminders: boolean;
  reminderTime: string; // Format: "HH:MM"
  motherCheckInReminder: boolean;
  babyCheckInReminder: boolean;
  weeklyProgressReminder: boolean;
  milestoneReminders: boolean;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'daily_checkin' | 'progress' | 'milestone' | 'reminder';
  scheduledTime: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  private static readonly STORAGE_KEY = 'notification_settings';
  private static readonly NOTIFICATIONS_KEY = 'notifications';
  private static readonly LAST_CHECKIN_KEY = 'last_checkin_reminder';

  // Get notification settings
  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }

    // Default settings
    return {
      dailyCheckInReminders: true,
      reminderTime: '09:00',
      motherCheckInReminder: true,
      babyCheckInReminder: true,
      weeklyProgressReminder: true,
      milestoneReminders: true
    };
  }

  // Save notification settings
  static async saveNotificationSettings(settings: NotificationSettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving notification settings:', error);
      return false;
    }
  }

  // Check if daily check-in reminder should be shown
  static async shouldShowDailyCheckInReminder(userId: string): Promise<boolean> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.dailyCheckInReminders) return false;

      const lastReminder = await AsyncStorage.getItem(`${this.LAST_CHECKIN_KEY}_${userId}`);
      if (!lastReminder) return true;

      const lastReminderDate = new Date(lastReminder);
      const today = new Date();
      
      // Check if it's a new day
      return lastReminderDate.toDateString() !== today.toDateString();
    } catch (error) {
      console.error('Error checking reminder status:', error);
      return false;
    }
  }

  // Show daily check-in reminder
  static async showDailyCheckInReminder(
    userId: string,
    onMotherCheckIn: () => void,
    onBabyCheckIn: () => void
  ): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.dailyCheckInReminders) return;

      const shouldShow = await this.shouldShowDailyCheckInReminder(userId);
      if (!shouldShow) return;

      // Create reminder message
      let message = "Time for your daily health check-in! ";
      const reminders = [];
      
      if (settings.motherCheckInReminder) {
        reminders.push("Mother's health");
      }
      if (settings.babyCheckInReminder) {
        reminders.push("Baby's progress");
      }

      if (reminders.length > 0) {
        message += `Track: ${reminders.join(' & ')}.`;
      }

      // Show alert with options
      Alert.alert(
        "📊 Daily Check-in Reminder",
        message,
        [
          {
            text: "Later",
            style: "cancel",
            onPress: () => this.markReminderShown(userId)
          },
          ...(settings.motherCheckInReminder ? [{
            text: "Mother's Health",
            onPress: () => {
              this.markReminderShown(userId);
              onMotherCheckIn();
            }
          }] : []),
          ...(settings.babyCheckInReminder ? [{
            text: "Baby's Progress",
            onPress: () => {
              this.markReminderShown(userId);
              onBabyCheckIn();
            }
          }] : []),
          ...(settings.motherCheckInReminder && settings.babyCheckInReminder ? [{
            text: "Both",
            onPress: () => {
              this.markReminderShown(userId);
              onMotherCheckIn();
              // Delay baby check-in slightly
              setTimeout(() => onBabyCheckIn(), 500);
            }
          }] : [])
        ]
      );
    } catch (error) {
      console.error('Error showing daily check-in reminder:', error);
    }
  }

  // Mark reminder as shown
  private static async markReminderShown(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.LAST_CHECKIN_KEY}_${userId}`,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error marking reminder as shown:', error);
    }
  }

  // Schedule notification (for future implementation with push notifications)
  static async scheduleNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<void> {
    try {
      const notificationData: NotificationData = {
        ...notification,
        id: `notif_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Store notification
      const stored = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      const notifications = stored ? JSON.parse(stored) : [];
      notifications.unshift(notificationData);
      
      // Keep only last 50 notifications
      await AsyncStorage.setItem(
        this.NOTIFICATIONS_KEY,
        JSON.stringify(notifications.slice(0, 50))
      );

      // In a real app, you would schedule a push notification here
      console.log('📱 Notification scheduled:', notificationData);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Get notification history
  static async getNotificationHistory(limit: number = 20): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        return notifications.slice(0, limit);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
    return [];
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        const updatedNotifications = notifications.map((notif: NotificationData) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        );
        await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Clear all notifications
  static async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Check and show progress milestone notifications
  static async checkProgressMilestones(userId: string, progressData: any): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.milestoneReminders) return;

      // Check for recovery milestones
      if (progressData.recoveryProgress) {
        const { percentage, phase } = progressData.recoveryProgress;
        
        // 25% milestone
        if (percentage >= 25 && percentage < 30) {
          await this.scheduleNotification({
            title: "🎉 Recovery Milestone!",
            message: "You're 25% through your recovery journey. Keep up the great work!",
            type: "milestone",
            scheduledTime: new Date().toISOString(),
            isRead: false
          });
        }
        
        // 50% milestone
        if (percentage >= 50 && percentage < 55) {
          await this.scheduleNotification({
            title: "🌟 Halfway There!",
            message: "Amazing! You're halfway through your recovery. You're doing great!",
            type: "milestone",
            scheduledTime: new Date().toISOString(),
            isRead: false
          });
        }
        
        // 75% milestone
        if (percentage >= 75 && percentage < 80) {
          await this.scheduleNotification({
            title: "🚀 Almost There!",
            message: "You're 75% through your recovery! The finish line is in sight!",
            type: "milestone",
            scheduledTime: new Date().toISOString(),
            isRead: false
          });
        }
        
        // 100% milestone
        if (percentage >= 100) {
          await this.scheduleNotification({
            title: "🏆 Recovery Complete!",
            message: "Congratulations! You've completed your recovery journey. You're amazing!",
            type: "milestone",
            scheduledTime: new Date().toISOString(),
            isRead: false
          });
        }
      }
    } catch (error) {
      console.error('Error checking progress milestones:', error);
    }
  }

  // Show weekly progress summary
  static async showWeeklyProgressSummary(userId: string, progressData: any): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.weeklyProgressReminder) return;

      // Check if it's been a week since last summary
      const lastSummary = await AsyncStorage.getItem(`last_weekly_summary_${userId}`);
      if (lastSummary) {
        const lastSummaryDate = new Date(lastSummary);
        const daysSince = (new Date().getTime() - lastSummaryDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) return;
      }

      // Generate summary message
      let summaryMessage = "📊 Your weekly progress summary:\n\n";
      
      if (progressData.recoveryProgress) {
        summaryMessage += `• Recovery: ${progressData.recoveryProgress.percentage}% complete\n`;
        summaryMessage += `• Phase: ${progressData.recoveryProgress.phase}\n\n`;
      }

      if (progressData.healthMetrics) {
        summaryMessage += `• Energy Level: ${progressData.healthMetrics.energyLevel}/10\n`;
        summaryMessage += `• Mood Score: ${progressData.healthMetrics.moodScore}/10\n`;
        summaryMessage += `• Sleep: ${progressData.healthMetrics.sleepHours} hours\n\n`;
      }

      summaryMessage += "Keep tracking your progress for better insights!";

      Alert.alert(
        "📈 Weekly Progress Summary",
        summaryMessage,
        [
          {
            text: "View Details",
            onPress: () => {
              // Navigate to progress details
              console.log('Navigate to progress details');
            }
          },
          {
            text: "OK",
            style: "default"
          }
        ]
      );

      // Mark summary as shown
      await AsyncStorage.setItem(
        `last_weekly_summary_${userId}`,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error showing weekly progress summary:', error);
    }
  }

  // Initialize notification service
  static async initialize(userId: string): Promise<void> {
    try {
      // Check for daily reminders
      await this.showDailyCheckInReminder(
        userId,
        () => console.log('Mother check-in requested'),
        () => console.log('Baby check-in requested')
      );
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }
}
