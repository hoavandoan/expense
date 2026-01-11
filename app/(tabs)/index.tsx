import { ActivityItem } from "@/components/activity-item";
import { AppText } from "@/components/app-text";

import {
  AnimatedScrollView,
  HeaderComponentWrapper,
  HeaderNavBar,
} from "@/components/parallax-header";
import { ActionIcon } from "@/components/ui/action-icon";
import { GroupCard } from "@/components/ui/group-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CATEGORY_CONFIG } from "@/constants";
import { useExpensesRealtime, useGroups, useGroupsRealtime, useRecentExpenses } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Avatar,
  Button,
  PressableFeedback,
  Spinner,
  Surface,
  useThemeColor,
} from "heroui-native";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showBalance] = useState(true);

  // Auth state from Zustand
  const { user, isAuthenticated } = useAuthStore();

  // Fetch groups from Supabase with real-time updates
  const { data: groups, isLoading } = useGroups();

  // Fetch recent expenses
  const { data: recentExpenses, isLoading: isLoadingExpenses } =
    useRecentExpenses(5);

  // Enable real-time subscriptions for groups
  useGroupsRealtime();

  // Enable real-time subscriptions for expenses (updates "Hoạt động gần đây")
  useExpensesRealtime();

  const accent = useThemeColor("accent");
  const foreground = useThemeColor("foreground");

  // Calculate total balance across all groups
  const balanceStats = useMemo(() => {
    if (!groups || !user) return { totalOwed: 0, totalOwing: 0, balance: 0 };

    let totalOwed = 0; // Others owe to user
    let totalOwing = 0; // User owes to others

    groups.forEach((group: any) => {
      group.expenses?.forEach((expense: any) => {
        if (expense.paid_by === user.id) {
          // User paid, others owe to user
          expense.expense_splits?.forEach((split: any) => {
            if (split.user_id !== user.id) {
              totalOwed += split.amount;
            }
          });
        } else {
          // Someone else paid, check if user owes
          expense.expense_splits?.forEach((split: any) => {
            if (split.user_id === user.id) {
              totalOwing += split.amount;
            }
          });
        }
      });
    });

    return {
      totalOwed,
      totalOwing,
      balance: totalOwed - totalOwing,
    };
  }, [groups, user]);

  const HOME_HEADER_HEIGHT = 140;

  const renderTopNavBarComponent = () => (
    <HeaderNavBar useBlur={true} className="border-b border-divider/10">
      <View className="flex-row items-center h-full w-full">
        <View className="flex-1 items-start">
          <PressableFeedback
            onPress={() => router.push("/settings")}
            className="rounded-full"
          >
            <Avatar size="sm" alt="User profile" className="bg-surface size-8">
              {isAuthenticated && user?.avatarUrl ? (
                <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <IconSymbol name="person" size={14} color={accent} />
                </Avatar.Fallback>
              )}
            </Avatar>
          </PressableFeedback>
        </View>

        <View className="flex-2 items-center">
          {/* <AppText className="text-lg font-bold text-foreground">
            SplitSmart
          </AppText> */}
        </View>

        <View className="flex-1 flex-row justify-end gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => router.push("/search" as any)}
                  className="w-10 h-10 bg-black/20 border border-white/10"
          >
            <IconSymbol name="magnifyingglass" size={18} color={foreground} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => router.push("/notifications" as any)}
                  className="w-10 h-10 bg-black/20 border border-white/10"
          >
            <IconSymbol name="bell" size={18} color={foreground} />
          </Button>
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
            onPress={() => router.push("/settings")}
            className="rounded-full bg-accent"
          >
            <Avatar
              size="md"
              alt="User profile"
              className="bg-surface size-12 shadow-sm"
            >
              {isAuthenticated && user?.avatarUrl ? (
                <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <IconSymbol name="person" size={20} color={accent} />
                </Avatar.Fallback>
              )}
            </Avatar>
          </PressableFeedback>
          <View>
            <AppText className="text-muted text-[13px]">Xin chào,</AppText>
            <AppText className="text-lg font-bold text-foreground">
              {user?.name || "Bạn"}
            </AppText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <PressableFeedback
            onPress={() => router.push("/search" as any)}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-divider/10"
          >
            <IconSymbol name="magnifyingglass" size={20} color={foreground} />
          </PressableFeedback>
          <View>
            <PressableFeedback
              onPress={() => router.push("/notifications" as any)}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-divider/10"
            >
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
        <View>
          {/* Hero Balance Section with Accent Gradient */}
          <View className="px-6">
            <Surface
              variant="default"
              className="p-8 rounded-3xl shadow-2xl overflow-hidden bg-accent relative"
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="flex-row items-center justify-between mb-4">
                <AppText className="text-white/80 text-sm font-semibold tracking-wider uppercase">
                  Số dư của bạn
                </AppText>
                <PressableFeedback className="w-10 h-10 items-center justify-center rounded-full bg-white/10">
                  <IconSymbol
                    name={showBalance ? "eye" : "eye.slash"}
                    size={20}
                    color="white"
                  />
                </PressableFeedback>
              </View>

              <View className="flex-row items-baseline gap-2 mb-8">
                <AppText
                  className="text-white text-5xl font-black"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {showBalance
                    ? formatCurrency(balanceStats.balance, "VND")
                        .replace("₫", "")
                        .trim()
                    : "••••••••"}
                </AppText>
                <AppText className="text-white/90 text-2xl font-bold">
                  đ
                </AppText>
              </View>

              {/* Nested Stats with glassmorphism feel */}
              <View className="flex-row bg-black/10 rounded-2xl p-5 gap-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-6 h-6 bg-success/20 rounded-full items-center justify-center">
                      <IconSymbol
                        name="arrow.down.left"
                        size={12}
                        color="#4ade80"
                      />
                    </View>
                    <AppText className="text-white/70 text-[11px] font-bold uppercase tracking-tight">
                      Bạn được trả
                    </AppText>
                  </View>
                  <AppText
                    className="text-white text-lg font-bold"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {showBalance
                      ? `+ ${formatCurrency(balanceStats.totalOwed, "VND")
                          .replace("₫", "")
                          .trim()}`
                      : "••••"}
                  </AppText>
                </View>

                <View className="w-px bg-white/10 h-10 self-center" />

                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-6 h-6 bg-danger/20 rounded-full items-center justify-center">
                      <IconSymbol
                        name="arrow.up.right"
                        size={12}
                        color="#fb7185"
                      />
                    </View>
                    <AppText className="text-white/70 text-[11px] font-bold uppercase tracking-tight">
                      Bạn nợ
                    </AppText>
                  </View>
                  <AppText
                    className="text-white text-lg font-bold"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {showBalance
                      ? `- ${formatCurrency(balanceStats.totalOwing, "VND")
                          .replace("₫", "")
                          .trim()}`
                      : "••••"}
                  </AppText>
                </View>
              </View>
            </Surface>
          </View>

          {/* Quick Actions Row */}
          <View className="flex-row justify-center px-6 my-8 gap-4">
            <ActionIcon
              name="creditcard"
              label="Chi tiêu"
              onPress={() => router.push("/add-expense")}
            />
            <ActionIcon
              name="plus"
              label="Tạo nhóm"
              onPress={() => router.push("/add-group")}
            />
            <ActionIcon
              name="qrcode"
              label="Tham gia"
              onPress={() => router.push("/join-group")}
            />
          </View>

          {/* Horizontal Groups Section */}
          <View className="mb-8 w-full">
            <View className="px-6 flex-row items-center justify-between mb-4">
              <AppText className="text-lg font-bold">Nhóm của bạn</AppText>
              <PressableFeedback>
                <AppText className="text-accent font-semibold text-sm">
                  Xem tất cả
                </AppText>
              </PressableFeedback>
            </View>
            {isLoading ? (
              <View className="h-32 items-center justify-center">
                <Spinner size="md" color={accent} />
              </View>
            ) : groups && groups.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
              >
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    variant="horizontal"
                    title={group.name}
                    memberCount={group.memberCount || 0}
                    balance={group.totalExpenses || 0}
                    members={
                      group.group_members?.map((m: any) => ({
                        id: m.user_id,
                        name: m.user?.name || "",
                        avatarUrl: m.user?.avatar_url,
                      })) || []
                    }
                    bgImage={group.cover_image_url}
                    onPress={() => router.push(`/group/${group.id}` as any)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="mx-6 p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                <IconSymbol name="person.3.fill" size={40} color={accent} />
                <AppText className="text-foreground font-semibold mt-3">
                  Chưa có nhóm nào
                </AppText>
                <AppText className="text-muted text-sm text-center mt-1">
                  Tạo nhóm mới hoặc tham gia nhóm bạn bè
                </AppText>
              </View>
            )}
          </View>

          {/* Smart Insights Card */}
          {/* <View className="px-5 mb-8">
            <PressableFeedback>
              <Surface variant="default" className="bg-accent/5 p-5 rounded-3xl flex-row items-center justify-between overflow-hidden relative">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-2 h-2 rounded-full bg-accent" />
                    <AppText className="text-accent font-bold text-[11px] uppercase tracking-wider">Phân tích thông minh</AppText>
                  </View>
                  <AppText className="text-foreground font-bold text-[15px] mb-1">Cân nhắc tạm dừng các dịch vụ chưa sử dụng.</AppText>
                  <AppText className="text-muted text-[13px]">Bạn đã chi tiêu nhiều hơn 20% cho các đăng ký thuê bao trong tháng này.</AppText>
                </View>
                <View className="w-16 h-16 items-center justify-center bg-accent/10 rounded-2xl rotate-12">
                  <IconSymbol name="chart.bar.fill" size={32} color={accent} />
                </View>
              </Surface>
            </PressableFeedback>
          </View> */}

          {/* Recent Activity Section */}
          <View className="px-6 mb-10">
            <View className="flex-row items-center justify-between mb-4">
              <AppText className="text-lg font-bold">Hoạt động gần đây</AppText>
              <PressableFeedback onPress={() => router.push("/activity")}>
                <AppText className="text-accent font-semibold text-sm">
                  Xem tất cả
                </AppText>
              </PressableFeedback>
            </View>
            <View className="gap-3">
              {isLoadingExpenses ? (
                <View className="h-24 items-center justify-center">
                  <Spinner size="sm" color={accent} />
                </View>
              ) : recentExpenses && recentExpenses.length > 0 ? (
                recentExpenses.map((expense: any) => {
                  const categoryConfig =
                    CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;
                  const isMe = expense.paid_by === user?.id;

                  return (
                    <ActivityItem
                      key={expense.id}
                      user={{
                        name: isMe
                          ? "Bạn"
                          : expense.paid_by_user?.name || "Ai đó",
                        avatar: expense.paid_by_user?.avatar_url || "",
                      }}
                      action="đã thêm"
                      subject={expense.title}
                      group={expense.group?.name || "Nhóm"}
                      groupIcon="person.3.fill"
                      amount={formatCurrency(
                        expense.amount,
                        expense.group?.currency || "VND"
                      )}
                      status=""
                      typeIcon={categoryConfig.icon}
                      typeColor={categoryConfig.bg}
                      iconColor={categoryConfig.color}
                      isMe={isMe}
                    />
                  );
                })
              ) : (
                <View className="p-6 rounded-2xl bg-surface border border-divider/10 items-center">
                  <IconSymbol name="clock.fill" size={32} color={accent} />
                  <AppText className="text-muted text-center mt-2">
                    Chưa có hoạt động nào
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}
