import { AppThemeProvider } from '@/contexts/app-theme-context';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
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

export const unstable_settings = {
  anchor: '(tabs)',
};

const config: HeroUINativeConfig = {
  // Global text configuration
  textProps: {
    minimumFontScale: 0.5,
    maxFontSizeMultiplier: 1.5,
    allowFontScaling: true,
    adjustsFontSizeToFit: false,
  },
  // Global toast configuration
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

function AppContent() {
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
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="group/[id]/index" />
          <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
        </Stack>
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
      <KeyboardProvider>
        <AppThemeProvider>
          <AppContent />
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
