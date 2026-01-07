import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { signInWithApple, signInWithGoogle } from '@/lib/auth/oauth';
import { useAuth } from '@/lib/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, PressableFeedback, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor('foreground');
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        Alert.alert('Thành công', 'Vui lòng kiểm tra email để xác nhận tài khoản');
      } else {
        await signInWithEmail(email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsSocialLoading(true);
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (!error.message?.includes('hủy')) {
        Alert.alert('Lỗi', error.message || 'Đăng nhập thất bại');
      }
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSocialLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (!error.message?.includes('hủy')) {
        Alert.alert('Lỗi', error.message || 'Đăng nhập thất bại');
      }
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-6 justify-between" style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}>
        {/* Header */}
        <View>
          <Button
            variant="secondary"
            className="w-12 h-12 rounded-full p-0"
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={foreground} />
          </Button>

          <View className="mt-8">
            <View className="w-16 h-16 bg-accent/10 items-center justify-center rounded-2xl mb-6 border border-accent/20">
              <IconSymbol name="person.3.fill" size={32} color={accent} />
            </View>

            <AppText className="text-3xl font-bold text-foreground mb-2">
              {isSignUp ? 'Tạo tài khoản' : 'Chào mừng bạn!'}
            </AppText>
            <AppText className="text-base text-muted leading-relaxed">
              {isSignUp
                ? 'Đăng ký để bắt đầu chia tiền cùng bạn bè.'
                : 'Đăng nhập để đồng bộ dữ liệu chi tiêu.'}
            </AppText>
          </View>
        </View>

        {/* Form */}
        <View className="gap-4 my-6">
          {isSignUp && (
            <TextField className="bg-surface border border-divider/10 rounded-2xl h-14 px-4">
              <TextField.Label>Tên của bạn</TextField.Label>
              <TextField.Input
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên"
                autoCapitalize="words"
              />
            </TextField>
          )}

          <TextField className="bg-surface border border-divider/10 rounded-2xl h-14 px-4">
            <TextField.Label>Email</TextField.Label>
            <TextField.Input
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </TextField>

          <TextField className="bg-surface border border-divider/10 rounded-2xl h-14 px-4">
            <TextField.Label>Mật khẩu</TextField.Label>
            <TextField.Input
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </TextField>

          <Button
            size="lg"
            className="h-14 rounded-2xl bg-accent shadow-lg shadow-accent/20"
            onPress={handleEmailAuth}
            isDisabled={isLoading}
          >
            <Button.Label className="text-lg font-bold text-white">
              {isLoading ? 'Đang xử lý...' : isSignUp ? 'Đăng ký' : 'Đăng nhập'}
            </Button.Label>
          </Button>

          <PressableFeedback onPress={() => setIsSignUp(!isSignUp)} className="items-center py-2">
            <AppText className="text-muted">
              {isSignUp ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
              <AppText className="text-accent font-semibold">
                {isSignUp ? 'Đăng nhập' : 'Đăng ký'}
              </AppText>
            </AppText>
          </PressableFeedback>
        </View>

        {/* Social Logins */}
        <View className="gap-4">
          <View className="flex-row items-center gap-4">
            <View className="flex-1 h-px bg-divider/20" />
            <AppText className="text-muted text-sm">hoặc</AppText>
            <View className="flex-1 h-px bg-divider/20" />
          </View>

          <Button
            className="h-14 rounded-2xl bg-black dark:bg-white"
            onPress={handleAppleLogin}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="logo-apple" size={20} color={background} />
              <Button.Label className="font-bold" style={{ color: background }}>
                Tiếp tục với Apple
              </Button.Label>
            </View>
          </Button>

          <Button
            variant="secondary"
            className="h-14 rounded-2xl border border-divider/10"
            onPress={handleGoogleLogin}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="logo-google" size={20} color={foreground} />
              <Button.Label className="font-bold">Tiếp tục với Google</Button.Label>
            </View>
          </Button>

          {/* Footer */}
          <View className="mt-4 items-center">
            <AppText className="text-[10px] text-muted/60 text-center px-8 leading-4">
              Bằng cách tiếp tục, bạn đồng ý với{' '}
              <AppText className="text-accent">Điều khoản dịch vụ</AppText> và{' '}
              <AppText className="text-accent">Chính sách bảo mật</AppText>.
            </AppText>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
