import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  type: 'primary' | 'secondary' | 'emergency';
  status: 'active' | 'inactive';
  is_emergency_contact: boolean;
  can_receive_updates: boolean;
  can_receive_emergency_alerts: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  contact_id: string;
  type: 'daily_update' | 'emergency_alert' | 'voice_message' | 'location_share' | 'medical_update';
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  sent_at: string;
  contact_name: string;
}

export interface FamilySettings {
  dailyProgressUpdates: boolean;
  emergencyAlertsOnly: boolean;
  voiceMessageNotifications: boolean;
  locationSharing: boolean;
  shareMedicalHistory: 'none' | 'limited' | 'full';
  locationSharingDuration: number; // hours
  emergencyContactAccess: 'primary_only' | 'all_contacts';
  autoShareLocation: boolean;
  shareHealthMetrics: boolean;
  shareNutritionData: boolean;
  shareExerciseData: boolean;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  type: 'medical_emergency' | 'fall_detected' | 'panic_button' | 'health_concern';
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  sent_to: string[];
  status: 'sent' | 'delivered' | 'failed';
  created_at: string;
}

export interface LocationShare {
  id: string;
  user_id: string;
  contact_id: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  duration_hours: number;
  expires_at: string;
  created_at: string;
}

export class FamilyNetworkService {
  private static readonly STORAGE_KEY = 'family_network_settings';
  private static readonly CONTACTS_KEY = 'family_contacts';
  private static readonly NOTIFICATIONS_KEY = 'family_notifications';

