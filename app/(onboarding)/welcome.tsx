import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor('accent');

  return (
    <View className="flex-1 bg-background items-center justify-between py-12 px-6">
      <View style={{ paddingTop: insets.top }} className="items-center">
        <View className="bg-surface px-4 py-2 rounded-full border border-divider/10 flex-row items-center gap-2 mb-8">
          <IconSymbol name="person.3.fill" size={16} color="#10b981" />
          <AppText className="font-bold text-xs uppercase tracking-wider">SplitGroup</AppText>
        </View>

        <View className="relative w-full aspect-square items-center justify-center">
          <View className="absolute inset-0 bg-accent/5 rounded-[48px] rotate-3" />
          <View className="w-full h-full bg-[#0a2e24] rounded-[56px] overflow-hidden shadow-2xl items-center justify-center">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=600" }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3 }}
              contentFit="cover"
            />
            <View className="items-center">
              <IconSymbol name="doc.plaintext.fill" size={100} color="#10b981" />
              <View className="flex-row gap-2 mt-8 bg-surface/90 p-4 rounded-3xl border border-divider/10 shadow-lg items-center">
                <View className="flex-row -space-x-3">
                  <Avatar size="sm" alt="User 1">
                    <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=1" }} />
                  </Avatar>
                  <Avatar size="sm" alt="User 2">
                    <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=2" }} />
                  </Avatar>
                  <View className="w-8 h-8 rounded-full bg-accent items-center justify-center border-2 border-surface">
                    <AppText className="text-[10px] font-bold text-white">+3</AppText>
                  </View>
                </View>
                <View>
                  <AppText className="text-[10px] text-muted font-medium uppercase">Tổng cộng</AppText>
                  <AppText className="text-base font-bold">1.250.000đ</AppText>
                </View>
                <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center ml-4">
                  <IconSymbol name="checkmark" size={14} color={accent} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="w-full items-center">
        <AppText className="text-4xl font-bold text-center leading-tight mb-4">
          Chia sẻ hóa đơn{"\n"}
          <AppText className="text-accent underline decoration-accent/30">thật dễ dàng</AppText>
        </AppText>
        <AppText className="text-muted text-center leading-relaxed px-4">
          Quên đi nỗi lo tính toán. Chia tiền minh bạch và nhận lại tiền nhanh chóng từ bạn bè.
        </AppText>
      </View>

      <View className="w-full gap-4" style={{ marginBottom: insets.bottom }}>
        <View className="flex-row justify-center gap-2 mb-4">
          <View className="w-8 h-2 bg-accent rounded-full" />
          <View className="w-2 h-2 bg-divider rounded-full" />
          <View className="w-2 h-2 bg-divider rounded-full" />
        </View>

        <Button
          size="lg"
          className="h-16 rounded-2xl bg-accent shadow-lg"
          onPress={() => router.push('/(onboarding)/tutorial')}
        >
          <View className="flex-row items-center gap-2">
            <AppText className="font-bold text-lg text-white">Bắt đầu ngay</AppText>
            <IconSymbol name="arrow.right" size={20} color="white" />
          </View>
        </Button>

        <PressableFeedback>
          <View className="h-16 rounded-2xl border border-divider items-center justify-center">
            <AppText className="font-semibold text-foreground">Đã có tài khoản? Đăng nhập</AppText>
          </View>
        </PressableFeedback>
      </View>
    </View>
  );
}
