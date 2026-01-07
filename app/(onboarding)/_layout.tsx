import { useAuthStore } from '@/lib/stores/auth-store';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
