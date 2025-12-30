import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ActionIcon } from '@/components/ui/action-icon';
import { GroupCard } from '@/components/ui/group-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Avatar, Card, Divider, PressableFeedback, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

// Mock data for groups
const MOCK_GROUPS = [
  {
    id: '1',
    title: 'Trip Đà Lạt',
    memberCount: 4,
    balance: 500000,
    bgImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=500',
    members: [
      { id: '1', name: 'An', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
      { id: '2', name: 'Bình', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
    ],
  },
  {
    id: '2',
    title: 'Tiền nhà trọ',
    memberCount: 2,
    balance: 0,
    bgImage: 'https://images.unsplash.com/photo-1513584684374-8bdb7489feef?q=80&w=500',
    members: [
      { id: '4', name: 'Dũng', avatarUrl: 'https://i.pravatar.cc/150?u=4' },
    ],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');

  return (
    <ScreenScrollView className="android:my-4">
      {/* Header (Image 0) */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <PressableFeedback onPress={() => router.push('/settings')} className='rounded-full'>
            <Avatar size="md" alt="User profile" className='bg-surface size-12'>
              <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=minhanh' }} />
              <Avatar.Fallback>MA</Avatar.Fallback>
            </Avatar>
          </PressableFeedback>
          <View>
            <AppText className="text-muted text-[13px]">Xin chào,</AppText>
            <AppText className="text-lg font-bold text-foreground">Minh Anh</AppText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <PressableFeedback className="w-10 h-10 rounded-full bg-surface items-center justify-center">
            <IconSymbol name="magnifyingglass" size={20} color={foreground} />
          </PressableFeedback>
          <PressableFeedback className="w-10 h-10 rounded-full bg-surface items-center justify-center">
            <IconSymbol name="bell" size={20} color={foreground} />
            <View className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
          </PressableFeedback>
        </View>
      </View>

      {/* Hero Balance Section with Accent Gradient */}
      <View className="px-5 mb-6">
        <View
          className="p-6 rounded-[32px] shadow-xl overflow-hidden bg-accent"
        // style={{ backgroundColor: accent }}
        >
          {/* Accent Gradient Layer - Simulated as we can't use LinearGradient directly for bg easily without nested views or global.css */}
          <View className="flex-row items-center justify-between mb-2">
            <AppText className="text-accent-foreground text-sm font-medium">Tổng số dư khả dụng</AppText>
            <PressableFeedback onPress={() => setShowBalance(!showBalance)}>
              <IconSymbol name={showBalance ? "eye" : "eye.slash"} size={20} color="white" />
            </PressableFeedback>
          </View>

          <View className="flex-row items-baseline gap-1 mb-6">
            <AppText className="text-accent-foreground text-4xl font-bold">
              {showBalance ? "1.250.000" : "••••••••"}
            </AppText>
            <AppText className="text-accent-foreground text-xl font-medium">đ</AppText>
          </View>

          {/* Nested Stats Card */}
          <View className="flex-row bg-accent-soft rounded-2xl p-4 gap-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <View className="w-5 h-5 bg-success rounded-full items-center justify-center">
                  <IconSymbol name="arrow.down.left" size={10} color="white" />
                </View>
                <AppText className="text-accent-foreground/80 text-[10px] font-bold uppercase">BẠN ĐƯỢC TRẢ</AppText>
              </View>
              <AppText className="text-accent-foreground text-base font-bold">+ 1.450.000 đ</AppText>
            </View>
            <Divider orientation='vertical' className="bg-divider" />
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <View className="w-5 h-5 bg-warning rounded-full items-center justify-center">
                  <IconSymbol name="arrow.up.right" size={10} color="white" />
                </View>
                <AppText className="text-accent-foreground/80 text-[10px] font-bold uppercase">BẠN NỢ</AppText>
              </View>
              <AppText className="text-accent-foreground text-base font-bold">- 200.000 đ</AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions Row */}
      <View className="flex-row justify-between px-20 mb-8">
        <ActionIcon name="creditcard" label="Chi tiêu" onPress={() => router.push('/add-expense')} />
        <ActionIcon name="plus" label="Tạo nhóm" onPress={() => router.push('/add-group')} />
        <ActionIcon name="qrcode" label="QR Code" />
        {/* <ActionIcon name="chart.bar" label="Thống kê" /> */}
      </View>

      {/* Horizontal Groups Section */}
      <View className="mb-8 w-full">
        <View className="px-6 flex-row items-center justify-between mb-4">
          <AppText className="text-lg font-bold">Nhóm của bạn</AppText>
          <PressableFeedback>
            <AppText className="text-accent font-semibold text-sm">Xem tất cả</AppText>
          </PressableFeedback>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
        >
          {MOCK_GROUPS.map((group) => (
            <GroupCard
              key={group.id}
              variant="horizontal"
              title={group.title}
              memberCount={group.memberCount}
              balance={group.balance}
              members={group.members}
              bgImage={group.bgImage}
              onPress={() => router.push(`/group/${group.id}` as any)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Recent Activity Section */}
      <View className="px-6 mb-10">
        <AppText className="text-lg font-bold mb-4">Hoạt động gần đây</AppText>
        <View className="gap-3">
          <Card variant="default" className="p-4 rounded-2xl border border-divider/5">
            <View className="flex-row items-center gap-3">
              <Avatar size="md" alt="Nam" className='rounded-full'>
                <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=nam' }} />
                <Avatar.Fallback>N</Avatar.Fallback>
              </Avatar>
              <View className="flex-1">
                <AppText className="font-bold">Nam <AppText className="font-normal text-muted">đã thanh toán cho bạn</AppText></AppText>
                <AppText className="text-xs text-muted mt-0.5">trong nhóm <AppText className="text-accent">Ăn trưa Cty</AppText> • 5h trước</AppText>
              </View>
              <View className="items-end">
                <AppText className="text-success text-xs font-bold uppercase mb-1">ĐÃ NHẬN</AppText>
                <AppText className="font-bold text-lg">35k</AppText>
              </View>
            </View>
          </Card>
          <Card variant="default" className="p-4 rounded-2xl border border-divider/5">
            <View className="flex-row items-center gap-3">
              <Avatar size="md" alt="Me" className="rounded-full bg-yellow-100">
                <Avatar.Fallback>B</Avatar.Fallback>
              </Avatar>
              <View className="flex-1">
                <AppText className="font-bold">Bạn <AppText className="font-normal text-muted">đã tạo nhóm mới</AppText></AppText>
                <AppText className="text-xs text-muted mt-0.5">Tiền nhà trọ • 1 ngày trước</AppText>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </ScreenScrollView>
  );
}

