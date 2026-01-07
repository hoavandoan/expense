import { LoginBottomSheet } from '@/components/auth/LoginBottomSheet';
import { ErrorBoundary } from '@/components/error-boundary';
import { AppThemeProvider } from '@/contexts/app-theme-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useAuth as useSupabaseAuth } from '@/lib/hooks';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { HeroUINativeConfig, HeroUINativeProvider } from 'heroui-native';
import { useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import './global.css';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

const config: HeroUINativeConfig = {
  textProps: {
    minimumFontScale: 0.5,
    maxFontSizeMultiplier: 1.5,
    allowFontScaling: true,
    adjustsFontSizeToFit: false,
  },
  toast: {
    defaultProps: {
      variant: 'default',
      placement: 'top',
    },
    insets: {
      top: 0,
      bottom: 6,
      left: 12,
      right: 12,
    },
    maxVisibleToasts: 3,
  },
};

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function AuthListener() {
  // This hook sets up auth state listener on mount
  useSupabaseAuth();
  return null;
}

function AppContent() {
  const { isLoginSheetOpen, setLoginSheetOpen } = useAuth();
  const contentWrapper = useCallback(
    (children: React.ReactNode) => (
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior="padding"
        keyboardVerticalOffset={12}
        className="flex-1"
      >
        {children}
      </KeyboardAvoidingView>
    ),
    []
  );

  return (
    <>
      <AuthListener />
      <HeroUINativeProvider
        config={{
          ...config,
          toast: {
            ...config.toast,
            contentWrapper,
          },
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="group/[id]/index" />
          <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
        </Stack>
        <LoginBottomSheet isOpen={isLoginSheetOpen} onOpenChange={setLoginSheetOpen} />
      </HeroUINativeProvider>
    </>
  );
}

export default function RootLayout() {
  const fonts = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fonts) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <AppThemeProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </AppThemeProvider>
          </KeyboardProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
