import { signInWithGoogle } from '@/lib/auth/oauth';
import { useTranslation } from '@/lib/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomSheet, Button, Separator, useThemeColor, useToast } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../app-text';
import { IconSymbol } from '../ui/icon-symbol';

interface LoginBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * LoginBottomSheet component provides authentication options.
 * Uses HeroUI Native BottomSheet for a premium mobile experience.
 */
export const LoginBottomSheet = ({ isOpen, onOpenChange }: LoginBottomSheetProps) => {
  const { t } = useTranslation();
  const foreground = useThemeColor('foreground');
  const danger = useThemeColor('danger');
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (!error.message?.includes('hủy') && !error.message?.includes('cancel')) {
        toast.show({
          label: error.message || t('onboarding.login.google_fail'),
          variant: 'danger',
          icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: signInWithApple — enable after Apple Developer Program enrollment
  const handleAppleLogin = async () => {
    toast.show({
      label: 'Apple Sign-In chưa khả dụng',
      variant: 'warning',
    });
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
            {/* TODO: Enable after Apple Developer Program enrollment */}
            {/* <Button
              size="lg"
              className="bg-black dark:bg-white"
              onPress={handleAppleLogin}
              isDisabled={isLoading}
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
            </Button> */}

            <Button
              variant="secondary"
              size="lg"
              onPress={handleGoogleLogin}
              isDisabled={isLoading}
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
