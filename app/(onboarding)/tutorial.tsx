import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, PressableFeedback, useThemeColor } from 'heroui-native';
import React, { useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      <View className="absolute bottom-10 left-6 right-6 bg-surface p-4 rounded-2xl flex-row items-center gap-3 border border-divider/10 shadow-lg">
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
      <View className="absolute inset-x-8 top-1/4 bg-surface p-4 rounded-2xl shadow-2xl border border-divider/10">
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
        <View className="bg-surface p-4 rounded-2xl border border-divider/10 shadow-lg">
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

        <View className="bg-surface p-4 rounded-2xl border border-divider/10 shadow-xl flex-row items-center gap-4">
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
  {
    id: 4,
    title: 'Phân tích ',
    accent: 'thông minh',
    description: 'Dễ dàng nắm bắt thói quen chi tiêu thông qua các biểu đồ phân tích hàng tháng.',
    image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute inset-x-10 bottom-1/4 items-center gap-6">
        <View className="w-48 h-48 bg-surface rounded-full items-center justify-center shadow-2xl border-4 border-accent/10">
          <IconSymbol name="chart.pie.fill" size={80} color={accent} />
          <View className="absolute -top-2 -right-2 bg-success p-2 rounded-full border-4 border-surface shadow-lg">
             <IconSymbol name="checkmark" size={16} color="white" />
          </View>
        </View>
        <View className="bg-surface px-6 py-3 rounded-2xl border border-divider/10 shadow-lg flex-row gap-4 items-center">
          <View className="items-center">
            <AppText className="text-[10px] text-muted font-bold">ĂN UỐNG</AppText>
            <AppText className="font-bold">45%</AppText>
          </View>
          <View className="w-px h-6 bg-divider/20" />
          <View className="items-center">
            <AppText className="text-[10px] text-muted font-bold">DU LỊCH</AppText>
            <AppText className="font-bold">30%</AppText>
          </View>
          <View className="w-px h-6 bg-divider/20" />
          <View className="items-center">
            <AppText className="text-[10px] text-muted font-bold">KHÁC</AppText>
            <AppText className="font-bold">25%</AppText>
          </View>
        </View>
      </View>
    )
  },
  {
    id: 5,
    title: 'An toàn & ',
    accent: 'Bảo mật',
    description: 'Dữ liệu của bạn luôn được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn cao nhất.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute inset-0 items-center justify-center p-8">
        <View className="bg-surface/90 p-8 rounded-[40px] items-center border border-white/20 shadow-2xl">
          <View className="w-24 h-24 bg-accent/10 rounded-full items-center justify-center mb-6">
            <IconSymbol name="shield" size={48} color={accent} />
          </View>
          <AppText className="text-xl font-bold mb-2">Đã được mã hóa</AppText>
          <AppText className="text-sm text-muted text-center leading-5">
            Tất cả các giao dịch và dữ liệu cá nhân của bạn được bảo mật 256-bit.
          </AppText>
          <View className="mt-8 flex-row items-center gap-2 bg-success-soft px-4 py-2 rounded-full">
            <IconSymbol name="checkmark.circle.fill" size={16} color="#10b981" />
            <AppText className="text-[#10b981] font-bold text-xs">Verify by SplitGroup</AppText>
          </View>
        </View>
      </View>
    )
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const accent = useThemeColor('accent');
  const pagerRef = useRef<PagerView>(null);
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);

  const handleComplete = () => {
    setOnboardingComplete();
    router.replace('/(onboarding)/login');
  };

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      pagerRef.current?.setPage(currentSlide + 1);
      return;
    }
    handleComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const slide = SLIDES[currentSlide];

  return (
    <View className="flex-1 bg-background justify-between py-12 px-6">
      <View style={{ paddingTop: insets.top }} className="flex-row justify-end">
        <PressableFeedback onPress={handleSkip}>
          <AppText className="text-muted font-bold">Bỏ qua</AppText>
        </PressableFeedback>
      </View>

      <View className="flex-1 items-center justify-center my-8">
        <PagerView
          ref={pagerRef}
          style={{ width: SCREEN_WIDTH - 48, height: 380 }}
          initialPage={0}
          onPageSelected={(e) => setCurrentSlide(e.nativeEvent.position)}
        >
          {SLIDES.map((slideItem, index) => (
            <View key={slideItem.id} className="flex-1">
              <View className="w-full h-full bg-surface-tertiary rounded-2xl overflow-hidden shadow-2xl relative border border-divider/10">
                <Image
                  source={{ uri: slideItem.image }}
                  style={{ width: '100%', height: '100%', opacity: 0.4 }}
                  contentFit="cover"
                />
                {slideItem.renderOverlay(accent)}
              </View>
            </View>
          ))}
        </PagerView>

        <View className="mt-12 items-center px-4">
          <Animated.View key={currentSlide} entering={FadeIn} exiting={FadeOut}>
            <AppText className="text-3xl font-bold text-center leading-tight mb-4">
              {slide.title}
              <AppText className="text-accent">{slide.accent}</AppText>
            </AppText>
            <AppText className="text-muted text-center leading-relaxed">
              {slide.description}
            </AppText>
          </Animated.View>
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
