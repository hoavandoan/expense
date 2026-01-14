import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { signInWithApple, signInWithGoogle } from '@/lib/auth/oauth';
import { useAuth } from '@/lib/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, PressableFeedback, TextField, useThemeColor, useToast } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const foreground = useThemeColor('foreground');
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');
  const { toast } = useToast();
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast.show({
        label: 'Thông tin trống',
        description: 'Vui lòng nhập cả email và mật khẩu để tiếp tục',
        variant: 'danger',
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: 'Đóng',
        onActionPress: ({ hide }) => hide(),
      });
      return;
    }

    if (isSignUp && !name) {
      toast.show({
        label: 'Thiếu thông tin',
        description: 'Vui lòng cung cấp tên của bạn cho tài khoản mới',
        variant: 'danger',
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: 'Đóng',
        onActionPress: ({ hide }) => hide(),
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        toast.show({
          label: 'Đăng ký thành công',
          description: 'Vui lòng kiểm tra email của bạn để xác nhận tài khoản trước khi đăng nhập',
          variant: 'success',
          icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
          actionLabel: 'OK',
          onActionPress: ({ hide }) => hide(),
        });
      } else {
        await signInWithEmail(email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      toast.show({
        label: 'Lỗi xác thực',
        description: error.message || 'Đã có lỗi xảy ra trong quá trình đăng nhập',
        variant: 'danger',
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: 'Thử lại',
        onActionPress: ({ hide }) => hide(),
      });
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
        toast.show({
          label: error.message || 'Đăng nhập Apple thất bại',
          variant: 'danger',
          icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        });
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
        toast.show({
          label: error.message || 'Đăng nhập Google thất bại',
          variant: 'danger',
          icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        });
      }
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView withKeyboardAvoidingView contentContainerStyle={{ paddingVertical: 20 }}>
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
            <TextField isRequired className="mb-4">
              <TextField.Label className="mb-2 ml-1">Họ và tên</TextField.Label>
              <TextField.Input
                value={name}
                onChangeText={setName}
                placeholder="Nguyễn Văn A"
                autoCapitalize="words"
              />
            </TextField>
          )}

          <TextField isRequired className="mb-4">
            <TextField.Label className="mb-2 ml-1">Email</TextField.Label>
            <TextField.Input
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </TextField>

          <TextField isRequired className="mb-6">
            <TextField.Label className="mb-2 ml-1">Mật khẩu</TextField.Label>
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
      </ScreenScrollView>
    </View>
  );
}
