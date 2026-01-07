import { ActivityItem } from '@/components/activity-item';
import { AppText } from '@/components/app-text';

import {
  AnimatedScrollView,
  HeaderComponentWrapper,
  HeaderNavBar,
} from '@/components/parallax-header';
import { ActionIcon } from '@/components/ui/action-icon';
import { GroupCard } from '@/components/ui/group-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Avatar, PressableFeedback, Surface, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [showBalance, setShowBalance] = useState(true);
  const { isLoggedIn, user, setLoginSheetOpen } = useAuth();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');

  const HOME_HEADER_HEIGHT = 140;

  const renderTopNavBarComponent = () => (
    <HeaderNavBar useBlur={true} className="border-b border-divider/5">
      <View className="flex-row items-center justify-between px-6 h-full">
        <View className="flex-row items-center gap-3">
          <PressableFeedback
            onPress={() => !isLoggedIn && setLoginSheetOpen(true)}
            className="rounded-full"
          >
            <Avatar size="sm" alt="User profile" className="bg-surface size-8">
              {isLoggedIn && user?.avatarUrl ? (
                <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                  <Image style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <IconSymbol name="person" size={14} color={accent} />
                </Avatar.Fallback>
              )}
            </Avatar>
          </PressableFeedback>
          <AppText className="font-bold text-foreground">
            {isLoggedIn ? user?.name : 'Chào bạn!'}
          </AppText>
        </View>
        <View className="flex-row gap-2">
          <PressableFeedback
            onPress={() => router.push('/search' as any)}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <IconSymbol name="magnifyingglass" size={18} color={foreground} />
          </PressableFeedback>
          <PressableFeedback
            onPress={() => router.push('/notifications' as any)}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <IconSymbol name="bell" size={18} color={foreground} />
          </PressableFeedback>
        </View>
      </View>
    </HeaderNavBar>
  );

  const renderHeaderComponent = () => (
    <HeaderComponentWrapper className="bg-background" useGradient={false}>
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="px-6 pb-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-3">
          <PressableFeedback
            onPress={() => isLoggedIn ? router.push('/settings') : setLoginSheetOpen(true)}
            className="rounded-full bg-accent"
          >
            <Avatar size="md" alt="User profile" className="bg-surface size-12 shadow-sm">
              {isLoggedIn && user?.avatarUrl ? (
                <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                  <Image style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <IconSymbol name="person" size={20} color={accent} />
                </Avatar.Fallback>
              )}
            </Avatar>
          </PressableFeedback>
          <View>
            <AppText className="text-muted text-[13px]">
              {isLoggedIn ? 'Xin chào,' : 'Chào mừng bạn,'}
            </AppText>
            <AppText className="text-lg font-bold text-foreground">
              {isLoggedIn ? user?.name : 'Đăng nhập'}
            </AppText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <PressableFeedback className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-divider/5">
            <IconSymbol name="magnifyingglass" size={20} color={foreground} />
          </PressableFeedback>
          <View>
            <PressableFeedback className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-divider/5">
              <IconSymbol name="bell" size={20} color={foreground} />
            </PressableFeedback>
            <View className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
          </View>
        </View>
      </View>
    </HeaderComponentWrapper>
  );

  return (
    <View className="flex-1 bg-background">
      <AnimatedScrollView
        headerMaxHeight={HOME_HEADER_HEIGHT}
        disableScale={true}
        renderTopNavBarComponent={renderTopNavBarComponent}
        renderHeaderComponent={renderHeaderComponent}
        renderOveralComponent={undefined}
      >
        <View className="mb-8">
          {/* Hero Balance Section */}
          <View className="px-5 mb-8">
            <Surface variant="default" className="p-8 rounded-[40px] shadow-2xl overflow-hidden bg-accent relative">

              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="flex-row items-center justify-between mb-4">
                <AppText className="text-white/80 text-sm font-semibold tracking-wider uppercase">
                  Số dư của bạn
                </AppText>
                <PressableFeedback
                  onPress={() => setShowBalance(!showBalance)}
                  className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                >
                  <IconSymbol name={showBalance ? 'eye' : 'eye.slash'} size={20} color="white" />
                </PressableFeedback>
              </View>

              <View className="flex-row items-baseline gap-2 mb-8">
                <AppText className="text-white text-5xl font-black">
                  {showBalance ? '1.250.000' : '••••••••'}
                </AppText>
                <AppText className="text-white/90 text-2xl font-bold">đ</AppText>
              </View>

              {/* Nested Stats with glassmorphism feel */}
              <View className="flex-row bg-black/10 rounded-3xl p-5 gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-6 h-6 bg-success/20 rounded-full items-center justify-center">
                      <IconSymbol name="arrow.down.left" size={12} color="#4ade80" />
                    </View>
                    <AppText className="text-white/70 text-[11px] font-bold uppercase tracking-tight">
                      Bạn được trả
                    </AppText>
                  </View>
                  <AppText className="text-white text-lg font-bold">+ 1.450k</AppText>
                </View>

                <View className="w-px bg-white/10 h-10 self-center" />

                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-6 h-6 bg-danger/20 rounded-full items-center justify-center">
                      <IconSymbol name="arrow.up.right" size={12} color="#fb7185" />
                    </View>
                    <AppText className="text-white/70 text-[11px] font-bold uppercase tracking-tight">
                      Bạn nợ
                    </AppText>
                  </View>
                  <AppText className="text-white text-lg font-bold">- 200k</AppText>
                </View>
              </View>
            </Surface>
          </View>


          {/* Quick Actions Row */}
          <View className="flex-row justify-between px-20 mb-8">
            <ActionIcon
              name="creditcard"
              label="Chi tiêu"
              onPress={() => router.push('/add-expense')}
            />
            <ActionIcon name="plus" label="Tạo nhóm" onPress={() => router.push('/add-group')} />
            <ActionIcon name="qrcode" label="Tham gia" onPress={() => router.push('/join-group')} />
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
            <View className="flex-row items-center justify-between mb-4">
              <AppText className="text-lg font-bold">Hoạt động gần đây</AppText>
              <PressableFeedback onPress={() => router.push('/activity')}>
                <AppText className="text-accent font-semibold text-sm">Xem tất cả</AppText>
              </PressableFeedback>
            </View>
            <View className="gap-3">
              <ActivityItem
                user={{ name: 'Nam', avatar: 'https://i.pravatar.cc/150?u=nam' }}

                action="đã trả"
                subject="Ăn trưa"
                group="Ăn trưa Cty"
                groupIcon="fork.knife"
                amount="+35.000đ"
                status="đã nhận"
                typeIcon="fork.knife"
                typeColor="bg-success/10"
                iconColor="#22c55e"
              />
              <ActivityItem
                user={{ name: 'Bạn', avatar: 'https://i.pravatar.cc/150?u=me' }}

                action="đã tạo nhóm"
                group="Tiền nhà trọ"
                groupIcon="house.fill"
                amount=""
                status=""
                typeIcon="plus"
                typeColor="bg-default/10"
                iconColor="#6b7280"
                isMe
              />
            </View>
          </View>

        </View>
      </AnimatedScrollView>
    </View>
  );
}
