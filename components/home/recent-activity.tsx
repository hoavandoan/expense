import { ActivityItem } from "@/components/activity-item";
import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_CONFIG } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { PressableFeedback, Skeleton } from "heroui-native";
import React, { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

interface RecentActivityProps {
  expenses: any[] | null;
  isLoading: boolean;
  userId?: string;
}

export const RecentActivity = ({ expenses, isLoading, userId }: RecentActivityProps) => {
  const router = useRouter();

  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    const categoryConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
    const isMe = item.paid_by === userId;

    return (
      <Animated.View
        entering={FadeInDown.delay(1000 + index * 100).springify()}
                layout={Layout.springify()}
        className="mb-3"
      >
        <ActivityItem
          userName={isMe ? "Bạn" : item.paid_by_user?.name || "Ai đó"}
          userAvatar={item.paid_by_user?.avatar_url || ""}
          action="đã thêm"
          subject={item.title}
          groupName={item.group?.name || "Nhóm"}
          groupIcon="person.3.fill"
          amount={formatCurrency(
            item.amount,
            item.group?.currency || "VND"
          )}
          status=""
          typeIcon={categoryConfig.icon}
          typeColor={categoryConfig.bg}
          iconColor={categoryConfig.color}
          isMe={isMe}
        />
      </Animated.View>
    );
  }, [userId]);

  if (isLoading) {
    return (
      <View className="px-6 mb-10">
        <View className="flex-row items-center justify-between mb-4">
          <Skeleton className="w-40 h-6 rounded-md" />
        </View>
        <View className="gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-20 rounded-2xl" />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="px-6 mb-6" style={{ height: (expenses?.length || 0) > 0 ? (expenses!.length * 104) + 40 : 200 }}>
      <View className="flex-row items-center justify-between mb-4">
        <AppText className="text-lg font-bold">Hoạt động gần đây</AppText>
        <PressableFeedback onPress={() => router.push("/activity")}>
          <AppText className="text-accent font-semibold text-sm">
            Xem tất cả
          </AppText>
        </PressableFeedback>
      </View>

      {expenses && expenses.length > 0 ? (
        <FlashList
          data={expenses}
          renderItem={renderItem}
          estimatedItemSize={92}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <EmptyState
          icon="clock.fill"
          title="Chưa có hoạt động nào"
          description="Các hoạt động chi tiêu sẽ hiển thị ở đây"
        />
      )}
    </View>
  );
};
