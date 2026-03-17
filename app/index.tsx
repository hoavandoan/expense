import { useAuth } from '@/contexts/auth-context';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();

  // Tránh nhấp nháy UI trong lúc đang load session
  if (isLoading) {
    return null;
  }

  // Đã đăng nhập → vào Home
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Đã hoàn thành onboarding nhưng chưa login → vào Login
  if (hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/login" />;
  }

  // Chưa onboarding → vào Welcome
  return <Redirect href="/(onboarding)/welcome" />;
}
