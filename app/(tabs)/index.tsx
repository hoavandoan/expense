import {
  BalanceCard,
  GroupsSection,
  HomeHeader,
  HomeNavbar,
  QuickActions,
  RecentActivity,
} from "@/components/home";
import { AnimatedScrollView } from "@/components/parallax-header";
import { SkiaOnboardingBackground } from "@/components/ui/skia-onboarding-background";
import {
  useGroups,
  useRecentExpenses,
  useTotalBalanceAcrossGroups,
  useUnreadNotificationsCount,
} from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useThemeColor } from "heroui-native";
import React, { useState } from "react";
import { RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [showBalance, setShowBalance] = useState(true);

  // Auth state from Zustand
  const { user, isAuthenticated } = useAuthStore();

  // Fetch data with React Query hooks
  const { data: groups, isPending: isLoadingGroups, refetch: refetchGroups } = useGroups();
  const { data: recentExpenses, isPending: isLoadingExpenses, refetch: refetchExpenses } = useRecentExpenses(10);
  const { data: unreadCount, isPending: isLoadingUnreadCount, refetch: refetchUnreadCount } = useUnreadNotificationsCount();

  // Balance statistics logic
  const balanceStats = useTotalBalanceAcrossGroups(groups, user?.id || null);
  const accent = useThemeColor("accent");

  const handleToggleBalance = () => setShowBalance((prev) => !prev);
  const handleRefresh = () => {
    refetchGroups();
    refetchExpenses();
    refetchUnreadCount();
  }

  const isRefreshing = isLoadingGroups || isLoadingExpenses || isLoadingUnreadCount;

  const HOME_HEADER_HEIGHT = 140;

  return (
    <View className="flex-1 bg-background">
      <SkiaOnboardingBackground primaryColor="success-soft-foreground" secondaryColor="background"/>
      <AnimatedScrollView
        headerMaxHeight={HOME_HEADER_HEIGHT}
        disableScale={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={accent}
            style={{ transform: [{ translateY: insets.top }] }}
          />
        }
        renderTopNavBarComponent={() => (
          <HomeNavbar
            user={user}
            isAuthenticated={isAuthenticated}
            unreadCount={unreadCount}
          />
        )}
        renderHeaderComponent={() => (
          <HomeHeader
            user={user}
            isAuthenticated={isAuthenticated}
            unreadCount={unreadCount}
          />
        )}
      >
        <View>
          <BalanceCard
            balance={balanceStats.balance}
            totalOwed={balanceStats.totalOwing}
            totalOweMe={balanceStats.totalOwed}
            selfExpenses={balanceStats.selfExpenses}
            showBalance={showBalance}
            onToggleBalance={handleToggleBalance}
          />

          <QuickActions />

          <GroupsSection groups={groups || null} isLoading={isLoadingGroups} />

          <RecentActivity
            expenses={recentExpenses || null}
            isLoading={isLoadingExpenses}
            userId={user?.id}
          />

          {/* Bottom Spacer for Floating Tab Bar */}
          <View style={{ height: 100 + insets.bottom }} />
        </View>
      </AnimatedScrollView>
    </View>
  );
}
