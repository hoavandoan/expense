import { useAuth } from '@/contexts/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet, Button, Divider, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../app-text';
import { BottomSheetBlurOverlay } from '../bottom-sheet-blur-overlay';

interface LoginBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * LoginBottomSheet component provides authentication options via Google and Apple.
 * It uses HeroUI Native BottomSheet for a premium mobile experience.
 */
export const LoginBottomSheet = ({ isOpen, onOpenChange }: LoginBottomSheetProps) => {
  const { login } = useAuth();
  const background = useThemeColor('background');
  const foreground = useThemeColor('foreground');
  const insets = useSafeAreaInsets();

  const handleAppleLogin = () => {
    // Mock login for demo
    login({
      name: 'Apple User',
      email: 'apple@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=apple',
    });
    onOpenChange(false);
  };

  const handleGoogleLogin = () => {
    // Mock login for demo
    login({
      name: 'Google User',
      email: 'google@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=google',
    });
    onOpenChange(false);
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheetBlurOverlay />
        <BottomSheet.Content
          detached={true}
          className="mx-4"
          backgroundClassName="rounded-3xl"
          handleIndicatorClassName="bg-divider/20 w-12"
          bottomInset={insets.bottom}
        >
          {/* Header */}
          <View className="items-center mb-8 mt-4">
            <AppText className="text-black text-2xl font-bold mb-2">Chào mừng bạn!</AppText>
            <AppText className="text-muted text-center px-4">
              Đăng nhập để đồng bộ dữ liệu chi tiêu và kết nối cùng bạn bè.
            </AppText>
          </View>

          {/* Login Options */}
          <View className="gap-4">
            <Button
              className="w-full h-14 rounded-2xl bg-black dark:bg-white"
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
                  Tiếp tục với Apple
                </Button.Label>
              </View>
            </Button>

            <Button
              variant="secondary"
              className="w-full h-14 rounded-2xl border border-black/10 bg-surface/5"
              onPress={handleGoogleLogin}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="logo-google" size={20} color={foreground} />
                <Button.Label className="font-bold text-[17px]">
                  Tiếp tục với Google
                </Button.Label>
              </View>
            </Button>
          </View>

          {/* Footer Info */}
          <View className="mt-10 items-center">
            <Divider className="w-12 mb-6 opacity-30" />
            <AppText className="text-[11px] text-muted/50 text-center px-10 leading-4">
              Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
            </AppText>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
