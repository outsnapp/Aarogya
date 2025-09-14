import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert, PanResponder, Dimensions } from 'react-native';
import { Colors, Typography } from '../constants/Colors';
import { MotherHealthService, DailyCheckIn as MotherCheckIn } from '../lib/motherHealthService';
import { ChildCareService, DailyCheckIn as BabyCheckIn } from '../lib/childCareService';

interface DailyCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'mother' | 'baby';
  userId: string;
  babyId?: string;
  onSuccess?: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  visible,
  onClose,
  type,
  userId,
  babyId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [motherData, setMotherData] = useState({
    overall_wellbeing: 7,
    mood: 'good',
    energy_level: 7,
    sleep_quality: 7,
    appetite: 7,
    pain_level: 3,
    stress_level: 4,
    symptoms: [] as string[],
    concerns: '',
    goals_achieved: [] as string[],
    notes: ''
  });

  const [babyData, setBabyData] = useState({
    temperature: 98.6,
    weight: 0,
    height: 0,
    head_circumference: 0,
    feeding_count: 6,
    sleep_hours: 14,
    mood_score: 8,
    activity_level: 7,
    diaper_changes: 6,
    concerns: '',
    notes: ''
  });

  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  useEffect(() => {
    if (visible) {
      checkTodayStatus();
    }
  }, [visible, userId, babyId]);

  const checkTodayStatus = async () => {
    try {
      if (type === 'mother') {
        const status = await MotherHealthService.getTodaysCheckInStatus(userId);
        setHasCheckedInToday(status);
      } else if (type === 'baby' && babyId) {
        const checkIn = await ChildCareService.getTodaysCheckIn(babyId);
        setHasCheckedInToday(!!checkIn);
      }
    } catch (error) {
      console.error('Error checking today status:', error);
    }
  };

  const handleSave = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (type === 'mother') {
        const checkInData: Omit<MotherCheckIn, 'id' | 'created_at'> = {
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          ...motherData
        };

        await MotherHealthService.saveDailyCheckIn(checkInData);
        Alert.alert('Success', 'Your daily check-in has been saved!');
      } else if (type === 'baby' && babyId) {
        const checkInData: BabyCheckIn = {
          baby_id: babyId,
          checkin_date: new Date().toISOString().split('T')[0],
          ...babyData
        };

        const result = await ChildCareService.saveDailyCheckIn(checkInData);
        if (result.success) {
          Alert.alert('Success', 'Baby\'s daily check-in has been saved!');
        } else {
          Alert.alert('Error', 'Failed to save baby check-in');
        }
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving check-in:', error);
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSlider = (
    label: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number = 1,
    max: number = 10,
    unit: string = ''
  ) => {
    const sliderWidth = Dimensions.get('window').width - 104; // Account for padding and min/max labels
    
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Handle initial touch
        handleSliderTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        // Handle drag
        handleSliderTouch(evt.nativeEvent.locationX);
      },
    });

    const handleSliderTouch = (locationX: number) => {
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const newValue = Math.round(min + percentage * (max - min));
      onValueChange(newValue);
    };

    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderMin}>{min}{unit}</Text>
          <View style={styles.sliderTrack} {...panResponder.panHandlers}>
            <View style={[styles.sliderFill, { width: `${((value - min) / (max - min)) * 100}%` }]} />
            <View style={[styles.sliderThumb, { left: `${((value - min) / (max - min)) * 100}%` }]} />
          </View>
          <Text style={styles.sliderMax}>{max}{unit}</Text>
        </View>
        <Text style={styles.sliderValue}>{value}{unit}</Text>
      </View>
    );
  };

  const renderMotherForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.sectionTitle}>How are you feeling today?</Text>
      
      {renderSlider('Overall Wellbeing', motherData.overall_wellbeing, (value) => 
        setMotherData(prev => ({ ...prev, overall_wellbeing: value }))
      )}
      
      {renderSlider('Energy Level', motherData.energy_level, (value) => 
        setMotherData(prev => ({ ...prev, energy_level: value }))
      )}
      
      {renderSlider('Sleep Quality', motherData.sleep_quality, (value) => 
        setMotherData(prev => ({ ...prev, sleep_quality: value }))
      )}
      
      {renderSlider('Appetite', motherData.appetite, (value) => 
        setMotherData(prev => ({ ...prev, appetite: value }))
      )}
      
      {renderSlider('Pain Level', motherData.pain_level, (value) => 
        setMotherData(prev => ({ ...prev, pain_level: value }))
      )}
      
      {renderSlider('Stress Level', motherData.stress_level, (value) => 
        setMotherData(prev => ({ ...prev, stress_level: value }))
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mood</Text>
        <View style={styles.moodButtons}>
          {['excellent', 'good', 'okay', 'poor', 'terrible'].map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodButton,
                motherData.mood === mood && styles.moodButtonSelected
              ]}
              onPress={() => setMotherData(prev => ({ ...prev, mood }))}
            >
              <Text style={[
                styles.moodButtonText,
                motherData.mood === mood && styles.moodButtonTextSelected
              ]}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Any concerns or notes?</Text>
        <TextInput
          style={styles.textArea}
          value={motherData.notes}
          onChangeText={(text) => setMotherData(prev => ({ ...prev, notes: text }))}
          placeholder="How are you feeling? Any symptoms or concerns?"
          multiline
          numberOfLines={3}
        />
      </View>
    </ScrollView>
  );

  const renderBabyForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Baby's Daily Check-in</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Temperature (°F)</Text>
        <TextInput
          style={styles.numberInput}
          value={babyData.temperature.toString()}
          onChangeText={(text) => setBabyData(prev => ({ ...prev, temperature: parseFloat(text) || 98.6 }))}
          keyboardType="numeric"
          placeholder="98.6"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.numberInput}
            value={babyData.weight.toString()}
            onChangeText={(text) => setBabyData(prev => ({ ...prev, weight: parseFloat(text) || 0 }))}
            keyboardType="numeric"
            placeholder="3.5"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Height (cm)</Text>
          <TextInput
            style={styles.numberInput}
            value={babyData.height.toString()}
            onChangeText={(text) => setBabyData(prev => ({ ...prev, height: parseFloat(text) || 0 }))}
            keyboardType="numeric"
            placeholder="50"
          />
        </View>
      </View>

      {renderSlider('Feeding Count', babyData.feeding_count, (value) => 
        setBabyData(prev => ({ ...prev, feeding_count: value })), 0, 12
      )}
      
      {renderSlider('Sleep Hours', babyData.sleep_hours, (value) => 
        setBabyData(prev => ({ ...prev, sleep_hours: value })), 8, 20, 'h'
      )}
      
      {renderSlider('Mood Score', babyData.mood_score, (value) => 
        setBabyData(prev => ({ ...prev, mood_score: value }))
      )}
      
      {renderSlider('Activity Level', babyData.activity_level, (value) => 
        setBabyData(prev => ({ ...prev, activity_level: value }))
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Diaper Changes</Text>
        <TextInput
          style={styles.numberInput}
          value={babyData.diaper_changes.toString()}
          onChangeText={(text) => setBabyData(prev => ({ ...prev, diaper_changes: parseInt(text) || 0 }))}
          keyboardType="numeric"
          placeholder="6"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Any concerns or notes?</Text>
        <TextInput
          style={styles.textArea}
          value={babyData.notes}
          onChangeText={(text) => setBabyData(prev => ({ ...prev, notes: text }))}
          placeholder="How is baby doing? Any concerns?"
          multiline
          numberOfLines={3}
        />
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {type === 'mother' ? 'Daily Health Check-in' : 'Baby Daily Check-in'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {hasCheckedInToday && (
          <View style={styles.alreadyCheckedIn}>
            <Text style={styles.alreadyCheckedInText}>
              ✅ You've already checked in today!
            </Text>
          </View>
        )}

        {type === 'mother' ? renderMotherForm() : renderBabyForm()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  cancelButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
  },
  saveButton: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
  },
  saveButtonDisabled: {
    color: Colors.textMuted,
  },
  alreadyCheckedIn: {
    backgroundColor: Colors.success + '20',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  alreadyCheckedInText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodyMedium,
    color: Colors.success,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderMin: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    width: 30,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
    marginHorizontal: 12,
    position: 'relative',
    paddingVertical: 10, // Increase touch area
  },
  sliderFill: {
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    position: 'absolute',
    top: 10,
  },
  sliderThumb: {
    position: 'absolute',
    top: 4,
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.background,
    marginLeft: -10,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderMax: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    width: 30,
    textAlign: 'right',
  },
  sliderValue: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodySemiBold,
    color: Colors.primary,
    textAlign: 'center',
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
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  numberInput: {
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
  textArea: {
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  moodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
  },
  moodButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  moodButtonText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  moodButtonTextSelected: {
    color: Colors.background,
  },
});
