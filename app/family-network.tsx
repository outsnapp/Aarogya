import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch, Alert, Modal, TextInput } from 'react-native';
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
import { Svg, Path, Circle, G } from 'react-native-svg';

import { Colors, Typography } from '../constants/Colors';
import { FamilyNetworkService, Contact, FamilySettings, Notification } from '../lib/familyNetworkService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Remove duplicate interfaces since they're imported from service

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'danger';
  delay: number;
}

interface SettingItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  delay: number;
}

interface PrivacyControlProps {
  title: string;
  description: string;
  value: string;
  onPress: () => void;
  delay: number;
}

// Custom icons for quick actions
const TestAlertIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={Colors.textPrimary}
    />
    <Path
      d="M12 6v6l4 2"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const AddContactIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      fill={Colors.textPrimary}
    />
    <Circle cx="8.5" cy="7" r="4" fill={Colors.textPrimary} />
    <Path
      d="M20 8v6M23 11h-6"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const EditContactIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      fill={Colors.textPrimary}
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={Colors.background}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HistoryIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill={Colors.textPrimary}
    />
    <Path
      d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      fill={Colors.background}
    />
  </Svg>
);

const ContactCard = ({ contact, delay }: { contact: Contact; delay: number }) => {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);
  const statusPulse = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    cardTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );

    // Status pulse animation for active contacts
    if (contact.status === 'active') {
      statusPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    }
  }, [contact.status, delay]);

  const getContactStyle = () => {
    switch (contact.type) {
      case 'primary':
        return { backgroundColor: Colors.primary, borderColor: Colors.primary };
      case 'secondary':
        return { backgroundColor: Colors.secondary, borderColor: Colors.secondary };
      case 'emergency':
        return { backgroundColor: Colors.danger, borderColor: Colors.danger };
      default:
        return { backgroundColor: Colors.background, borderColor: Colors.textMuted };
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const animatedStatusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statusPulse.value }],
  }));

  return (
    <Animated.View style={[styles.contactCard, getContactStyle(), animatedCardStyle]}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
        <Animated.View style={[styles.statusContainer, animatedStatusStyle]}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: contact.status === 'active' ? Colors.background : Colors.textMuted }
          ]}>
            <Text style={[
              styles.statusText,
              { color: contact.status === 'active' ? Colors.primary : Colors.textMuted }
            ]}>
              {contact.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </Animated.View>
      </View>
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
      case 'danger':
        return styles.dangerActionButton;
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
      <TouchableOpacity style={[styles.quickActionButton, getButtonStyle()]} onPress={onPress}>
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

const PrivacyControl = ({ title, description, value, onPress, delay }: PrivacyControlProps) => {
  const controlOpacity = useSharedValue(0);
  const controlTranslateY = useSharedValue(20);

  useEffect(() => {
    controlOpacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    controlTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const animatedControlStyle = useAnimatedStyle(() => ({
    opacity: controlOpacity.value,
    transform: [{ translateY: controlTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.privacyControl, animatedControlStyle]}>
      <TouchableOpacity style={styles.privacyControlButton} onPress={onPress}>
        <View style={styles.privacyContent}>
          <Text style={styles.privacyTitle}>{title}</Text>
          <Text style={styles.privacyDescription}>{description}</Text>
        </View>
        <View style={styles.privacyValue}>
          <Text style={styles.privacyValueText}>{value}</Text>
          <Text style={styles.privacyArrow}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FamilyNetworkScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [privacySetting, setPrivacySetting] = useState<string>('');
  
  // State from service
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [familySettings, setFamilySettings] = useState<FamilySettings>({
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
  });
  
  // Form data for modals
  const [newContactData, setNewContactData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    type: 'secondary' as 'primary' | 'secondary' | 'emergency',
    is_emergency_contact: false,
    can_receive_updates: true,
    can_receive_emergency_alerts: true
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load data in parallel for speed
      const [contactsData, notificationsData, settingsData] = await Promise.all([
        FamilyNetworkService.getFamilyContacts(user.id),
        FamilyNetworkService.getNotificationHistory(user.id, 5), // Limit to 5 for speed
        FamilyNetworkService.getFamilySettings()
      ]);
      
      // Batch state updates for performance
      setContacts(contactsData);
      setNotifications(notificationsData);
      setFamilySettings(settingsData);
      
      // Trigger animations immediately
      headerOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      headerTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    } catch (error) {
      console.error('Error loading family network data:', error);
      Alert.alert('Error', 'Failed to load family network data');
    } finally {
      setLoading(false);
    }
  };

  // Animations are now triggered in loadData for better performance

  const handleTestEmergencyAlert = async () => {
    if (!user) return;
    
    Alert.alert(
      'Test Emergency Alert',
      'This will send a test emergency alert to all your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Test Alert', 
          onPress: async () => {
            try {
              const result = await FamilyNetworkService.testEmergencyAlert(user.id);
              if (result.success) {
                Alert.alert('Success', 'Test emergency alert sent successfully!');
                await loadData(); // Reload to show new notification
              } else {
                Alert.alert('Error', 'Failed to send test emergency alert');
              }
            } catch (error) {
              console.error('Error sending test emergency alert:', error);
              Alert.alert('Error', 'Failed to send test emergency alert');
            }
          }
        }
      ]
    );
  };

  const handleAddNewContact = () => {
    setNewContactData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      type: 'secondary',
      is_emergency_contact: false,
      can_receive_updates: true,
      can_receive_emergency_alerts: true
    });
    setShowAddContactModal(true);
  };

  const handleEditContactDetails = () => {
    Alert.alert(
      'Edit Contact',
      'Select a contact to edit:',
      contacts.map(contact => ({
        text: `${contact.name} (${contact.relationship})`,
        onPress: () => {
          setSelectedContact(contact);
          setNewContactData({
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            email: contact.email || '',
            type: contact.type,
            is_emergency_contact: contact.is_emergency_contact,
            can_receive_updates: contact.can_receive_updates,
            can_receive_emergency_alerts: contact.can_receive_emergency_alerts
          });
          setShowEditContactModal(true);
        }
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const handleViewNotificationHistory = () => {
    Alert.alert(
      'Notification History',
      `You have ${notifications.length} recent notifications. The most recent ones are shown below.`,
      [{ text: 'OK' }]
    );
  };

  const handleShareMedicalHistory = () => {
    setPrivacySetting('shareMedicalHistory');
    setShowPrivacyModal(true);
  };

  const handleLocationSharingDuration = () => {
    setPrivacySetting('locationSharingDuration');
    setShowPrivacyModal(true);
  };

  const handleEmergencyContactAccess = () => {
    setPrivacySetting('emergencyContactAccess');
    setShowPrivacyModal(true);
  };

  const handleSaveContact = async () => {
    if (!user) return;
    
    if (!newContactData.name || !newContactData.phone) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    try {
      const result = await FamilyNetworkService.addContact(user.id, newContactData);
      if (result.success) {
        Alert.alert('Success', 'Contact added successfully!');
        setShowAddContactModal(false);
        await loadData();
      } else {
        Alert.alert('Error', 'Failed to add contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;
    
    try {
      const result = await FamilyNetworkService.updateContact(selectedContact.id, newContactData);
      if (result.success) {
        Alert.alert('Success', 'Contact updated successfully!');
        setShowEditContactModal(false);
        setSelectedContact(null);
        await loadData();
      } else {
        Alert.alert('Error', 'Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Error', 'Failed to update contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await FamilyNetworkService.deleteContact(contactId);
              if (result.success) {
                Alert.alert('Success', 'Contact deleted successfully!');
                await loadData();
              } else {
                Alert.alert('Error', 'Failed to delete contact');
              }
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact');
            }
          }
        }
      ]
    );
  };

  const handleToggleSetting = async (settingKey: keyof FamilySettings) => {
    try {
      const success = await FamilyNetworkService.updateSetting(settingKey, !familySettings[settingKey]);
      if (success) {
        setFamilySettings(prev => ({ ...prev, [settingKey]: !prev[settingKey] }));
      } else {
        Alert.alert('Error', 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error toggling setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handlePrivacySettingChange = async (value: string) => {
    try {
      let success = false;
      
      switch (privacySetting) {
        case 'shareMedicalHistory':
          success = await FamilyNetworkService.updateSetting('shareMedicalHistory', value as 'none' | 'limited' | 'full');
          break;
        case 'locationSharingDuration':
          success = await FamilyNetworkService.updateSetting('locationSharingDuration', parseInt(value));
          break;
        case 'emergencyContactAccess':
          success = await FamilyNetworkService.updateSetting('emergencyContactAccess', value as 'primary_only' | 'all_contacts');
          break;
      }
      
      if (success) {
        setFamilySettings(prev => ({ ...prev, [privacySetting]: value }));
        setShowPrivacyModal(false);
        Alert.alert('Success', 'Setting updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const quickActions = [
    { title: 'Test Emergency Alert', icon: <TestAlertIcon size={24} />, onPress: handleTestEmergencyAlert, type: 'danger' as const, delay: 1200 },
    { title: 'Add New Contact', icon: <AddContactIcon size={24} />, onPress: handleAddNewContact, type: 'primary' as const, delay: 1400 },
    { title: 'Edit Contact Details', icon: <EditContactIcon size={24} />, onPress: handleEditContactDetails, type: 'secondary' as const, delay: 1600 },
    { title: 'View Notification History', icon: <HistoryIcon size={24} />, onPress: handleViewNotificationHistory, type: 'secondary' as const, delay: 1800 },
  ];

  const settings = [
    { title: 'Daily Progress Updates', description: 'Send daily progress updates to family', value: familySettings.dailyProgressUpdates, onValueChange: () => handleToggleSetting('dailyProgressUpdates'), delay: 2000 },
    { title: 'Emergency Alerts Only', description: 'Only send emergency alerts', value: familySettings.emergencyAlertsOnly, onValueChange: () => handleToggleSetting('emergencyAlertsOnly'), delay: 2200 },
    { title: 'Voice Message Notifications', description: 'Send voice message notifications', value: familySettings.voiceMessageNotifications, onValueChange: () => handleToggleSetting('voiceMessageNotifications'), delay: 2400 },
    { title: 'Location Sharing', description: 'Share location with family members', value: familySettings.locationSharing, onValueChange: () => handleToggleSetting('locationSharing'), delay: 2600 },
    { title: 'Auto Share Location', description: 'Automatically share location during emergencies', value: familySettings.autoShareLocation, onValueChange: () => handleToggleSetting('autoShareLocation'), delay: 2800 },
    { title: 'Share Health Metrics', description: 'Include health metrics in updates', value: familySettings.shareHealthMetrics, onValueChange: () => handleToggleSetting('shareHealthMetrics'), delay: 3000 },
    { title: 'Share Nutrition Data', description: 'Include nutrition data in updates', value: familySettings.shareNutritionData, onValueChange: () => handleToggleSetting('shareNutritionData'), delay: 3200 },
    { title: 'Share Exercise Data', description: 'Include exercise data in updates', value: familySettings.shareExerciseData, onValueChange: () => handleToggleSetting('shareExerciseData'), delay: 3400 },
  ];

  const privacyControls = [
    { title: 'Share Medical History', description: 'What family can see', value: familySettings.shareMedicalHistory.charAt(0).toUpperCase() + familySettings.shareMedicalHistory.slice(1), onPress: handleShareMedicalHistory, delay: 3600 },
    { title: 'Location Sharing Duration', description: 'How long to share location', value: `${familySettings.locationSharingDuration} hours`, onPress: handleLocationSharingDuration, delay: 3800 },
    { title: 'Emergency Contact Access', description: 'Who can be contacted', value: familySettings.emergencyContactAccess === 'all_contacts' ? 'All contacts' : 'Primary only', onPress: handleEmergencyContactAccess, delay: 4000 },
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
          <Text style={styles.title}>Family Network</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Family Network Section */}
        <Animated.View style={[styles.familyNetworkSection, animatedHeaderStyle]}>
          <Text style={styles.sectionTitle}>Family Network</Text>
          {contacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              delay={600 + (index * 200)}
            />
          ))}
        </Animated.View>

        {/* Recent Notifications */}
        <Animated.View style={[styles.notificationsSection, animatedHeaderStyle]}>
          <Text style={styles.sectionTitle}>Recent Notifications Sent</Text>
          <View style={styles.notificationsCard}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <View key={notification.id} style={styles.notificationItem}>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.sent_at).toLocaleDateString()} {new Date(notification.sent_at).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationContact}>To: {notification.contact_name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No notifications sent yet</Text>
            )}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
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

        {/* Notification Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          {settings.map((setting, index) => (
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

        {/* Privacy Controls */}
        <View style={styles.privacySection}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>
          {privacyControls.map((control, index) => (
            <PrivacyControl
              key={index}
              title={control.title}
              description={control.description}
              value={control.value}
              onPress={control.onPress}
              delay={control.delay}
            />
          ))}
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddContactModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddContactModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddContactModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Contact</Text>
            <TouchableOpacity onPress={handleSaveContact}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.name}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, name: text }))}
                placeholder="Enter contact name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.relationship}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, relationship: text }))}
                placeholder="e.g., Husband, Mother, Doctor"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.phone}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, phone: text }))}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.email}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, email: text }))}
                placeholder="contact@example.com"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Type</Text>
              <View style={styles.radioGroup}>
                {['primary', 'secondary', 'emergency'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.radioButton}
                    onPress={() => setNewContactData(prev => ({ ...prev, type: type as any }))}
                  >
                    <View style={[
                      styles.radioCircle,
                      newContactData.type === type && styles.radioCircleSelected
                    ]}>
                      {newContactData.type === type && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Permissions</Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Can receive updates</Text>
                  <Switch
                    value={newContactData.can_receive_updates}
                    onValueChange={(value) => setNewContactData(prev => ({ ...prev, can_receive_updates: value }))}
                  />
                </View>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Can receive emergency alerts</Text>
                  <Switch
                    value={newContactData.can_receive_emergency_alerts}
                    onValueChange={(value) => setNewContactData(prev => ({ ...prev, can_receive_emergency_alerts: value }))}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        visible={showEditContactModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditContactModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditContactModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Contact</Text>
            <View style={styles.modalHeaderRight}>
              <TouchableOpacity onPress={() => selectedContact && handleDeleteContact(selectedContact.id)}>
                <Text style={styles.modalDeleteButton}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateContact}>
                <Text style={styles.modalSaveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.name}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, name: text }))}
                placeholder="Enter contact name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.relationship}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, relationship: text }))}
                placeholder="e.g., Husband, Mother, Doctor"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.phone}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, phone: text }))}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={newContactData.email}
                onChangeText={(text) => setNewContactData(prev => ({ ...prev, email: text }))}
                placeholder="contact@example.com"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Type</Text>
              <View style={styles.radioGroup}>
                {['primary', 'secondary', 'emergency'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.radioButton}
                    onPress={() => setNewContactData(prev => ({ ...prev, type: type as any }))}
                  >
                    <View style={[
                      styles.radioCircle,
                      newContactData.type === type && styles.radioCircleSelected
                    ]}>
                      {newContactData.type === type && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Permissions</Text>
              <View style={styles.switchGroup}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Can receive updates</Text>
                  <Switch
                    value={newContactData.can_receive_updates}
                    onValueChange={(value) => setNewContactData(prev => ({ ...prev, can_receive_updates: value }))}
                  />
                </View>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Can receive emergency alerts</Text>
                  <Switch
                    value={newContactData.can_receive_emergency_alerts}
                    onValueChange={(value) => setNewContactData(prev => ({ ...prev, can_receive_emergency_alerts: value }))}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Settings Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy Settings</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {privacySetting === 'shareMedicalHistory' && (
              <View>
                <Text style={styles.modalSubtitle}>Share Medical History</Text>
                <Text style={styles.modalDescription}>Choose what medical information family members can see:</Text>
                {['none', 'limited', 'full'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.privacyOption}
                    onPress={() => handlePrivacySettingChange(option)}
                  >
                    <Text style={styles.privacyOptionText}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
                    <Text style={styles.privacyOptionDescription}>
                      {option === 'none' && 'No medical information shared'}
                      {option === 'limited' && 'Basic health status only'}
                      {option === 'full' && 'Complete medical history'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {privacySetting === 'locationSharingDuration' && (
              <View>
                <Text style={styles.modalSubtitle}>Location Sharing Duration</Text>
                <Text style={styles.modalDescription}>How long should location be shared:</Text>
                {[1, 6, 12, 24, 48, 72].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={styles.privacyOption}
                    onPress={() => handlePrivacySettingChange(hours.toString())}
                  >
                    <Text style={styles.privacyOptionText}>{hours} hours</Text>
                    <Text style={styles.privacyOptionDescription}>
                      {hours === 1 && 'Very short term sharing'}
                      {hours === 6 && 'Short term sharing'}
                      {hours === 12 && 'Half day sharing'}
                      {hours === 24 && 'Full day sharing'}
                      {hours === 48 && 'Two day sharing'}
                      {hours === 72 && 'Three day sharing'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {privacySetting === 'emergencyContactAccess' && (
              <View>
                <Text style={styles.modalSubtitle}>Emergency Contact Access</Text>
                <Text style={styles.modalDescription}>Who can be contacted during emergencies:</Text>
                {['primary_only', 'all_contacts'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.privacyOption}
                    onPress={() => handlePrivacySettingChange(option)}
                  >
                    <Text style={styles.privacyOptionText}>
                      {option === 'primary_only' ? 'Primary contacts only' : 'All contacts'}
                    </Text>
                    <Text style={styles.privacyOptionDescription}>
                      {option === 'primary_only' && 'Only primary contacts will be notified'}
                      {option === 'all_contacts' && 'All family contacts will be notified'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  familyNetworkSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
  },
  notificationsSection: {
    marginBottom: 24,
  },
  notificationsCard: {
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
  notificationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  notificationTime: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
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
  dangerActionButton: {
    backgroundColor: Colors.danger,
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
  settingsSection: {
    marginBottom: 24,
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
  privacySection: {
    marginBottom: 24,
  },
  privacyControl: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  privacyControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  privacyContent: {
    flex: 1,
    marginRight: 16,
  },
  privacyTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
  privacyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyValueText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    marginRight: 8,
  },
  privacyArrow: {
    fontSize: Typography.sizes.lg,
    color: Colors.textMuted,
  },
  emptyStateText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    padding: 20,
  },
  notificationContact: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.bodyMedium,
    color: Colors.primary,
    marginTop: 4,
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
  modalHeaderRight: {
    flexDirection: 'row',
    gap: 16,
  },
  modalCloseButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  modalSaveButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
  },
  modalDeleteButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.danger,
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
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginBottom: 20,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
  },
  switchGroup: {
    gap: 12,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  privacyOption: {
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginBottom: 12,
  },
  privacyOptionText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  privacyOptionDescription: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
  },
});
