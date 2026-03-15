import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CATEGORY_CONFIG } from "@/constants";
import { useTranslation } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "expo-router";
import { Avatar, cn, ListGroup, PressableFeedback, Separator, Skeleton, useThemeColor } from "heroui-native";
import React from "react";
import { View } from "react-native";

interface RecentActivityProps {
  expenses: any[] | null;
  isLoading: boolean;
  userId?: string;
}

// --- Memoized Row ---

interface RecentActivityRowProps {
  item: any;
  isLast: boolean;
  isMe: boolean;
  userName: string;
}

const RecentActivityRow = React.memo(({ item, isLast, isMe, userName }: RecentActivityRowProps) => {
  const muted = useThemeColor("muted");
  const { t } = useTranslation();
  const categoryConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
  const groupName = item.group?.name || t('home.recent_activity.group');
  const amount = formatCurrency(item.amount, item.group?.currency || "VND");

  return (
    <>
      <ListGroup.Item>
        <ListGroup.ItemPrefix>
          <View className="relative">
            <Avatar size="sm" alt={userName}>
              {item.paid_by_user?.avatar_url ? (
                <Avatar.Image source={{ uri: item.paid_by_user.avatar_url }} />
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
            <AppText className="text-foreground/70"> {t('home.recent_activity.added')}</AppText>
            <AppText className="font-semibold"> {item.title}</AppText>
          </ListGroup.ItemTitle>
          <ListGroup.ItemDescription>
            <View className="flex-row items-center mt-0.5">
              <IconSymbol name="person.3.fill" size={12} color={muted} />
              <AppText className="text-muted text-xs ml-1 font-medium">{groupName}</AppText>
            </View>
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix>
          <AppText className="text-sm font-semibold text-foreground">
            {amount}
          </AppText>
        </ListGroup.ItemSuffix>
      </ListGroup.Item>
      {!isLast && <Separator className="mx-4 bg-separator/40" />}
    </>
  );
});

// --- Main Component ---

export const RecentActivity = ({ expenses, isLoading, userId }: RecentActivityProps) => {
  const router = useRouter();
  const { t } = useTranslation();

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
    <View className="px-6 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <AppText className="text-lg font-bold">{t('home.recent_activity.title')}</AppText>
        <PressableFeedback onPress={() => router.push("/activity")}>
          <AppText className="text-foreground font-semibold text-sm">
            {t('home.groups.view_all')}
          </AppText>
        </PressableFeedback>
      </View>

      {expenses && expenses.length > 0 ? (
        <ListGroup className="rounded-2xl">
          {expenses.map((item, index) => {
            const isMe = item.paid_by === userId;
            const userName = isMe ? t('home.you') : item.paid_by_user?.name || t('home.someone');
            return (
              <RecentActivityRow
                key={item.id}
                item={item}
                isLast={index === expenses.length - 1}
                isMe={isMe}
                userName={userName}
              />
            );
          })}
        </ListGroup>
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
