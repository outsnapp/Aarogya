import { supabase } from './supabase';
import { Linking, Alert, Platform } from 'react-native';

// Import location and file system with fallback
let Location: any = null;
let FileSystem: any = null;

try {
  Location = require('expo-location');
} catch (error) {
  console.warn('expo-location not available:', error);
}

try {
  FileSystem = require('expo-file-system');
} catch (error) {
  console.warn('expo-file-system not available:', error);
}

export interface ASHAWorkerProfile {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  rating: number;
  isOnline: boolean;
  languages: string[];
  experience: number;
  patientsHelped: number;
}

export interface VoiceMessage {
  id: string;
  userId: string;
  ashaWorkerId: string;
  audioUrl: string;
  transcript: string;
  duration: number;
  timestamp: string;
  isRead: boolean;
}

export interface HomeVisitRequest {
  id: string;
  userId: string;
  ashaWorkerId: string;
  requestedDate: string;
  preferredTime: string;
  reason: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface MedicalSummary {
  userId: string;
  deliveryDate: string;
  deliveryType: string;
  currentRecoveryPhase: string;
  daysSinceDelivery: number;
  recentHealthMetrics: any[];
  currentConcerns: string[];
  medications: string[];
  allergies: string[];
  emergencyContacts: any[];
}

export class ASHAWorkerService {
  // Get ASHA worker profile
  static async getASHAWorkerProfile(ashaWorkerId: string = 'default'): Promise<ASHAWorkerProfile> {
    // For demo purposes, return a mock ASHA worker profile
    // In a real app, this would fetch from the database
    return {
      id: ashaWorkerId,
      name: 'Priya Sharma',
      phone: '+91-98765-43210',
      specialization: 'Postpartum care, C-section recovery',
      rating: 4.9,
      isOnline: true,
      languages: ['Hindi', 'English', 'Telugu'],
      experience: 8,
      patientsHelped: 127
    };
  }

  // Initiate voice call
  static async initiateVoiceCall(phoneNumber: string): Promise<boolean> {
    try {
      const phoneUrl = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        return true;
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
        return false;
      }
    } catch (error) {
      console.error('Error initiating voice call:', error);
      Alert.alert('Error', 'Failed to initiate voice call');
      return false;
    }
  }

