import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_bottom',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="timeline-preview" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="sms-demo" />
        <Stack.Screen name="sms-registration" />
        <Stack.Screen name="smart-alert" />
        <Stack.Screen name="recovery-timeline" />
        <Stack.Screen name="asha-worker" />
        <Stack.Screen name="family-network" />
        <Stack.Screen name="child-care" />
        <Stack.Screen name="anonymous-questions" />
        <Stack.Screen name="mother-health" />
        <Stack.Screen name="multilingual-settings" />
      </Stack>
    </AuthProvider>
  );
}
