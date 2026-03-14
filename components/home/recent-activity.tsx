import { ActivityItem } from "@/components/activity-item";
import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_CONFIG } from "@/constants";
import { useTranslation } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { PressableFeedback, Skeleton } from "heroui-native";
import React, { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";

interface RecentActivityProps {
  expenses: any[] | null;
  isLoading: boolean;
  userId?: string;
}

export const RecentActivity = ({ expenses, isLoading, userId }: RecentActivityProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    const categoryConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
    const isMe = item.paid_by === userId;

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(500)}
        exiting={FadeOut.duration(200)}
        className="mb-3"
      >
        <ActivityItem
          userName={isMe ? t('home.you') : item.paid_by_user?.name || t('home.someone')}
          userAvatar={item.paid_by_user?.avatar_url || ""}
          action={t('home.recent_activity.added')}
          subject={item.title}
          groupName={item.group?.name || t('home.recent_activity.group')}
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
  }, [userId, t]);

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
        <AppText className="text-lg font-bold">{t('home.recent_activity.title')}</AppText>
        <PressableFeedback onPress={() => router.push("/activity")}>
          <AppText className="text-foreground font-semibold text-sm">
            {t('home.groups.view_all')}
          </AppText>
        </PressableFeedback>
      </View>

      {expenses && expenses.length > 0 ? (
        <FlashList
          data={expenses}
          renderItem={renderItem}
          // @ts-expect-error - estimatedItemSize exists on FlashList but sometimes has type issues
          estimatedItemSize={92}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          extraData={t}
        />
      ) : (
        <EmptyState
          icon="clock.fill"
          title={t('home.recent_activity.empty_title')}
          description={t('home.recent_activity.empty_description')}
        />
      )}
    </View>
  );
};
