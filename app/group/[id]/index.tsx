import { AppText } from '@/components/app-text';
import {
  AnimatedScrollView,
  AnimatedScrollViewTitle,
  AnimatedScrollViewTitleWrapper,
  HeaderComponentWrapper,
  HeaderNavBar,
} from '@/components/parallax-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Timeline, type TimelineItem } from '@/components/ui/timeline';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Card, cn, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

const MOCK_MEMBERS = [
  { id: '1', name: 'Minh Anh', balance: -50000, avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Bình', balance: 150000, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Chi', balance: -200000, avatarUrl: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Dũng', balance: 100000, avatarUrl: 'https://i.pravatar.cc/150?u=4' },
];

const MOCK_ACTIVITIES: TimelineItem[] = [
  { id: '1', title: 'Bạn đã thêm Ăn tối', description: 'Ăn tối tại Phở Hiếu - Đà Lạt', timestamp: '2 giờ trước', icon: 'fork.knife', status: 'complete', meta: '150.000 đ' },
  { id: '2', title: 'Bình đã trả Minh Anh', description: 'Thanh toán nợ cũ', timestamp: '5 giờ trước', icon: 'creditcard.fill', status: 'complete', meta: '50.000 đ' },
  { id: '3', title: 'Chi đã thêm Vé xem phim', description: 'Xem phim tại CGV Vincom', timestamp: 'Hôm qua', icon: 'cart.fill', status: 'current', meta: '320.000 đ' },
];

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor('accent');

  return (
    <View className="flex-1 bg-black">
      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        headerMaxHeight={300}
        topBarHeight={100}
        renderHeaderNavBarComponent={() => (
          <HeaderNavBar className="bg-transparent">
            {/* This is the overflow header (visible when at top) */}
            <PressableFeedback
              className="w-10 h-10 rounded-full bg-black/20 items-center justify-center border border-white/10"
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={24} color="white" />
            </PressableFeedback>
            <View className="flex-row gap-2">
              <PressableFeedback className="w-10 h-10 rounded-full bg-black/20 items-center justify-center border border-white/10">
                <IconSymbol name="square.and.arrow.up" size={18} color="white" />
              </PressableFeedback>
              <PressableFeedback className="w-10 h-10 rounded-full bg-black/20 items-center justify-center border border-white/10">
                <IconSymbol name="settings" size={20} color="white" />
              </PressableFeedback>
            </View>
          </HeaderNavBar>
        )}
        renderTopNavBarComponent={() => (
          <HeaderNavBar useBlur={true}>
            {/* This is the sticky navbar (visible when scrolled) */}
            <PressableFeedback onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="white" />
            </PressableFeedback>
            <AppText className="text-white text-lg font-bold">Trip Đà Lạt</AppText>
            <PressableFeedback>
              <IconSymbol name="ellipsis" size={20} color="white" />
            </PressableFeedback>
          </HeaderNavBar>
        )}
        renderOveralComponent={() => (
          <AnimatedScrollViewTitleWrapper className="px-6 pb-6">
            <AnimatedScrollViewTitle size={42} className="text-white font-bold tracking-tighter">
              Trip Đà Lạt
            </AnimatedScrollViewTitle>
          </AnimatedScrollViewTitleWrapper>
        )}
        renderHeaderComponent={() => (
          <HeaderComponentWrapper
            useGradient
            gradientColors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,1)"]}
            gradientHeight={200}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000' }}
              style={{ width: '100%', height: 300 }}
              contentFit="cover"
            />
          </HeaderComponentWrapper>
        )}
      >
        <View className="px-6 pt-4 bg-black">
          {/* Info Badges */}
          <View className="flex-row gap-3 mb-8">
            <View className="bg-surface-secondary/20 px-4 py-2 rounded-full border border-white/10">
              <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest">THÀNH VIÊN: 4</AppText>
            </View>
            <View className="bg-success/10 px-4 py-2 rounded-full border border-success/20">
              <AppText className="text-success text-[10px] font-bold uppercase tracking-widest">BẠN NHẬN LẠI: 150K</AppText>
            </View>
          </View>

          {/* Stats Card */}
          <View className="mb-10">
            <Card variant="default"
              className="p-8 rounded-3xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: accent }}
            >
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">BẠN CHI</AppText>
                  <AppText className="text-white text-2xl font-bold">1.250.000 đ</AppText>
                </View>
                <View className="w-px bg-white/20" />
                <View className="flex-1">
                  <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">BẠN NHẬN LẠI</AppText>
                  <AppText className="text-white text-2xl font-bold">150.000 đ</AppText>
                </View>
              </View>

              <View className="mt-8 flex-row gap-2">
                <PressableFeedback className="flex-1">
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="plus" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">CHI TIÊU</AppText>
                  </View>
                </PressableFeedback>
                <PressableFeedback className="flex-1">
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="qrcode" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">THANH TOÁN</AppText>
                  </View>
                </PressableFeedback>
                <PressableFeedback className="flex-1">
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="chart.bar" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">BÁO CÁO</AppText>
                  </View>
                </PressableFeedback>
              </View>
            </Card>
          </View>

          {/* Recent Activity moved below */}

          {/* Members List */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-6">
              <AppText className="text-xl font-bold text-white">Thành viên nợ/trả</AppText>
              <PressableFeedback onPress={() => router.push('/group/[id]/history')}>
                <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={accent} />
              </PressableFeedback>
            </View>

            <View className="gap-3">
              {MOCK_MEMBERS.map((member) => (
                <Card key={member.id} variant="default" className="p-4 rounded-2xl bg-surface-secondary/10 border border-white/5">
                  <View className="flex-row items-center">
                    <Avatar size="md" alt={member.name} className="mr-4">
                      <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                        <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                      </Avatar.Image>
                      <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                    </Avatar>
                    <View className="flex-1">
                      <AppText className="font-bold text-base text-white">{member.name}</AppText>
                      <AppText className="text-muted text-xs">Phần chia: 25%</AppText>
                    </View>
                    <View className="items-end">
                      <AppText className={cn(
                        'font-bold text-base',
                        member.balance >= 0 ? 'text-success' : 'text-danger'
                      )}>
                        {member.balance >= 0 ? `+${member.balance / 1000}k` : `-${Math.abs(member.balance) / 1000}k`}
                      </AppText>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View className="pb-20">
            <View className="flex-row items-center justify-between mb-6">
              <AppText className="text-xl font-bold text-white">Hoạt động gần đây</AppText>
              <PressableFeedback>
                <AppText className="text-accent font-bold text-sm">Xem tất cả</AppText>
              </PressableFeedback>
            </View>
            <Timeline
              items={MOCK_ACTIVITIES}
              activeColor={accent}
              inactiveColor="#27272a"
              animationType="rotate"
            />
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}
