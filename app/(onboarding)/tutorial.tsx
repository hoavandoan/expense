import { AppText } from '@/components/app-text';
import { CrossPagerView, type CrossPagerViewRef } from '@/components/ui/cross-pager-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SkiaOnboardingBackground } from '@/components/ui/skia-onboarding-background';
import { useTranslation } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, PressableFeedback, useThemeColor } from 'heroui-native';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
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

const getSlides = (t: any): Slide[] => [
  {
    id: 1,
    title: t('onboarding.tutorial.slide1.title'),
    accent: t('onboarding.tutorial.slide1.accent'),
    description: t('onboarding.tutorial.slide1.description'),
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute bottom-10 left-6 right-6 bg-surface p-4 rounded-2xl flex-row items-center gap-3 border border-divider/10 shadow-lg">
        <View className="w-10 h-10 rounded-2xl bg-accent items-center justify-center">
          <IconSymbol name="house.fill" size={20} color="white" />
        </View>
        <View className="flex-1">
          <AppText weight="bold" className="text-sm">{t('onboarding.tutorial.slide1.overlay_title')}</AppText>
          <AppText className="text-xs text-muted">{t('onboarding.tutorial.slide1.overlay_desc')}</AppText>
        </View>
        <View className="flex-row -space-x-3">
          <Avatar size="sm" alt="User A">
            <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=a" }} />
          </Avatar>
          <Avatar size="sm" alt="User B">
            <Avatar.Image source={{ uri: "https://i.pravatar.cc/100?u=b" }} />
          </Avatar>
          <View className="w-6 h-6 rounded-full bg-accent items-center justify-center border border-surface">
            <AppText weight="bold" className="text-[8px] text-white">+2</AppText>
          </View>
        </View>
      </View>
    )
  },
  {
    id: 2,
    title: t('onboarding.tutorial.slide2.title'),
    accent: t('onboarding.tutorial.slide2.accent'),
    description: t('onboarding.tutorial.slide2.description'),
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute inset-x-8 top-1/4 bg-surface p-4 rounded-2xl shadow-2xl border border-divider/10">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <AppText weight="bold" className="text-[10px] text-muted uppercase">{t('onboarding.tutorial.slide2.overlay_group_title')}</AppText>
            <AppText weight="bold" className="text-base">{t('onboarding.tutorial.slide2.overlay_group_name')}</AppText>
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
            { icon: 'fork.knife', label: t('onboarding.tutorial.slide2.overlay_item1'), amount: '-300k', color: 'text-danger' },
            { icon: 'cup.and.saucer.fill', label: t('onboarding.tutorial.slide2.overlay_item2'), amount: '+100k', color: 'text-accent' },
            { icon: 'house.fill', label: t('onboarding.tutorial.slide2.overlay_item3'), amount: '-500k', color: 'text-danger' },
          ].map((item, idx) => (
            <View key={idx} className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-accent-soft items-center justify-center">
                <IconSymbol name={item.icon as any} size={14} color={accent} />
              </View>
              <AppText weight="medium" className="flex-1 text-sm">{item.label}</AppText>
              <AppText weight="bold" className={item.color}>{item.amount}</AppText>
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
    title: t('onboarding.tutorial.slide3.title'),
    accent: t('onboarding.tutorial.slide3.accent'),
    description: t('onboarding.tutorial.slide3.description'),
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute inset-x-6 bottom-1/4 gap-4">
        <View className="bg-surface p-4 rounded-2xl border border-divider/10 shadow-lg">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl bg-accent-soft items-center justify-center">
                <IconSymbol name="creditcard.fill" size={14} color={accent} />
              </View>
              <AppText weight="bold" className="text-xs text-muted uppercase">{t('onboarding.tutorial.slide3.overlay_collected')}</AppText>
            </View>
            <AppText weight="bold" className="text-xs">85%</AppText>
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
            <AppText weight="bold" className="text-[10px] text-muted uppercase">{t('onboarding.tutorial.slide3.overlay_monthly')}</AppText>
            <AppText weight="bold" className="text-xl">4.250.000đ</AppText>
          </View>
          <View className="bg-accent-soft px-2 py-1 rounded-full flex-row items-center gap-1">
            <IconSymbol name="arrow.down" size={10} color={accent} />
            <AppText weight="bold" className="text-accent text-[10px]">5%</AppText>
          </View>
        </View>
      </View>
    )
  },
  {
    id: 4,
    title: t('onboarding.tutorial.slide4.title'),
    accent: t('onboarding.tutorial.slide4.accent'),
    description: t('onboarding.tutorial.slide4.description'),
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
            <AppText weight="bold" className="text-[10px] text-muted">{t('onboarding.tutorial.slide4.overlay_food')}</AppText>
            <AppText weight="bold">45%</AppText>
          </View>
          <View className="w-px h-6 bg-divider/20" />
          <View className="items-center">
            <AppText weight="bold" className="text-[10px] text-muted">{t('onboarding.tutorial.slide4.overlay_travel')}</AppText>
            <AppText weight="bold">30%</AppText>
          </View>
          <View className="w-px h-6 bg-divider/20" />
          <View className="items-center">
            <AppText weight="bold" className="text-[10px] text-muted">{t('onboarding.tutorial.slide4.overlay_other')}</AppText>
            <AppText weight="bold">25%</AppText>
          </View>
        </View>
      </View>
    )
  },
  {
    id: 5,
    title: t('onboarding.tutorial.slide5.title'),
    accent: t('onboarding.tutorial.slide5.accent'),
    description: t('onboarding.tutorial.slide5.description'),
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600',
    renderOverlay: (accent) => (
      <View className="absolute inset-0 items-center justify-center p-8">
        <View className="bg-surface/90 p-8 rounded-[40px] items-center border border-white/20 shadow-2xl backdrop-blur-3xl">
          <View className="w-24 h-24 bg-accent/10 rounded-full items-center justify-center mb-6">
            <IconSymbol name="shield" size={48} color={accent} />
          </View>
          <AppText weight="bold" className="text-xl mb-2">{t('onboarding.tutorial.slide5.overlay_encrypted')}</AppText>
          <AppText className="text-sm text-muted text-center leading-5">
            {t('onboarding.tutorial.slide5.overlay_desc')}
          </AppText>
          <View className="mt-8 flex-row items-center gap-2 bg-success-soft px-4 py-2 rounded-full">
            <IconSymbol name="checkmark.circle.fill" size={16} color="#10b981" />
            <AppText weight="bold" className="text-[#10b981] text-xs">{t('onboarding.tutorial.slide5.overlay_verify')}</AppText>
          </View>
        </View>
      </View>
    )
  },
];

