import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SkiaOnboardingBackground } from '@/components/ui/skia-onboarding-background';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor('accent');
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);

  const handleSkipToLogin = () => {
    setOnboardingComplete();
    router.replace('/(onboarding)/login');
  };

  return (
    <View className="flex-1 bg-background">
      <SkiaOnboardingBackground />
      
      <View className="flex-1 items-center justify-between py-12 px-6">
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)}
          style={{ paddingTop: insets.top }} 
          className="w-full flex-row justify-between items-center"
        >
          <View className="bg-surface px-4 py-2 rounded-full border border-divider/10 flex-row items-center gap-2">
            <IconSymbol name="person.3.fill" size={16} color="#10b981" />
            <AppText weight="bold" className="text-xs uppercase tracking-wider">SplitSmart</AppText>
          </View>

          <PressableFeedback onPress={handleSkipToLogin}>
            <AppText weight="bold" className="text-muted">Bỏ qua</AppText>
          </PressableFeedback>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(400).duration(1000)}
          className="relative w-full aspect-square items-center justify-center"
        >
          <View className="absolute inset-x-4 inset-y-4 bg-accent/5 rounded-[40px] rotate-3" />
          <View className="w-full h-full bg-surface/40 rounded-[40px] overflow-hidden border border-white/20 shadow-2xl items-center justify-center backdrop-blur-3xl">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=600" }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}
              contentFit="cover"
            />
            <View className="items-center">
              <IconSymbol name="doc.plaintext.fill" size={100} color="#10b981" />
              <View className="flex-row gap-2 mt-8 bg-surface p-4 rounded-2xl border border-divider/10 shadow-lg items-center">
                <View className="flex-row -space-x-3">
                  <Avatar size="sm" alt="User 1">
                    <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=1" }} />
                  </Avatar>
                  <Avatar size="sm" alt="User 2">
                    <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=2" }} />
                  </Avatar>
                  <View className="w-8 h-8 rounded-full bg-accent items-center justify-center border-2 border-surface">
                    <AppText weight="bold" className="text-[10px] text-white">+3</AppText>
                  </View>
                </View>
                <View>
                  <AppText weight="medium" className="text-[10px] text-muted uppercase">Tổng cộng</AppText>
                  <AppText weight="bold" className="text-base">1.250.000đ</AppText>
                </View>
                <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center ml-4">
                  <IconSymbol name="checkmark" size={14} color={accent} />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(600).duration(800)}
          className="w-full items-center"
        >
          <AppText variant="heading" weight="bold" className="text-4xl text-center leading-[44px] mb-4">
            Chia sẻ hóa đơn{"\n"}
            <AppText variant="heading" weight="bold" className="text-accent underline decoration-accent/30">thật dễ dàng</AppText>
          </AppText>
          <AppText className="text-muted text-center leading-relaxed px-4">
            Quên đi nỗi lo tính toán. Chia tiền minh bạch và nhận lại tiền nhanh chóng từ bạn bè.
          </AppText>
        </Animated.View>

        <View className="w-full gap-4" style={{ marginBottom: insets.bottom }}>
          <View className="flex-row justify-center gap-2 mb-4">
            <View className="w-8 h-2 bg-accent rounded-full" />
            <View className="w-2 h-2 bg-divider rounded-full" />
            <View className="w-2 h-2 bg-divider rounded-full" />
          </View>

          <Button
            size="lg"
            className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20"
            onPress={() => router.push('/(onboarding)/tutorial')}
          >
            <View className="flex-row items-center gap-2">
              <AppText weight="bold" className="text-lg text-white">Khám phá ngay</AppText>
              <IconSymbol name="arrow.right" size={20} color="white" />
            </View>
          </Button>

          <PressableFeedback onPress={handleSkipToLogin}>
            <View className="h-16 rounded-2xl border border-divider/10 bg-surface/50 items-center justify-center">
              <AppText weight="semibold" className="text-foreground">Đã có tài khoản? Đăng nhập</AppText>
            </View>
          </PressableFeedback>
        </View>
      </View>
    </View>
  );
}
