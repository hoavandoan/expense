import { AppText } from '@/components/app-text';

import {
    AnimatedScrollView,
    AnimatedScrollViewTitle,
    AnimatedScrollViewTitleWrapper,
    HeaderComponentWrapper,
    HeaderNavBar,
} from '@/components/parallax-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PendingSettlements } from '@/components/ui/pending-settlements';
import { Timeline, type TimelineItem } from '@/components/ui/timeline';
import { useGroup } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatCurrency } from '@/lib/utils';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Card, cn, Divider, PressableFeedback, Skeleton, useThemeColor } from 'heroui-native';
import React, { useMemo } from 'react';
import { RefreshControl, View } from 'react-native';

interface MemberWithBalance {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  balance: number;
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor('accent');
  const { user } = useAuthStore();

  const { data: group, isLoading, refetch, isRefetching } = useGroup(id as string);

  // Calculate user's balance in this group
  const userStats = useMemo(() => {
    if (!group || !user) return { totalPaid: 0, totalOwed: 0, balance: 0 };

    let totalPaid = 0;
    let totalOwed = 0;

    group.expenses?.forEach((expense: any) => {
      // Money user has paid
      if (expense.paid_by === user.id) {
        totalPaid += expense.amount;
      }

      // Money user owes from splits
      expense.expense_splits?.forEach((split: any) => {
        if (split.user_id === user.id) {
          totalOwed += split.amount;
        }
      });
    });

    return {
      totalPaid,
      totalOwed,
      balance: totalPaid - totalOwed,
    };
  }, [group, user]);

  // Transform members with balance calculation
  const membersWithBalance = useMemo(() => {
    const groupData = group as any;
    if (!groupData?.group_members) return [];

    return groupData.group_members.map((member: any) => {
      let balance = 0;

      groupData.expenses?.forEach((expense: any) => {
        // Money this member has paid
        if (expense.paid_by === member.user_id) {
          balance += expense.amount;
        }

        // Money this member owes from splits
        expense.expense_splits?.forEach((split: any) => {
          if (split.user_id === member.user_id) {
            balance -= split.amount;
          }
        });
      });

      return {
        id: member.user_id,
        name: member.user?.name || 'Thành viên',
        avatarUrl: member.user?.avatar_url,
        role: member.role,
        balance,
      };
    });
  }, [group]);

