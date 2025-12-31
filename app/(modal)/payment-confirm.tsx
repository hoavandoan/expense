import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

export default function PaymentConfirmScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
    opacity.value = withDelay(300, withSpring(1));
  }, []);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withSpring(opacity.value === 1 ? 0 : 20) }],
  }));

  return (
    <View className="flex-1 bg-background items-center justify-center px-10">
      <Animated.View
        style={[animatedCircleStyle]}
        className="w-32 h-32 rounded-full bg-accent items-center justify-center mb-8 shadow-2xl shadow-accent/40"
      >
        <IconSymbol name="checkmark" size={60} color="white" />
      </Animated.View>

      <Animated.View style={[animatedTextStyle]} className="items-center">
        <AppText className="text-3xl font-bold text-center mb-2">Thành công!</AppText>
        <AppText className="text-muted text-center text-lg mb-12">
          Giao dịch đã được ghi nhận.{"\n"}Số dư nhóm đã cập nhật.
        </AppText>

        <Button
          size="lg"
          className="h-16 rounded-2xl bg-accent px-12 shadow-lg"
          onPress={() => router.dismissAll()}
        >
          <Button.Label className="text-lg font-bold">Quay về trang chủ</Button.Label>
        </Button>
      </Animated.View>
    </View>
  );
}
