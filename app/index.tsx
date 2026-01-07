import { useAuthStore } from '@/lib/stores/auth-store';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Tránh nhấp nháy UI trong lúc đang load session
  if (isLoading) {
    return null; 
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