  // Get all family contacts - OPTIMIZED FOR SPEED
  static async getFamilyContacts(userId: string): Promise<Contact[]> {
    try {
      // Try to fetch from database first with optimized query
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('id, user_id, name, relationship, phone, email, type, is_emergency_contact, can_receive_updates, can_receive_emergency_alerts, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20); // Limit for performance

      if (error) {
        console.error('Error fetching contacts from database:', error);
        // Fallback to local storage
        return await this.getLocalContacts();
      }

      // Transform database data to Contact format
      const contacts: Contact[] = (data || []).map(contact => ({
        id: contact.id,
        user_id: contact.user_id,
        name: contact.name,
        relationship: contact.relationship || '',
        phone: contact.phone,
        email: contact.email,
        type: contact.type || 'secondary',
        status: 'active',
        is_emergency_contact: contact.is_emergency_contact || false,
        can_receive_updates: contact.can_receive_updates !== false,
        can_receive_emergency_alerts: contact.can_receive_emergency_alerts !== false,
        created_at: contact.created_at,
        updated_at: contact.created_at
      }));

      // Save to local storage for offline access (non-blocking)
      this.saveLocalContacts(contacts).catch(err => 
        console.warn('Failed to save contacts to local storage:', err)
      );
      return contacts;
    } catch (error) {
      console.error('Error getting family contacts:', error);
      return await this.getLocalContacts();
    }
  }

  // Get local contacts from storage
  private static async getLocalContacts(): Promise<Contact[]> {
    try {
      const stored = await AsyncStorage.getItem(this.CONTACTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading local contacts:', error);
    }

    // Return default contacts if no local data
    return [
      {
        id: '1',
        user_id: 'default',
        name: 'Rajesh',
        relationship: 'Husband',
        phone: '+91 98765 43210',
        type: 'primary',
        status: 'active',
        is_emergency_contact: true,
        can_receive_updates: true,
        can_receive_emergency_alerts: true
      },
      {
        id: '2',
        user_id: 'default',
        name: 'Sita',
        relationship: 'Mother',
        phone: '+91 98765 43211',
        type: 'secondary',
        status: 'active',
        is_emergency_contact: false,
        can_receive_updates: true,
        can_receive_emergency_alerts: true
      },
      {
        id: '3',
        user_id: 'default',
        name: 'Dr. Sharma',
        relationship: 'Family Doctor',
        phone: '+91 98765 43212',
        type: 'emergency',
        status: 'active',
        is_emergency_contact: true,
        can_receive_updates: false,
        can_receive_emergency_alerts: true
      }
    ];
  }

  // Save contacts to local storage
  private static async saveLocalContacts(contacts: Contact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving local contacts:', error);
    }
  }

  // Save notifications to local storage
  private static async saveLocalNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving local notifications:', error);
    }
  }

  // Add new contact
  static async addContact(userId: string, contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; contact?: Contact; error?: any }> {
    try {
      const newContact: Contact = {
        id: `contact_${Date.now()}`,
        user_id: userId,
        ...contactData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to save to database
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([{
          user_id: userId,
          name: contactData.name,
          relationship: contactData.relationship,
          phone: contactData.phone,
          email: contactData.email,
          is_emergency: contactData.is_emergency_contact
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving contact to database:', error);
        // Save locally as fallback
        const contacts = await this.getLocalContacts();
        contacts.push(newContact);
        await this.saveLocalContacts(contacts);
        return { success: true, contact: newContact };
      }

      // Update local storage
      const contacts = await this.getLocalContacts();
      contacts.push(newContact);
      await this.saveLocalContacts(contacts);

      return { success: true, contact: newContact };
    } catch (error) {
      console.error('Error adding contact:', error);
      return { success: false, error };
    }
  }

  // Update contact
  static async updateContact(contactId: string, updates: Partial<Contact>): Promise<{ success: boolean; error?: any }> {
    try {
      // Update local storage
      const contacts = await this.getLocalContacts();
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex !== -1) {
        contacts[contactIndex] = { ...contacts[contactIndex], ...updates, updated_at: new Date().toISOString() };
        await this.saveLocalContacts(contacts);
      }

      // Try to update database
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          name: updates.name,
          relationship: updates.relationship,
          phone: updates.phone,
          email: updates.email,
          is_emergency: updates.is_emergency_contact
        })
        .eq('id', contactId);

      if (error) {
        console.error('Error updating contact in database:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error };
    }
  }

  // Delete contact
  static async deleteContact(contactId: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Update local storage
      const contacts = await this.getLocalContacts();
      const filteredContacts = contacts.filter(c => c.id !== contactId);
      await this.saveLocalContacts(filteredContacts);

      // Try to delete from database
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('Error deleting contact from database:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error };
    }
  }

  // Get family settings
  static async getFamilySettings(): Promise<FamilySettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading family settings:', error);
    }

    // Default settings
    return {
      dailyProgressUpdates: true,
      emergencyAlertsOnly: true,
      voiceMessageNotifications: false,
      locationSharing: true,
      shareMedicalHistory: 'limited',
      locationSharingDuration: 24,
      emergencyContactAccess: 'all_contacts',
      autoShareLocation: false,
      shareHealthMetrics: true,
      shareNutritionData: false,
      shareExerciseData: false
    };
  }

  // Save family settings
  static async saveFamilySettings(settings: FamilySettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving family settings:', error);
      return false;
    }
  }

  // Get notification history - OPTIMIZED FOR SPEED
  static async getNotificationHistory(userId: string, limit: number = 10): Promise<Notification[]> {
    try {
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, contact_id, contact_name, message, notification_type, status, sent_at, created_at')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        // Transform database data to Notification format
        const notifications: Notification[] = data.map(notif => ({
          id: notif.id,
          user_id: notif.user_id,
          contact_id: notif.contact_id,
          type: notif.notification_type as any,
          message: notif.message,
          status: notif.status as any,
          sent_at: notif.sent_at,
          contact_name: notif.contact_name || 'Unknown'
        }));

        // Save to local storage as backup (non-blocking)
        this.saveLocalNotifications(notifications).catch(err => 
          console.warn('Failed to save notifications to local storage:', err)
        );
        return notifications;
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        return notifications.filter((n: Notification) => n.user_id === userId).slice(0, limit);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }

    // Return empty array if no data found
    return [];
  }

  // Send emergency alert
  static async sendEmergencyAlert(userId: string, alertType: EmergencyAlert['type'], message: string, location?: { latitude: number; longitude: number; address: string }): Promise<{ success: boolean; alertId?: string; error?: any }> {
    try {
      const contacts = await this.getFamilyContacts(userId);
      const emergencyContacts = contacts.filter(c => c.can_receive_emergency_alerts);
      
      const alert: EmergencyAlert = {
        id: `alert_${Date.now()}`,
        user_id: userId,
        type: alertType,
        message,
        location,
        sent_to: emergencyContacts.map(c => c.id),
        status: 'sent',
        created_at: new Date().toISOString()
      };

      // Simulate sending alerts
      for (const contact of emergencyContacts) {
        await this.sendSMS(contact.phone, this.formatEmergencyMessage(alert, contact.name));
      }

      // Save notification
      await this.saveNotification({
        id: `notif_${Date.now()}`,
        user_id: userId,
        contact_id: 'all',
        type: 'emergency_alert',
        message: `Emergency alert sent to ${emergencyContacts.length} contacts`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        contact_name: 'All Emergency Contacts'
      });

      return { success: true, alertId: alert.id };
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      return { success: false, error };
    }
  }

  // Send daily progress update
  static async sendDailyProgressUpdate(userId: string, progressData: any): Promise<{ success: boolean; error?: any }> {
    try {
      const settings = await this.getFamilySettings();
      if (!settings.dailyProgressUpdates) {
        return { success: true }; // Feature disabled
      }

      const contacts = await this.getFamilyContacts(userId);
      const updateContacts = contacts.filter(c => c.can_receive_updates);

      for (const contact of updateContacts) {
        const message = this.formatProgressMessage(progressData, contact.name);
        await this.sendSMS(contact.phone, message);
        
        await this.saveNotification({
          id: `notif_${Date.now()}_${contact.id}`,
          user_id: userId,
          contact_id: contact.id,
          type: 'daily_update',
          message: `Daily progress update sent to ${contact.name}`,
          status: 'sent',
          sent_at: new Date().toISOString(),
          contact_name: contact.name
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending daily progress update:', error);
      return { success: false, error };
    }
  }

  // Share location
  static async shareLocation(userId: string, contactId: string, location: { latitude: number; longitude: number; address: string }, durationHours: number = 24): Promise<{ success: boolean; error?: any }> {
    try {
      const contacts = await this.getFamilyContacts(userId);
      const contact = contacts.find(c => c.id === contactId);
      
      if (!contact) {
        return { success: false, error: 'Contact not found' };
      }

      const locationShare: LocationShare = {
        id: `location_${Date.now()}`,
        user_id: userId,
        contact_id: contactId,
        location,
        duration_hours: durationHours,
        expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      const message = `📍 Location Shared\n\nI'm currently at:\n${location.address}\n\nThis location will be shared for ${durationHours} hours.\n\nLatitude: ${location.latitude}\nLongitude: ${location.longitude}`;
      
      await this.sendSMS(contact.phone, message);

      await this.saveNotification({
        id: `notif_${Date.now()}_${contactId}`,
        user_id: userId,
        contact_id: contactId,
        type: 'location_share',
        message: `Location shared with ${contact.name} for ${durationHours} hours`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        contact_name: contact.name
      });

      return { success: true };
    } catch (error) {
      console.error('Error sharing location:', error);
      return { success: false, error };
    }
  }

  // Send voice message notification
  static async sendVoiceMessageNotification(userId: string, contactId: string, message: string): Promise<{ success: boolean; error?: any }> {
    try {
      const contacts = await this.getFamilyContacts(userId);
      const contact = contacts.find(c => c.id === contactId);
      
      if (!contact) {
        return { success: false, error: 'Contact not found' };
      }

      const voiceMessage = `🎤 Voice Message\n\n${message}\n\nThis is an automated notification from your family health app.`;
      
      await this.sendSMS(contact.phone, voiceMessage);

      await this.saveNotification({
        id: `notif_${Date.now()}_${contactId}`,
        user_id: userId,
        contact_id: contactId,
        type: 'voice_message',
        message: `Voice message notification sent to ${contact.name}`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        contact_name: contact.name
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending voice message notification:', error);
      return { success: false, error };
    }
  }

  // Send SMS (simulated) - Optimized for speed
  private static async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      // In a real app, this would use a service like Twilio
      console.log(`📱 SMS to ${phoneNumber}: ${message}`);
      
      // Reduced delay for speed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For demo purposes, we can also try to open the SMS app
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  // Format emergency message
  private static formatEmergencyMessage(alert: EmergencyAlert, contactName: string): string {
    const urgency = alert.type === 'medical_emergency' ? '🚨 MEDICAL EMERGENCY' : '⚠️ EMERGENCY ALERT';
    const locationText = alert.location ? `\n📍 Location: ${alert.location.address}` : '';
    
    return `${urgency}\n\nHello ${contactName},\n\n${alert.message}${locationText}\n\nThis is an automated alert from the family health app. Please respond immediately if you can help.\n\nTime: ${new Date(alert.created_at).toLocaleString()}`;
  }

  // Format progress message
  private static formatProgressMessage(progressData: any, contactName: string): string {
    return `📊 Daily Health Update\n\nHello ${contactName},\n\nHere's today's health progress:\n\n${JSON.stringify(progressData, null, 2)}\n\nThis is an automated update from the family health app.\n\nTime: ${new Date().toLocaleString()}`;
  }

  // Save notification to local storage
  private static async saveNotification(notification: Notification): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      const notifications = stored ? JSON.parse(stored) : [];
      notifications.unshift(notification); // Add to beginning
      await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 50))); // Keep last 50
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  // Test emergency alert
  static async testEmergencyAlert(userId: string): Promise<{ success: boolean; error?: any }> {
    return await this.sendEmergencyAlert(
      userId,
      'health_concern',
      'This is a test emergency alert. Everything is fine - this is just to test the emergency notification system.',
      {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'New Delhi, India'
      }
    );
  }

  // Get contact by ID
  static async getContactById(contactId: string): Promise<Contact | null> {
    try {
      const contacts = await this.getLocalContacts();
      return contacts.find(c => c.id === contactId) || null;
    } catch (error) {
      console.error('Error getting contact by ID:', error);
      return null;
    }
  }

  // Update setting
  static async updateSetting(settingKey: keyof FamilySettings, value: any): Promise<boolean> {
    try {
      const settings = await this.getFamilySettings();
      settings[settingKey] = value;
      return await this.saveFamilySettings(settings);
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEY,
        this.CONTACTS_KEY,
        this.NOTIFICATIONS_KEY
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing family network data:', error);
      return false;
    }
  }
}