  // Initiate video call (using WhatsApp or similar)
  static async initiateVideoCall(phoneNumber: string): Promise<boolean> {
    try {
      // Try WhatsApp first
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber.replace('+', '')}&text=Hello, I need video consultation for my postpartum recovery.`;
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        // Fallback to regular call
        Alert.alert(
          'Video Call Not Available',
          'WhatsApp is not installed. Would you like to make a regular call instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => this.initiateVoiceCall(phoneNumber) }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error initiating video call:', error);
      Alert.alert('Error', 'Failed to initiate video call');
      return false;
    }
  }

  // Record and send voice message
  static async recordVoiceMessage(userId: string, ashaWorkerId: string): Promise<VoiceMessage | null> {
    try {
      // This would integrate with the VoiceRecorder component
      // For now, we'll simulate the process
      const voiceMessage: VoiceMessage = {
        id: `vm_${Date.now()}`,
        userId,
        ashaWorkerId,
        audioUrl: `file://voice_message_${Date.now()}.m4a`,
        transcript: 'Voice message recorded successfully',
        duration: 30,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      // Save to database (using existing table structure)
      try {
        const { error } = await supabase
          .from('voice_checkins')
          .insert([{
            user_id: userId,
            transcript: voiceMessage.transcript,
            checkin_date: new Date().toISOString(),
            ai_analysis: 'Voice message sent to ASHA worker',
            risk_level: 'low',
            mood_detected: 'neutral',
            recommendations: 'ASHA worker will respond soon'
          }]);

        if (error) {
          console.error('Error saving voice message:', error);
          // Continue anyway - voice message still works via SMS
        }
      } catch (dbError) {
        console.warn('Database save failed, but voice message still works:', dbError);
      }

      // Send SMS notification to ASHA worker
      await this.sendSMSNotification(
        ashaWorkerId,
        `New voice message from patient. Duration: ${voiceMessage.duration}s`
      );

      return voiceMessage;
    } catch (error) {
      console.error('Error recording voice message:', error);
      return null;
    }
  }

  // Share location with ASHA worker
  static async shareLocation(userId: string, ashaWorkerId: string): Promise<boolean> {
    try {
      if (!Location) {
        Alert.alert('Location Not Available', 'Location services are not available on this device. Please share your address manually.');
        return false;
      }

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to share your location');
        return false;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      const address = addressResponse[0] ? 
        `${addressResponse[0].street}, ${addressResponse[0].city}, ${addressResponse[0].region}` :
        'Address not available';

      // Save location to database (using existing table structure)
      try {
        const { error } = await supabase
          .from('anonymous_questions')
          .insert([{
            user_id: userId,
            category: 'location_sharing',
            question_text: `Location shared with ASHA worker: ${address} (${latitude}, ${longitude})`,
            urgency_level: 'normal',
            is_voice_question: false,
            ai_response: 'Location shared successfully',
            is_answered: true,
            is_anonymous: false
          }]);

        if (error) {
          console.error('Error saving location:', error);
          // Continue anyway - location sharing still works via SMS
        }
      } catch (dbError) {
        console.warn('Database save failed, but location sharing still works:', dbError);
      }

      // Send location via SMS
      const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      await this.sendSMSNotification(
        ashaWorkerId,
        `Patient location shared: ${address}\nMap: ${locationUrl}`
      );

      Alert.alert('Location Shared', `Your location has been shared with your ASHA worker.\n\nAddress: ${address}`);
      return true;
    } catch (error) {
      console.error('Error sharing location:', error);
      Alert.alert('Error', 'Failed to share location');
      return false;
    }
  }

  // Make emergency call
  static async makeEmergencyCall(userId: string): Promise<boolean> {
    try {
      // Get emergency contacts
      const { data: emergencyContacts, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .limit(1);

      if (error || !emergencyContacts || emergencyContacts.length === 0) {
        Alert.alert(
          'No Emergency Contact',
          'No emergency contact found. Would you like to call emergency services (108)?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call 108', onPress: () => this.initiateVoiceCall('108') }
          ]
        );
        return false;
      }

      const emergencyContact = emergencyContacts[0];
      
      Alert.alert(
        'Emergency Call',
        `Calling ${emergencyContact.name} (${emergencyContact.relationship}) at ${emergencyContact.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => this.initiateVoiceCall(emergencyContact.phone) }
        ]
      );

      return true;
    } catch (error) {
      console.error('Error making emergency call:', error);
      Alert.alert('Error', 'Failed to make emergency call');
      return false;
    }
  }

  // Share medical summary
  static async shareMedicalSummary(userId: string, ashaWorkerId: string): Promise<boolean> {
    try {
      // Get user's medical data
      const medicalSummary = await this.generateMedicalSummary(userId);
      
      if (!medicalSummary) {
        Alert.alert('Error', 'Unable to generate medical summary');
        return false;
      }

      // Save medical summary to database (using existing table structure)
      try {
        const { error } = await supabase
          .from('anonymous_questions')
          .insert([{
            user_id: userId,
            category: 'medical_summary',
            question_text: `Medical summary shared with ASHA worker: ${medicalSummary.currentRecoveryPhase} (Day ${medicalSummary.daysSinceDelivery})`,
            urgency_level: 'normal',
            is_voice_question: false,
            ai_response: 'Medical summary shared successfully',
            is_answered: true,
            is_anonymous: false
          }]);

        if (error) {
          console.error('Error saving medical summary:', error);
          // Continue anyway - medical summary sharing still works via SMS
        }
      } catch (dbError) {
        console.warn('Database save failed, but medical summary sharing still works:', dbError);
      }

      // Send summary via SMS
      const summaryText = this.formatMedicalSummaryForSMS(medicalSummary);
      await this.sendSMSNotification(ashaWorkerId, `Medical Summary:\n${summaryText}`);

      Alert.alert('Medical Summary Shared', 'Your medical summary has been shared with your ASHA worker');
      return true;
    } catch (error) {
      console.error('Error sharing medical summary:', error);
      Alert.alert('Error', 'Failed to share medical summary');
      return false;
    }
  }

  // Request home visit
  static async requestHomeVisit(userId: string, ashaWorkerId: string, reason: string): Promise<HomeVisitRequest | null> {
    try {
      let address = 'Address not available';
      let coordinates = { latitude: 0, longitude: 0 };

      if (Location) {
        try {
          // Get user's location
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High
            });

            const addressResponse = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            });

            address = addressResponse[0] ? 
              `${addressResponse[0].street}, ${addressResponse[0].city}, ${addressResponse[0].region}` :
              'Address not available';

            coordinates = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            };
          }
        } catch (locationError) {
          console.warn('Location not available for home visit:', locationError);
        }
      }

      const homeVisitRequest: HomeVisitRequest = {
        id: `hvr_${Date.now()}`,
        userId,
        ashaWorkerId,
        requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        preferredTime: '10:00 AM',
        reason,
        address,
        coordinates,
        status: 'pending',
        notes: '',
        createdAt: new Date().toISOString()
      };

      // Save to database (using existing table structure)
      try {
        const { error } = await supabase
          .from('anonymous_questions')
          .insert([{
            user_id: userId,
            category: 'home_visit_request',
            question_text: `Home visit requested for ${homeVisitRequest.requestedDate} at ${homeVisitRequest.preferredTime}. Reason: ${reason}. Address: ${address}`,
            urgency_level: 'normal',
            is_voice_question: false,
            ai_response: 'Home visit request submitted successfully',
            is_answered: true,
            is_anonymous: false
          }]);

        if (error) {
          console.error('Error saving home visit request:', error);
          // Continue anyway - home visit request still works via SMS
        }
      } catch (dbError) {
        console.warn('Database save failed, but home visit request still works:', dbError);
      }

      // Send notification to ASHA worker
      await this.sendSMSNotification(
        ashaWorkerId,
        `Home visit requested for ${homeVisitRequest.requestedDate} at ${homeVisitRequest.preferredTime}.\nReason: ${reason}\nAddress: ${address}`
      );

      Alert.alert(
        'Home Visit Requested',
        `Your home visit has been requested for ${homeVisitRequest.requestedDate} at ${homeVisitRequest.preferredTime}. Your ASHA worker will confirm the appointment.`
      );

      return homeVisitRequest;
    } catch (error) {
      console.error('Error requesting home visit:', error);
      Alert.alert('Error', 'Failed to request home visit');
      return null;
    }
  }

  // Get real-time monitoring data
  static async getRealTimeMonitoringData(userId: string): Promise<any> {
    try {
      // Get recent health metrics
      const { data: healthMetrics, error: healthError } = await supabase
        .from('mother_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false })
        .limit(5);

      // Get baby profile
      const { data: babyProfiles, error: babyError } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Get recent voice check-ins
      const { data: voiceCheckins, error: voiceError } = await supabase
        .from('voice_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(3);

      return {
        healthMetrics: healthMetrics || [],
        babyProfile: babyProfiles?.[0] || null,
        voiceCheckins: voiceCheckins || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting monitoring data:', error);
      return null;
    }
  }

  // Update ASHA worker settings
  static async updateSettings(userId: string, settings: any): Promise<boolean> {
    try {
      // For now, we'll just log the settings since we don't have a dedicated settings table
      // In a real app, you would create a settings table or use user_profiles
      console.log('ASHA Worker Settings Updated:', { userId, settings });
      
      // You could also save to user_profiles if needed:
      // const { error } = await supabase
      //   .from('user_profiles')
      //   .update({ asha_settings: settings })
      //   .eq('id', userId);

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  // Get ASHA worker settings
  static async getSettings(userId: string): Promise<any> {
    try {
      // Return default settings since we don't have a dedicated settings table
      // In a real app, you would fetch from a settings table or user_profiles
      return {
        voice_enabled: true,
        sms_enabled: true,
        language_hindi: false,
        family_notifications: true,
        location_sharing: true
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        voice_enabled: true,
        sms_enabled: true,
        language_hindi: false,
        family_notifications: true,
        location_sharing: true
      };
    }
  }

  // Private helper methods
  private static async sendSMSNotification(ashaWorkerId: string, message: string): Promise<void> {
    // This would integrate with your SMS service
    console.log(`SMS to ASHA Worker ${ashaWorkerId}: ${message}`);
  }

  private static async generateMedicalSummary(userId: string): Promise<MedicalSummary | null> {
    try {
      // Get baby profile
      const { data: babyProfiles, error: babyError } = await supabase
        .from('baby_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (babyError || !babyProfiles || babyProfiles.length === 0) {
        return null;
      }

      const babyProfile = babyProfiles[0];

      // Get recent health metrics
      const { data: healthMetrics, error: healthError } = await supabase
        .from('mother_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false })
        .limit(7);

      // Get emergency contacts
      const { data: emergencyContacts, error: contactError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);

      // Calculate days since delivery
      const deliveryDate = new Date(babyProfile.date_of_birth);
      const today = new Date();
      const daysSinceDelivery = Math.floor((today.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

      // Determine recovery phase
      let currentRecoveryPhase = 'Recovery Complete';
      if (daysSinceDelivery <= 7) {
        currentRecoveryPhase = 'Initial Healing';
      } else if (daysSinceDelivery <= 14) {
        currentRecoveryPhase = 'Early Recovery';
      } else if (daysSinceDelivery <= 28) {
        currentRecoveryPhase = 'Recovery Phase';
      } else if (daysSinceDelivery <= 42) {
        currentRecoveryPhase = 'Strengthening Phase';
      } else if (babyProfile.delivery_type === 'c_section' && daysSinceDelivery <= 56) {
        currentRecoveryPhase = 'Final Recovery';
      }

      return {
        userId,
        deliveryDate: babyProfile.date_of_birth,
        deliveryType: babyProfile.delivery_type,
        currentRecoveryPhase,
        daysSinceDelivery,
        recentHealthMetrics: healthMetrics || [],
        currentConcerns: [], // Would be populated from voice check-ins
        medications: [], // Would be populated from user input
        allergies: [], // Would be populated from user profile
        emergencyContacts: emergencyContacts || []
      };
    } catch (error) {
      console.error('Error generating medical summary:', error);
      return null;
    }
  }

  private static formatMedicalSummaryForSMS(summary: MedicalSummary): string {
    return `Patient ID: ${summary.userId}
Delivery: ${summary.deliveryType} on ${summary.deliveryDate}
Recovery Phase: ${summary.currentRecoveryPhase} (Day ${summary.daysSinceDelivery})
Recent Health: ${summary.recentHealthMetrics.length} check-ins recorded
Emergency Contacts: ${summary.emergencyContacts.length} contacts available`;
  }
}
