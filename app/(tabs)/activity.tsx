import { ActivityItem } from "@/components/activity-item";
import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CATEGORY_CONFIG } from "@/constants";
import { useRecentActivity } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { cn, Spinner, Tabs, TextField, useThemeColor } from "heroui-native";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTERS = [
  { id: "all", label: "Tất cả", icon: "list.bullet" as any, actionTypes: [] },
  {
    id: "expense",
    label: "Chi tiêu",
    icon: "doc.text.fill" as any,
    actionTypes: ["expense_created", "expense_updated", "expense_deleted"],
  },
  {
    id: "payment",
    label: "Thanh toán",
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
  metadata: Record<string, unknown>
): { action: string; subject?: string } => {
  const actionMap: Record<
    string,
    (meta: Record<string, unknown>) => { action: string; subject?: string }
  > = {
    expense_created: (meta) => ({
      action: "đã thêm",
      subject: meta.title as string,
    }),
    expense_updated: (meta) => ({
      action: "đã cập nhật",
      subject: meta.title as string,
    }),
    expense_deleted: (meta) => ({
      action: "đã xóa",
      subject: meta.title as string,
    }),
    settlement_created: () => ({ action: "đã yêu cầu thanh toán" }),
    settlement_completed: () => ({ action: "đã hoàn tất thanh toán" }),
    settlement_rejected: () => ({ action: "đã từ chối thanh toán" }),
    group_member_added: () => ({ action: "đã tham gia nhóm" }),
    group_member_removed: () => ({ action: "đã rời nhóm" }),
    group_member_role_changed: () => ({ action: "đã thay đổi vai trò" }),
    group_updated: () => ({ action: "đã cập nhật nhóm" }),
    debt_assignment_created: () => ({ action: "đã gán nợ" }),
    debt_assignment_updated: () => ({ action: "đã thay đổi gán nợ" }),
  };

  const formatter = actionMap[actionType];
  return formatter ? formatter(metadata) : { action: "đã thực hiện hành động" };
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Hôm qua";
  }
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  return date.toLocaleDateString("vi-VN");
};

const groupActivitiesByDate = (activities: any[]) => {
  const groups: Record<string, any[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  activities.forEach((activity) => {
    const activityDate = new Date(activity.createdAt);
    activityDate.setHours(0, 0, 0, 0);

    let groupKey: string;
    if (activityDate.getTime() === today.getTime()) {
      groupKey = "Hôm nay";
    } else if (activityDate.getTime() === yesterday.getTime()) {
      groupKey = "Hôm qua";
    } else {
      groupKey = activityDate.toLocaleDateString("vi-VN");
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
  });

  return groups;
};

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const foreground = useThemeColor("foreground");
  const muted = useThemeColor("muted");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();

  const { data: activities, isLoading, error, refetch } = useRecentActivity(50);

  const filteredActivities = useMemo(() => {
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

    return filtered;
  }, [activities, activeFilter, searchQuery]);

  const groupedActivities = useMemo(() => {
    return groupActivitiesByDate(filteredActivities);
  }, [filteredActivities]);

  const onRefresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const groupKeys = Object.keys(groupedActivities).sort((a, b) => {
    if (a === "Hôm nay") return -1;
    if (b === "Hôm nay") return 1;
    if (a === "Hôm qua") return -1;
    if (b === "Hôm qua") return 1;
    return b.localeCompare(a);
  });

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <View
          style={{ paddingTop: insets.top + 20 }}
          className="pb-4 bg-surface"
        >
          <AppText className="text-3xl font-extrabold text-foreground mb-6 px-6">
            Hoạt động
          </AppText>
        </View>
        <ErrorState
          title="Không thể tải hoạt động"
          message={error instanceof Error ? error.message : "Đã xảy ra lỗi"}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 20 }} className="pb-4 bg-surface">
        <AppText className="text-3xl font-extrabold text-foreground mb-6 px-6">
          Hoạt động
        </AppText>

        <View className="px-6 mb-6">
          <TextField className="bg-default/5 rounded-2xl overflow-hidden">
            <View className="justify-center">
              <TextField.Input
                placeholder="Tìm kiếm hoạt động, nhóm, bạn bè"
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
            variant="pill"
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
                      {filter.label}
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
      ) : filteredActivities.length > 0 ? (
        <ScreenScrollView
          refreshing={false}
          onRefresh={onRefresh}
          className="pt-6"
          withTabBarOffset
          withKeyboardAvoidingView
        >
          {groupKeys.map((groupTitle) => (
            <View key={groupTitle} className="mb-8">
              <AppText className="text-xl font-bold text-foreground mb-5 px-6">
                {groupTitle}
              </AppText>
              <View className="gap-4">
                {groupedActivities[groupTitle].map((activity) => {
                  const isMe = activity.userId === user?.id;
                  const activityIcon = getActivityIcon(activity.actionType);
                  const { action, subject } = formatActivityAction(
                    activity.actionType,
                    activity.metadata
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
                    <ActivityItem
                      key={activity.id}
                      user={{
                        name: isMe ? "Bạn" : activity.user?.name || "Ai đó",
                        avatar: activity.user?.avatarUrl || "",
                      }}
                      action={action}
                      subject={subject}
                      group={activity.group?.name || "Nhóm"}
                      groupIcon="person.3.fill"
                      amount={amount}
                      typeIcon={categoryConfig.icon}
                      typeColor={categoryConfig.bg}
                      iconColor={categoryConfig.color}
                      isMe={isMe}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </ScreenScrollView>
      ) : (
        <EmptyState
          icon="clock.fill"
          title={
            searchQuery ? "Không tìm thấy kết quả" : "Chưa có hoạt động nào"
          }
          description={
            searchQuery
              ? "Thử tìm kiếm với từ khóa khác"
              : "Các hoạt động sẽ hiển thị ở đây"
          }
        />
      )}
    </View>
  );
}