  // Transform expenses to activity timeline
  const activities: TimelineItem[] = useMemo(() => {
    if (!group?.expenses) return [];

    return group.expenses.slice(0, 5).map((expense: any, index: number) => ({
      id: expense.id,
      title: `${expense.paid_by_user?.name || 'Ai đó'} đã thêm ${expense.title}`,
      description: expense.description || undefined,
      timestamp: new Date(expense.created_at).toLocaleDateString('vi-VN'),
      icon: getCategoryIcon(expense.category),
      status: index === 0 ? 'current' : 'complete',
      meta: formatCurrency(expense.amount, group.currency || 'VND'),
    }));
  }, [group]);

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-6">
        <Skeleton className="w-full h-64 rounded-2xl mb-6" />
        <Skeleton className="w-3/4 h-8 rounded-xl mb-4" />
        <Skeleton className="w-1/2 h-6 rounded-xl mb-8" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <IconSymbol name="xmark.circle.fill" size={48} color={accent} />
        <AppText className="text-lg font-bold mt-4">Không tìm thấy nhóm</AppText>
        <PressableFeedback onPress={() => router.back()} className="mt-4">
          <AppText className="text-accent font-bold">Quay lại</AppText>
        </PressableFeedback>
      </View>
    );
  }

  const groupData = group as any;
  const coverImage = groupData?.cover_image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000';

  return (
    <View className="flex-1 bg-black">
      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        headerMaxHeight={300}
        topBarHeight={100}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        renderHeaderNavBarComponent={() => (
          <HeaderNavBar className="bg-transparent">
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
              <PressableFeedback
                className="w-10 h-10 rounded-full bg-black/20 items-center justify-center border border-white/10"
                onPress={() => router.push(`/group/${id}/settings`)}
              >
                <IconSymbol name="gearshape.fill" size={20} color="white" />
              </PressableFeedback>
            </View>
          </HeaderNavBar>
        )}
        renderTopNavBarComponent={() => (
          <HeaderNavBar useBlur={true}>
            <PressableFeedback onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="white" />
            </PressableFeedback>
            <AppText className="text-white text-lg font-bold">{group.name}</AppText>
            <PressableFeedback onPress={() => router.push(`/group/${id}/settings`)}>
              <IconSymbol name="ellipsis" size={20} color="white" />
            </PressableFeedback>
          </HeaderNavBar>
        )}
        renderOveralComponent={() => (
          <AnimatedScrollViewTitleWrapper className="px-6 pb-6">
            <AnimatedScrollViewTitle size={42} className="text-white font-bold tracking-tighter">
              {group.name}
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
              source={{ uri: coverImage }}
              style={{ width: '100%', height: 300 }}
              contentFit="cover"
            />
          </HeaderComponentWrapper>
        )}
      >
        <View className="px-6 pt-4 bg-background">
          {/* Info Badges */}
          <View className="flex-row gap-3 mb-8">
            <View className="bg-surface-secondary px-4 py-2 rounded-full border border-divider/10">
              <AppText className="text-muted text-[10px] font-bold uppercase tracking-widest">
                THÀNH VIÊN: {groupData?.group_members?.length || 0}
              </AppText>
            </View>
            <View className={cn(
              "px-4 py-2 rounded-full border",
              userStats.balance >= 0 ? "bg-success/10 border-success/20" : "bg-danger/10 border-danger/20"
            )}>
              <AppText className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                userStats.balance >= 0 ? "text-success" : "text-danger"
              )}>
                {userStats.balance >= 0 ? 'BẠN NHẬN LẠI' : 'BẠN NỢ'}: {formatCurrency(Math.abs(userStats.balance), group.currency || 'VND')}
              </AppText>
            </View>
          </View>

          {/* Stats Card */}
          <View className="mb-10">
            <Card variant="default"
              className="p-8 rounded-2xl shadow-xl overflow-hidden bg-accent"
            >
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <AppText className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">BẠN CHI</AppText>
                  <AppText className="text-white text-2xl font-bold">
                    {formatCurrency(userStats.totalPaid, group.currency || 'VND')}
                  </AppText>
                </View>
                <Divider orientation="vertical" className="bg-white/20" />
                <View className="flex-1">
                  <AppText className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                    {userStats.balance >= 0 ? 'BẠN NHẬN LẠI' : 'BẠN NỢ'}
                  </AppText>
                  <AppText className="text-white text-2xl font-bold">
                    {formatCurrency(Math.abs(userStats.balance), group.currency || 'VND')}
                  </AppText>
                </View>
              </View>

              <View className="mt-8 flex-row gap-2">
                <PressableFeedback className="flex-1" onPress={() => router.push(`/(modal)/add-expense?groupId=${id}` as any)}>
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="plus" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">CHI TIÊU</AppText>
                  </View>
                </PressableFeedback>
                <PressableFeedback className="flex-1" onPress={() => router.push(`/(modal)/settle-up?groupId=${id}` as any)}>
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="qrcode" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">TẤT TOÁN</AppText>
                  </View>
                </PressableFeedback>
                <PressableFeedback className="flex-1" onPress={() => router.push(`/group/${id}/stats`)}>
                  <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                    <IconSymbol name="chart.bar.fill" size={20} color="white" />
                    <AppText className="text-white text-[10px] font-bold mt-1 uppercase">BÁO CÁO</AppText>
                  </View>
                </PressableFeedback>
              </View>
            </Card>
          </View>

          {/* Pending Settlements */}
          <PendingSettlements groupId={id as string} />

          {/* Members List */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-6">
              <AppText className="text-xl font-bold text-foreground">Thành viên nợ/trả</AppText>
              <PressableFeedback onPress={() => router.push(`/group/${id}/members`)}>
                <AppText className="text-accent font-bold text-sm">Xem tất cả</AppText>
              </PressableFeedback>
            </View>

            <View className="gap-3">
              {membersWithBalance.length === 0 ? (
                <View className="p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                  <AppText className="text-muted">Chưa có thành viên nào</AppText>
                </View>
              ) : (
                membersWithBalance.slice(0, 4).map((member: MemberWithBalance) => (
                  <Card key={member.id} variant="default" className="p-4 rounded-2xl bg-surface border border-divider/10">
                    <View className="flex-row items-center">
                      <Avatar size="md" alt={member.name} className="mr-4">
                        {member.avatarUrl ? (
                          <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                            <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                          </Avatar.Image>
                        ) : (
                          <Avatar.Fallback className="bg-accent/10">
                            <AppText className="font-bold text-accent">{member.name.charAt(0)}</AppText>
                          </Avatar.Fallback>
                        )}
                      </Avatar>
                      <View className="flex-1">
                        <AppText className="font-bold text-base text-foreground">
                          {member.name}
                          {member.id === user?.id && ' (Bạn)'}
                        </AppText>
                        <AppText className="text-muted text-xs capitalize">{member.role}</AppText>
                      </View>
                      <View className="items-end">
                        <AppText className={cn(
                          'font-bold text-base',
                          member.balance >= 0 ? 'text-success' : 'text-danger'
                        )}>
                          {member.balance >= 0 ? '+' : ''}{formatCurrency(member.balance, group.currency || 'VND')}
                        </AppText>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>
          </View>

          {/* Recent Activity */}
          <View className="pb-20">
            <View className="flex-row items-center justify-between mb-6">
              <AppText className="text-xl font-bold text-foreground">Hoạt động gần đây</AppText>
              <PressableFeedback onPress={() => router.push(`/group/${id}/expenses` as any)}>
                <AppText className="text-accent font-bold text-sm">Xem tất cả</AppText>
              </PressableFeedback>
            </View>
            {activities.length === 0 ? (
              <View className="p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                <AppText className="text-muted">Chưa có hoạt động nào</AppText>
              </View>
            ) : (
              <Timeline
                items={activities}
                activeColor={accent}
                inactiveColor="#27272a"
                animationType="rotate"
              />
            )}
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}

function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    food: 'fork.knife',
    transport: 'car.fill',
    shopping: 'cart.fill',
    entertainment: 'gamecontroller.fill',
    utilities: 'bolt.fill',
    accommodation: 'house.fill',
    other: 'ellipsis.circle.fill',
  };
  return iconMap[category] || 'doc.text.fill';
}

