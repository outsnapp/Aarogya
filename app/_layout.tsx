import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="timeline-preview" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="voice-checkin" />
      <Stack.Screen name="smart-alert" />
      <Stack.Screen name="recovery-timeline" />
    </Stack>
  );
}
