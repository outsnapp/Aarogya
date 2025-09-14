import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { Colors, Typography } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  preferred_language: string;
  voice_sms_consent: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    loadProfileData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
  };

  const loadProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
        return;
      }

      setProfileData(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(currentValue?.toString() || '');
    setEditModalVisible(true);
  };

  const handleSaveField = async () => {
    if (!profileData || !user) return;

    try {
      setSaving(true);
      
      const updates: any = {};
      updates[editingField] = editValue;

      // Convert numeric fields
      if (editingField === 'height_cm' || editingField === 'weight_kg') {
        updates[editingField] = parseFloat(editValue) || 0;
      }

      // Recalculate BMI if height or weight changed
      if (editingField === 'height_cm' || editingField === 'weight_kg') {
        const height = editingField === 'height_cm' ? parseFloat(editValue) : profileData.height_cm;
        const weight = editingField === 'weight_kg' ? parseFloat(editValue) : profileData.weight_kg;
        if (height > 0 && weight > 0) {
          updates.bmi = weight / Math.pow(height / 100, 2);
        }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      // Update local state
      setProfileData(prev => prev ? { ...prev, ...updates } : null);
      setEditModalVisible(false);
      setEditingField('');
      setEditValue('');
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              buttonScale.value = withSpring(0.95);
              const { error } = await signOut();
              
              if (error) {
                console.log('Sign out error (handled):', error);
                // Even if there's an error, we should still navigate to login
                // since the local state has been cleared
              }
              
              // Always navigate to login screen
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error signing out:', error);
              // Even if there's an error, navigate to login
              router.replace('/auth/login');
            } finally {
              buttonScale.value = withSpring(1);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      full_name: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      date_of_birth: 'Date of Birth',
      height_cm: 'Height (cm)',
      weight_kg: 'Weight (kg)',
      bmi: 'BMI',
      preferred_language: 'Preferred Language',
    };
    return labels[field] || field;
  };

  const getFieldValue = (field: string, value: any) => {
    if (field === 'date_of_birth') return formatDate(value);
    if (field === 'bmi') return value ? value.toFixed(1) : 'Not calculated';
    if (field === 'voice_sms_consent') return value ? 'Yes' : 'No';
    return value?.toString() || 'Not set';
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: withTiming(headerOpacity.value ? 0 : -20, { duration: 600 }) }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: withTiming(contentOpacity.value ? 0 : 20, { duration: 600 }) }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.errorTitle}>Profile Not Found</Text>
          <Text style={styles.errorText}>Unable to load your profile data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const editableFields = ['full_name', 'phone', 'height_cm', 'weight_kg', 'preferred_language'];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      {/* Header */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedContentStyle]}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profileData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            <Text style={styles.profileName}>{profileData.full_name || 'User'}</Text>
            <Text style={styles.profileEmail}>{profileData.email}</Text>
          </View>

          {/* Profile Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {Object.entries(profileData).map(([field, value]) => {
              if (field === 'id' || field === 'created_at' || field === 'updated_at') return null;
              
              const isEditable = editableFields.includes(field);
              
              return (
                <View key={field} style={styles.detailRow}>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>{getFieldLabel(field)}</Text>
                    <Text style={styles.detailValue}>{getFieldValue(field, value)}</Text>
                  </View>
                  {isEditable && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditField(field, value)}
                    >
                      <Ionicons name="pencil" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Sign Out Button */}
          <Animated.View style={[styles.signOutSection, animatedButtonStyle]}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {getFieldLabel(editingField)}</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${getFieldLabel(editingField).toLowerCase()}`}
              keyboardType={editingField.includes('height') || editingField.includes('weight') ? 'numeric' : 'default'}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveField}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.textLight} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.bodyMedium,
    color: Colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.textLight,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontFamily: Typography.heading,
    color: Colors.textLight,
  },
  profileName: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textMuted,
  },
  detailsSection: {
    backgroundColor: Colors.textLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textMuted,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
  },
  editButton: {
    padding: 8,
  },
  signOutSection: {
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.bodyMedium,
    color: Colors.danger,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.textLight,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.textMuted,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.textMuted,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.bodyMedium,
    color: Colors.textLight,
  },
});