export default function TutorialScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const accent = useThemeColor('accent');
  const pagerRef = useRef<CrossPagerViewRef>(null);
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);
  const slides = useMemo(() => getSlides(t), [t]);

  const handleComplete = () => {
    setOnboardingComplete();
    router.replace('/(onboarding)/login');
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      pagerRef.current?.setPage(currentSlide + 1);
      return;
    }
    handleComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const slide = slides[currentSlide];

  return (
    <View className="flex-1 bg-background">
      <SkiaOnboardingBackground />

      <View className="flex-1 justify-between py-12 px-6">
        <View style={{ paddingTop: insets.top }} className="flex-row justify-end">
          <PressableFeedback onPress={handleSkip}>
            <AppText weight="bold" className="text-muted">{t('onboarding.tutorial.skip')}</AppText>
          </PressableFeedback>
        </View>

        <View className="flex-1 items-center justify-center my-8">
          <CrossPagerView
            ref={pagerRef}
            style={{ width: SCREEN_WIDTH - 48, height: 380 }}
            initialPage={0}
            onPageSelected={(e) => setCurrentSlide(e.nativeEvent.position)}
          >
            {slides.map((slideItem) => (
              <View key={slideItem.id} className="flex-1">
                <View className="w-full h-full bg-surface/30 rounded-[40px] overflow-hidden shadow-2xl relative border border-white/20">
                  <Image
                    source={{ uri: slideItem.image }}
                    style={{ width: '100%', height: '100%', opacity: 0.1 }}
                    contentFit="cover"
                  />
                  {slideItem.renderOverlay(accent)}
                </View>
              </View>
            ))}
          </CrossPagerView>

          <View className="mt-12 items-center px-4 w-full h-32">
            <Animated.View key={currentSlide} entering={FadeInUp.duration(600)} exiting={FadeOut}>
              <AppText variant="heading" weight="bold" className="text-3xl text-center leading-tight mb-4">
                {slide.title}
                <AppText variant="heading" weight="bold" className="text-accent">{slide.accent}</AppText>
              </AppText>
              <AppText className="text-muted text-center leading-relaxed">
                {slide.description}
              </AppText>
            </Animated.View>
          </View>
        </View>

        <View className="w-full gap-8" style={{ marginBottom: insets.bottom }}>
          <View className="flex-row justify-center gap-2">
            {slides.map((_, idx) => (
              <View
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-accent' : 'w-2 bg-divider'}`}
              />
            ))}
          </View>

          <Button
            size="lg"
            className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20"
            onPress={nextSlide}
          >
            <View className="flex-row items-center gap-2">
              <AppText weight="bold" className="text-lg text-white">
                {currentSlide === slides.length - 1 ? t('onboarding.tutorial.start_now') : t('onboarding.tutorial.continue')}
              </AppText>
              {currentSlide === slides.length - 1 ? (
                <IconSymbol name="rocket.fill" size={20} color="white" />
              ) : (
                <IconSymbol name="arrow.right" size={20} color="white" />
              )}
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
}
