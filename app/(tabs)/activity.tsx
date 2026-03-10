import { ActivityItem } from "@/components/activity-item";
import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CATEGORY_CONFIG } from "@/constants";
import { useRecentActivity, useTranslation } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { FlashList } from "@shopify/flash-list";
import { cn, Input, Spinner, Tabs, TextField, useThemeColor } from "heroui-native";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTERS = [
  { id: "all", labelKey: "activity.filter_all", icon: "list.bullet" as any, actionTypes: [] },
  {
    id: "expense",
    labelKey: "activity.filter_expense",
    icon: "doc.text.fill" as any,
    actionTypes: ["expense_created", "expense_updated", "expense_deleted"],
  },
  {
    id: "payment",
    labelKey: "activity.filter_payment",
    icon: "checkmark.circle.fill" as any,
    actionTypes: [
      "settlement_created",
      "settlement_completed",
      "settlement_rejected",
    ],
  },
];

const getActivityIcon = (actionType: string) => {
  const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
    expense_created: {
      icon: "doc.text.fill",
      color: "#0070F3",
      bg: "bg-accent/10",
    },
    expense_updated: {
      icon: "doc.text.fill",
      color: "#0070F3",
      bg: "bg-accent/10",
    },
    expense_deleted: {
      icon: "trash.fill",
      color: "#F31260",
      bg: "bg-danger/10",
    },
    settlement_created: { icon: "bank", color: "#17C964", bg: "bg-success/10" },
    settlement_completed: {
      icon: "checkmark.circle.fill",
      color: "#17C964",
      bg: "bg-success/10",
    },
    settlement_rejected: {
      icon: "xmark.circle.fill",
      color: "#F31260",
      bg: "bg-danger/10",
    },
    group_member_added: {
      icon: "person.fill.badge.plus",
      color: "#71717A",
      bg: "bg-default/10",
    },
    group_member_removed: {
      icon: "person.fill.badge.minus",
      color: "#71717A",
      bg: "bg-default/10",
    },
    group_member_role_changed: {
      icon: "person.2.fill",
      color: "#71717A",
      bg: "bg-default/10",
    },
    group_updated: {
      icon: "gearshape.fill",
      color: "#71717A",
      bg: "bg-default/10",
    },
    debt_assignment_created: {
      icon: "arrow.triangle.2.circlepath",
      color: "#7928CA",
      bg: "bg-accent/10",
    },
    debt_assignment_updated: {
      icon: "arrow.triangle.2.circlepath",
      color: "#7928CA",
      bg: "bg-accent/10",
    },
  };
  return (
    iconMap[actionType] || {
      icon: "ellipsis.circle.fill",
      color: "#71717A",
      bg: "bg-default/10",
    }
  );
};

const formatActivityAction = (
  actionType: string,
  metadata: Record<string, unknown>,
  t: (key: string, options?: any) => string
): { action: string; subject?: string } => {
  const actionMap: Record<
    string,
    (meta: Record<string, unknown>) => { action: string; subject?: string }
  > = {
    expense_created: (meta) => ({
      action: t("activity.actions.expense_created"),
      subject: meta.title as string,
    }),
    expense_updated: (meta) => ({
      action: t("activity.actions.expense_updated"),
      subject: meta.title as string,
    }),
    expense_deleted: (meta) => ({
      action: t("activity.actions.expense_deleted"),
      subject: meta.title as string,
    }),
    settlement_created: () => ({ action: t("activity.actions.settlement_created") }),
    settlement_completed: () => ({ action: t("activity.actions.settlement_completed") }),
    settlement_rejected: () => ({ action: t("activity.actions.settlement_rejected") }),
    group_member_added: () => ({ action: t("activity.actions.group_member_added") }),
    group_member_removed: () => ({ action: t("activity.actions.group_member_removed") }),
    group_member_role_changed: () => ({ action: t("activity.actions.group_member_role_changed") }),
    group_updated: () => ({ action: t("activity.actions.group_updated") }),
    debt_assignment_created: () => ({ action: t("activity.actions.debt_assignment_created") }),
    debt_assignment_updated: () => ({ action: t("activity.actions.debt_assignment_updated") }),
  };

  const formatter = actionMap[actionType];
  return formatter ? formatter(metadata) : { action: t("activity.actions.default") };
};

const formatTimeAgo = (dateString: string, t: (key: string, options?: any) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return t("activity.time.just_now");
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return t("activity.time.minutes_ago", { count: diffInMinutes });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return t("activity.time.hours_ago", { count: diffInHours });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return t("activity.time.yesterday");
  }
  if (diffInDays < 7) {
    return t("activity.time.days_ago", { count: diffInDays });
  }

  return date.toLocaleDateString("vi-VN");
};

