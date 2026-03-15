import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CATEGORY_CONFIG } from "@/constants";
import { useRecentActivity, useTranslation } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { ActivityLog } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { FlashList } from "@shopify/flash-list";
import { Avatar, cn, ListGroup, SearchField, Separator, Spinner, Tabs, useThemeColor } from "heroui-native";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
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

// --- Memoized Activity Row ---

interface ActivityRowProps {
  activity: ActivityLog;
  isLast: boolean;
  isMe: boolean;
  t: (key: string, options?: any) => string;
}

const ActivityRow = React.memo(({ activity, isLast, isMe, t }: ActivityRowProps) => {
  const muted = useThemeColor("muted");
  const activityIcon = getActivityIcon(activity.actionType);
  const { action, subject } = formatActivityAction(activity.actionType, activity.metadata, t);
  const categoryConfig = activity.metadata.category
    ? CATEGORY_CONFIG[activity.metadata.category as string] || CATEGORY_CONFIG.other
    : activityIcon;

  const userName = isMe ? t("activity.you") : activity.user?.name || t("activity.someone");
  const groupName = activity.group?.name || t("activity.group");

  const amount = activity.metadata.amount
    ? formatCurrency(activity.metadata.amount as number, activity.group?.currency || "VND")
    : undefined;

  return (
    <>
      <ListGroup.Item>
        <ListGroup.ItemPrefix>
          <View className="relative">
            <Avatar size="sm" alt={userName}>
              {activity.user?.avatarUrl ? (
                <Avatar.Image source={{ uri: activity.user.avatarUrl }} />
              ) : (
                <Avatar.Fallback className="bg-surface-secondary">
                  {userName.charAt(0)}
                </Avatar.Fallback>
              )}
            </Avatar>
            <View
              className={cn("absolute w-5 h-5 -bottom-0.5 -right-0.5 z-10 rounded-full items-center justify-center bg-surface")}
            >
              <IconSymbol name={categoryConfig.icon as any} size={14} color={categoryConfig.color} />
            </View>
          </View>
        </ListGroup.ItemPrefix>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle className="text-[15px]" numberOfLines={2}>
            <AppText className="font-bold">{userName}</AppText>
            <AppText className="text-foreground/70"> {action}</AppText>
            {subject && <AppText className="font-semibold"> {subject}</AppText>}
          </ListGroup.ItemTitle>
          <ListGroup.ItemDescription>
            <View className="flex-row items-center mt-0.5">
              <IconSymbol name="person.3.fill" size={12} color={muted} />
              <AppText className="text-muted text-xs ml-1 font-medium">{groupName}</AppText>
            </View>
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        {amount ? (
          <ListGroup.ItemSuffix>
            <AppText
              className={cn(
                "text-sm font-semibold",
                amount.startsWith("+") ? "text-success" : "text-foreground",
              )}
            >
              {amount}
            </AppText>
          </ListGroup.ItemSuffix>
        ) : (
          <ListGroup.ItemSuffix>
            <View />
          </ListGroup.ItemSuffix>
        )}
      </ListGroup.Item>
      {!isLast && <Separator className="mx-4 bg-separator/40" />}
    </>
  );
});

// --- Types ---

type ActivityListItem =
  | { type: "header"; title: string; id: string }
  | { type: "section-group"; activities: ActivityLog[]; id: string };

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
      flattened.push({ type: "section-group", activities: groups[key], id: `group-${key}` });
    });

    return flattened;
  }, [activities, activeFilter, searchQuery]);

  const renderItem = useCallback(({ item }: { item: ActivityListItem }) => {
    if (item.type === "header") {
      return (
        <AppText className="text-[13px] font-bold text-muted uppercase tracking-widest mb-3 mt-4 ml-1">
          {item.title}
        </AppText>
      );
    }

    return (
      <ListGroup className="mb-4 rounded-2xl">
        {item.activities.map((activity, index) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
            isLast={index === item.activities.length - 1}
            isMe={activity.userId === user?.id}
            t={t}
          />
        ))}
      </ListGroup>
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
          <SearchField value={searchQuery} onChange={setSearchQuery}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder={t("activity.search_placeholder")}
                style={{ fontSize: 16 }}
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
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
          getItemType={(item) => item.type}
          onRefresh={refetch}
          refreshing={isRefetching}
          extraData={t}
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
          contentContainerClassName="px-6 pb-20"
        />
      )}
    </View>
  );
}
