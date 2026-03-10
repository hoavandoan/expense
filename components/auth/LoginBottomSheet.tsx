import { useAuth, useTranslation } from '@/lib/hooks';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet, Button, Separator, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../app-text';

interface LoginBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * LoginBottomSheet component provides authentication options via Google and Apple.
 * It uses HeroUI Native BottomSheet for a premium mobile experience.
 */
export const LoginBottomSheet = ({ isOpen, onOpenChange }: LoginBottomSheetProps) => {
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const background = useThemeColor('background');
  const foreground = useThemeColor('foreground');
  const insets = useSafeAreaInsets();

  const handleAppleLogin = () => {
    // Mock login for demo
    setUser({
      id: 'mock-apple-id',
      name: 'Apple User',
      email: 'apple@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=apple',
      createdAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  const handleGoogleLogin = () => {
    // Mock login for demo
    setUser({
      id: 'mock-google-id',
      name: 'Google User',
      email: 'google@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=google',
      createdAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        {/*<BottomSheetBlurOverlay />*/}
        <BottomSheet.Overlay/>
        <BottomSheet.Content
          detached={true}
          className="mx-4"
          backgroundClassName="rounded-3xl"
          handleIndicatorClassName="bg-border/20 w-12"
          bottomInset={insets.bottom}
        >
          {/* Header */}
          <View className="items-center mb-8 mt-4">
            <AppText className="text-black text-2xl font-bold mb-2">{t('auth.login.welcome')}</AppText>
            <AppText className="text-muted text-center px-4">
              {t('auth.login.description')}
            </AppText>
          </View>

          {/* Login Options */}
          <View className="gap-4">
            <Button
              size="lg"
              className="bg-black dark:bg-white"
              onPress={handleAppleLogin}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="logo-apple"
                  size={22}
                  color={'#FFFFFF'}
                />
                <Button.Label
                  className="font-bold text-[17px]"
                  style={{ color: '#FFFFFF' }}
                >
                  {t('auth.login.continue_with_apple')}
                </Button.Label>
              </View>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onPress={handleGoogleLogin}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="logo-google" size={20} color={foreground} />
                <Button.Label className="font-bold text-[17px]">
                  {t('auth.login.continue_with_google')}
                </Button.Label>
              </View>
            </Button>
          </View>

          {/* Footer Info */}
          <View className="mt-10 items-center">
            <Separator className="w-12 mb-6 opacity-30" />
            <AppText className="text-[11px] text-muted/50 text-center px-10 leading-4">
              {t('auth.login.terms_agreement')}
            </AppText>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
