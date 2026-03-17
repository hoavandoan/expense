import { LoginBottomSheet } from "@/components/auth/LoginBottomSheet";
import { ErrorBoundary } from "@/components/error-boundary";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { PendingSyncBadge } from "@/components/ui/pending-sync-badge";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { setupOnlineManager } from "@/lib/hooks/use-network-status";
import { asyncStoragePersister } from "@/lib/query-persister";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from "@expo-google-fonts/ibm-plex-sans";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  KeyboardProvider,
} from "react-native-keyboard-controller";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "./global.css";

// Sync TanStack Query online status with real device network
setupOnlineManager();

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const config: HeroUINativeConfig = {
  textProps: {
    minimumFontScale: 0.5,
    maxFontSizeMultiplier: 1.5,
    allowFontScaling: true,
    adjustsFontSizeToFit: false,
  },
};

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours — keep cache for offline
      networkMode: 'offlineFirst',
      retry: 2,
    },
  },
});

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours


function AppContent() {
  const { isLoginSheetOpen, setLoginSheetOpen } = useAuth();
  const insets = useSafeAreaInsets();

  const contentWrapper = useCallback(
    (children: React.ReactNode) => (
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        className="flex-1 items-center justify-start"
      >
        <View className="w-full max-w-[500px]" pointerEvents="box-none">
          {children}
        </View>
      </KeyboardAvoidingView>
    ),
    []
  );

  return (
    <HeroUINativeProvider
      config={{
        ...config,
        toast: {
          defaultProps: {
            placement: "top",
          },
          insets: {
            top: insets.top > 0 ? insets.top + 8 : 48,
            bottom: insets.bottom > 0 ? insets.bottom + 12 : 40,
            left: 16,
            right: 16,
          },
          maxVisibleToasts: 5,
          contentWrapper,
        },
      }}
    >
      <OfflineBanner />
      <PendingSyncBadge />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="group/[id]/index" />
        <Stack.Screen name="(modal)" options={{ presentation: "modal" }} />
      </Stack>
      <LoginBottomSheet
        isOpen={isLoginSheetOpen}
        onOpenChange={setLoginSheetOpen}
      />
    </HeroUINativeProvider>
  );
}

export default function RootLayout() {
  const fonts = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });

  if (!fonts) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister, maxAge: PERSIST_MAX_AGE }}
          >
            <AuthProvider>
              <KeyboardProvider>
                <AppThemeProvider>
                  <AppContent />
                </AppThemeProvider>
              </KeyboardProvider>
            </AuthProvider>
          </PersistQueryClientProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
