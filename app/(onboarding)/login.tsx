import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Divider, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, setLoginSheetOpen } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor('foreground');
  const accent = useThemeColor('accent');

  const handleAppleLogin = () => {
    login({
      name: 'Apple User',
      email: 'apple@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=apple',
    });
    // Navigation will be handled by the layout (switching to tabs if logged in)
  };

  const handleGoogleLogin = () => {
    login({
      name: 'Google User',
      email: 'google@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=google',
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-12 pb-8 justify-between">
      <View style={{ paddingTop: insets.top }}>
        <Button
          variant="secondary"
          className="w-12 h-12 rounded-full p-0"
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={foreground} />
        </Button>

        <View className="mt-12">
          <View className="w-20 h-20 bg-accent/10 items-center justify-center rounded-3xl mb-8">
            <IconSymbol name="person.3.fill" size={40} color={accent} />
          </View>

          <AppText className="text-4xl font-bold text-foreground mb-4">Chào mừng bạn!</AppText>
          <AppText className="text-lg text-muted leading-relaxed">
            Đăng nhập để đồng bộ dữ liệu chi tiêu và kết nối cùng bạn bè trong các nhóm chia tiền.
          </AppText>
        </View>
      </View>

      <View style={{ marginBottom: insets.bottom }}>
        {/* Login Options */}
        <View className="gap-4">
          <Button
            className="w-full h-16 rounded-2xl bg-black dark:bg-white"
            onPress={handleAppleLogin}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="logo-apple"
                size={22}
                color={useThemeColor('background')}
              />
              <Button.Label
                className="font-bold text-lg"
                style={{ color: useThemeColor('background') }}
              >
                Tiếp tục với Apple
              </Button.Label>
            </View>
          </Button>

          <Button
            variant="secondary"
            className="w-full h-16 rounded-2xl border border-divider shadow-sm"
            onPress={handleGoogleLogin}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="logo-google" size={22} color={foreground} />
              <Button.Label className="font-bold text-lg">
                Tiếp tục với Google
              </Button.Label>
            </View>
          </Button>
        </View>

        {/* Footer Info */}
        <View className="mt-12 items-center">
          <Divider className="w-12 mb-6 opacity-30" />
          <AppText className="text-xs text-muted/60 text-center px-10 leading-5">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <AppText className="text-accent font-medium">Điều khoản dịch vụ</AppText> và{' '}
            <AppText className="text-accent font-medium">Chính sách bảo mật</AppText> của chúng tôi.
          </AppText>
        </View>
      </View>
    </View>
  );
}
