import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Slide {
  id: number;
  title: string;
  accent: string;
  description: string;
  image: string;
  renderOverlay: (accent: string) => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Tạo nhóm ',
    accent: 'dễ dàng',
    description: 'Lên kế hoạch cho chuyến đi hoặc chia tiền nhà chỉ trong vài giây.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute bottom-10 left-6 right-6 bg-surface/90 p-4 rounded-3xl flex-row items-center gap-3 border border-divider/10 shadow-lg">
        <View className="w-10 h-10 rounded-2xl bg-accent items-center justify-center">
          <IconSymbol name="house.fill" size={20} color="white" />
        </View>
        <View className="flex-1">
          <AppText className="font-bold text-sm">Nhà trọ Happy</AppText>
          <AppText className="text-xs text-muted">5 thành viên</AppText>
        </View>
        <View className="flex-row -space-x-3">
          <Avatar size="sm" alt="User A">
            <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=a" }} />
          </Avatar>
          <Avatar size="sm" alt="User B">
            <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=b" }} />
          </Avatar>
          <View className="w-6 h-6 rounded-full bg-accent items-center justify-center border border-surface">
            <AppText className="text-[8px] font-bold text-white">+2</AppText>
          </View>
        </View>
      </View>
    )
  },
  {
    id: 2,
    title: 'Thêm bạn & ',
    accent: 'Quản lý chi',
    description: 'Dễ dàng mời thành viên mới và kiểm soát ngân sách nhóm mọi lúc, mọi nơi.',
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute inset-x-8 top-1/4 bg-surface p-4 rounded-3xl shadow-2xl border border-divider/5">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <AppText className="text-[10px] text-muted uppercase font-bold">Chi tiêu nhóm</AppText>
            <AppText className="font-bold text-base">Đà Lạt 2024 🍓</AppText>
          </View>
          <View className="flex-row items-center gap-1 bg-surface-secondary p-1 rounded-full px-2">
            <Avatar size="sm" alt="User L">
              <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=l" }} />
            </Avatar>
            <View className="w-6 h-6 rounded-full bg-divider items-center justify-center">
              <IconSymbol name="plus" size={10} color="gray" />
            </View>
          </View>
        </View>

        <View className="gap-3">
          {[
            { icon: 'fork.knife', label: 'Ăn trưa Gà nướng', amount: '-300k', color: 'text-danger' },
            { icon: 'cup.and.saucer.fill', label: 'Cafe Tùng', amount: '+100k', color: 'text-accent' },
            { icon: 'house.fill', label: 'Homestay', amount: '-500k', color: 'text-danger' },
          ].map((item, idx) => (
            <View key={idx} className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-accent-soft items-center justify-center">
                <IconSymbol name={item.icon as any} size={14} color={accent} />
              </View>
              <AppText className="flex-1 font-medium text-sm">{item.label}</AppText>
              <AppText className={`font-bold ${item.color}`}>{item.amount}</AppText>
            </View>
          ))}
        </View>
        <View className="mt-4 items-end">
          <View className="w-10 h-10 rounded-2xl bg-accent items-center justify-center shadow-lg">
            <IconSymbol name="plus" size={20} color="white" />
          </View>
        </View>
      </View>
    )
  },
  {
    id: 3,
    title: 'Quản lý nợ ',
    accent: 'minh bạch',
    description: 'Theo dõi ai nợ ai và xem báo cáo thống kê chi tiêu trực quan theo từng tháng.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute inset-x-6 bottom-1/4 gap-4">
        <View className="bg-surface/90 p-4 rounded-3xl border border-divider/10 shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl bg-accent-soft items-center justify-center">
                <IconSymbol name="creditcard.fill" size={14} color={accent} />
              </View>
              <AppText className="text-xs font-bold text-muted uppercase">Đã thu nợ</AppText>
            </View>
            <AppText className="text-xs font-bold">85%</AppText>
          </View>
          <View className="h-2 bg-divider rounded-full overflow-hidden">
            <View className="h-full bg-accent w-[85%]" />
          </View>
        </View>

        <View className="bg-surface p-4 rounded-3xl border border-divider/10 shadow-xl flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-2xl bg-accent items-center justify-center">
            <IconSymbol name="chart.bar.fill" size={24} color="white" />
          </View>
          <View className="flex-1">
            <AppText className="text-[10px] text-muted uppercase font-bold">Chi tiêu tháng</AppText>
            <AppText className="text-xl font-bold">4.250.000đ</AppText>
          </View>
          <View className="bg-accent-soft px-2 py-1 rounded-full flex-row items-center gap-1">
            <IconSymbol name="arrow.down" size={10} color={accent} />
            <AppText className="text-accent font-bold text-[10px]">5%</AppText>
          </View>
        </View>
      </View>
    )
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const accent = useThemeColor('accent');

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
      return;
    }
    router.replace('/(tabs)');
  };

  const slide = SLIDES[currentSlide];

  return (
    <View className="flex-1 bg-background justify-between py-12 px-6">
      <View style={{ paddingTop: insets.top }} className="flex-row justify-end">
        <PressableFeedback onPress={() => router.replace('/(tabs)')}>
          <AppText className="text-muted font-bold">Bỏ qua</AppText>
        </PressableFeedback>
      </View>

      <View className="flex-1 items-center justify-center my-8">
        <Animated.View
          key={currentSlide}
          entering={SlideInRight}
          exiting={SlideOutLeft}
          className="w-full h-[380px] bg-surface-tertiary rounded-[48px] overflow-hidden shadow-2xl relative"
        >
          <Image
            source={{ uri: slide.image }}
            style={{ width: '100%', height: '100%', opacity: 0.4 }}
            contentFit="cover"
          />
          {slide.renderOverlay(accent)}
        </Animated.View>

        <View className="mt-12 items-center px-4">
          <AppText className="text-3xl font-bold text-center leading-tight mb-4">
            {slide.title}
            <AppText className="text-accent">{slide.accent}</AppText>
          </AppText>
          <AppText className="text-muted text-center leading-relaxed">
            {slide.description}
          </AppText>
        </View>
      </View>

      <View className="w-full gap-8" style={{ marginBottom: insets.bottom }}>
        <View className="flex-row justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              className={`h-2 rounded-full ${currentSlide === idx ? 'w-8 bg-accent' : 'w-2 bg-divider'}`}
            />
          ))}
        </View>

        <Button
          size="lg"
          className="h-16 rounded-2xl bg-accent shadow-lg"
          onPress={nextSlide}
        >
          <View className="flex-row items-center gap-2">
            <AppText className="font-bold text-lg text-white">
              {currentSlide === SLIDES.length - 1 ? 'Bắt đầu ngay' : 'Tiếp tục'}
            </AppText>
            {currentSlide === SLIDES.length - 1 ? (
              <IconSymbol name="rocket.fill" size={20} color="white" />
            ) : (
              <IconSymbol name="arrow.right" size={20} color="white" />
            )}
          </View>
        </Button>
      </View>
    </View>
  );
}