type ActivityListItem = 
  | { type: "header"; title: string; id: string }
  | { type: "activity"; data: any; id: string };

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const { data: activities, isLoading, error, refetch, isRefetching } = useRecentActivity(50);

  const flattenedActivities = useMemo(() => {
    if (!activities) return [];

    let filtered = activities;

    // Filter by action type
    if (activeFilter !== "all") {
      const filterConfig = FILTERS.find((f) => f.id === activeFilter);
      if (filterConfig && filterConfig.actionTypes.length > 0) {
        filtered = filtered.filter((a) =>
          filterConfig.actionTypes.includes(a.actionType)
        );
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const userName = a.user?.name?.toLowerCase() || "";
        const groupName = a.group?.name?.toLowerCase() || "";
        const metadataTitle =
          (a.metadata?.title as string)?.toLowerCase() || "";
        return (
          userName.includes(query) ||
          groupName.includes(query) ||
          metadataTitle.includes(query)
        );
      });
    }

    // Group and flatten
    const groups: Record<string, any[]> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filtered.forEach((activity) => {
      const activityDate = new Date(activity.createdAt);
      activityDate.setHours(0, 0, 0, 0);

      let groupKey: string;
      if (activityDate.getTime() === today.getTime()) {
        groupKey = t("activity.time.today");
      } else if (activityDate.getTime() === yesterday.getTime()) {
        groupKey = t("activity.time.yesterday");
      } else {
        groupKey = activityDate.toLocaleDateString("vi-VN");
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });

    const keyToday = t("activity.time.today");
    const keyYesterday = t("activity.time.yesterday");

    const groupKeys = Object.keys(groups).sort((a, b) => {
      if (a === keyToday) return -1;
      if (b === keyToday) return 1;
      if (a === keyYesterday) return -1;
      if (b === keyYesterday) return 1;
      return b.localeCompare(a);
    });

    const flattened: ActivityListItem[] = [];
    groupKeys.forEach((key) => {
      flattened.push({ type: "header", title: key, id: `header-${key}` });
      groups[key].forEach((activity) => {
        flattened.push({ type: "activity", data: activity, id: activity.id });
      });
    });

    return flattened;
  }, [activities, activeFilter, searchQuery]);

  const renderItem = useCallback(({ item, index }: { item: ActivityListItem; index: number }) => {
    if (item.type === "header") {
      return (
        <Animated.View 
        entering={FadeInDown.delay(1000 + index * 100).springify()}
        exiting={FadeOut.duration(200)}
        className="mb-3"
        >
          <AppText className="text-xl font-bold text-foreground mb-5 px-6 mt-8">
            {item.title}
          </AppText>
        </Animated.View>
      );
    }

    const { data: activity } = item;
    const isMe = activity.userId === user?.id;
    const activityIcon = getActivityIcon(activity.actionType);
    const { action, subject } = formatActivityAction(
      activity.actionType,
      activity.metadata,
      t
    );
    const categoryConfig = activity.metadata.category
      ? CATEGORY_CONFIG[activity.metadata.category as string] ||
        CATEGORY_CONFIG.other
      : activityIcon;

    let amount: string | undefined;
    if (activity.metadata.amount) {
      const amountNum = activity.metadata.amount as number;
      amount = formatCurrency(
        amountNum,
        activity.group?.currency || "VND"
      );
    }

    return (
      <Animated.View 
        className="mb-4" 
        entering={FadeInDown.delay(1000 + index * 100).springify()}
        exiting={FadeOut.duration(200)}
      >
        <ActivityItem
          userName={isMe ? t("activity.you") : activity.user?.name || t("activity.someone")}
          userAvatar={activity.user?.avatarUrl || ""}
          action={action}
          subject={subject}
          groupName={activity.group?.name || t("activity.group")}
          groupIcon="person.3.fill"
          amount={amount}
          typeIcon={categoryConfig.icon}
          typeColor={categoryConfig.bg}
          iconColor={categoryConfig.color}
          isMe={isMe}
        />
      </Animated.View>
    );
  }, [user?.id, t]);

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <View
          style={{ paddingTop: insets.top + 20 }}
          className="pb-4 bg-surface"
        >
          <AppText className="text-3xl font-extrabold text-foreground mb-6 px-6">
            {t("activity.title")}
          </AppText>
        </View>
        <ErrorState
          title={t("activity.error_loading")}
          message={error instanceof Error ? error.message : t("activity.error_occurred")}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 20 }} className="pb-4 bg-surface">
        <AppText className="text-3xl font-extrabold text-foreground mb-6 px-6">
          {t("activity.title")}
        </AppText>

        <View className="px-6 mb-6">
          <TextField className="bg-default/5 rounded-2xl overflow-hidden">
            <View className="justify-center">
            <Input
              placeholder={t("activity.search_placeholder")}
              className="text-base pl-12 h-14"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
              <View className="absolute left-4" pointerEvents="none">
                <IconSymbol name="magnifyingglass" size={20} color={muted} />
              </View>
            </View>
          </TextField>
        </View>

        <View className="flex-row justify-center px-6">
          <Tabs
            value={activeFilter}
            onValueChange={setActiveFilter}
            variant="primary"
          >
            <Tabs.List>
              <Tabs.Indicator className="bg-accent shadow-none" />
              {FILTERS.map((filter) => (
                <Tabs.Trigger
                  key={filter.id}
                  value={filter.id}
                  className="px-6 py-2 rounded-full"
                >
                  {({ isSelected }) => (
                    <Tabs.Label
                      className={cn(
                        "font-bold text-sm",
                        isSelected ? "text-white" : "text-foreground"
                      )}
                    >
                      {t((filter as any).labelKey)}
                    </Tabs.Label>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color={accent} />
        </View>
      ) : (
        <FlashList
          data={flattenedActivities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          // @ts-expect-error - FlashList types lack full support
          estimatedItemSize={100}
          getItemType={(item) => item.type}
          onRefresh={refetch}
          refreshing={isRefetching}
          extraData={t}
          className="px-6"
          ListEmptyComponent={
            <EmptyState
              icon="clock.fill"
              title={
                searchQuery ? t("activity.empty_search_title") : t("activity.empty_title")
              }
              description={
                searchQuery
                  ? t("activity.empty_search_desc")
                  : t("activity.empty_desc")
              }
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        />
      )}
    </View>
  );
}
