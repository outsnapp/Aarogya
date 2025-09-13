import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography } from '../constants/Colors';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <View style={styles.content}>
        <Text style={styles.title}>AI Recovery Dashboard</Text>
        <Text style={styles.subtitle}>
          This will be Screen 3 - AI Recovery Dashboard
        </Text>
        <Text style={styles.description}>
          Personalized AI insights and recovery progress with smart predictions.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.heading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.bodyMedium,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
});
