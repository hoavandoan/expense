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
import { Avatar, Card, Divider, PressableFeedback, useThemeColor } from 'heroui-native';
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
        <View className="pt-2">
          {/* Hero Balance Section with Accent Gradient */}
          <View className="px-5 mb-6">
            <View className="p-6 rounded-[32px] shadow-xl overflow-hidden bg-accent">
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                style={StyleSheet.absoluteFill}
              />
              <View className="flex-row items-center justify-between mb-2">
                <AppText className="text-accent-foreground text-sm font-medium">
                  Tổng số dư khả dụng
                </AppText>
                <PressableFeedback onPress={() => setShowBalance(!showBalance)}>
                  <IconSymbol name={showBalance ? 'eye' : 'eye.slash'} size={20} color="white" />
                </PressableFeedback>
              </View>

              <View className="flex-row items-baseline gap-1 mb-6">
                <AppText className="text-accent-foreground text-4xl font-bold">
                  {showBalance ? '1.250.000' : '••••••••'}
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
                    <AppText className="text-accent-foreground/80 text-[10px] font-bold uppercase">
                      BẠN ĐƯỢC TRẢ
                    </AppText>
                  </View>
                  <AppText className="text-accent-foreground text-base font-bold">+ 1.450.000 đ</AppText>
                </View>
                <Divider orientation="vertical" className="bg-divider" />
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <View className="w-5 h-5 bg-warning rounded-full items-center justify-center">
                      <IconSymbol name="arrow.up.right" size={10} color="white" />
                    </View>
                    <AppText className="text-accent-foreground/80 text-[10px] font-bold uppercase">
                      BẠN NỢ
                    </AppText>
                  </View>
                  <AppText className="text-accent-foreground text-base font-bold">- 200.000 đ</AppText>
                </View>
              </View>
            </View>
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
            <AppText className="text-lg font-bold mb-4">Hoạt động gần đây</AppText>
            <View className="gap-3">
              <Card variant="default" className="p-4 rounded-2xl border border-divider/5">
                <View className="flex-row items-center gap-3">
                  <Avatar size="md" alt="Nam" className="rounded-full">
                    <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=nam' }} />
                    <Avatar.Fallback>N</Avatar.Fallback>
                  </Avatar>
                  <View className="flex-1">
                    <AppText className="font-bold">
                      Nam <AppText className="font-normal text-muted">đã thanh toán cho bạn</AppText>
                    </AppText>
                    <AppText className="text-xs text-muted mt-0.5">
                      trong nhóm <AppText className="text-accent">Ăn trưa Cty</AppText> • 5h trước
                    </AppText>
                  </View>
                  <View className="items-end">
                    <AppText className="text-success text-xs font-bold uppercase mb-1">
                      ĐÃ NHẬN
                    </AppText>
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
                    <AppText className="font-bold">
                      Bạn <AppText className="font-normal text-muted">đã tạo nhóm mới</AppText>
                    </AppText>
                    <AppText className="text-xs text-muted mt-0.5">
                      Tiền nhà trọ • 1 ngày trước
                    </AppText>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}
