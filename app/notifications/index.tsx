import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications, useTranslation } from '@/lib/hooks';
import { cn, PressableFeedback, Spinner, Tabs, useThemeColor } from 'heroui-native';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    expense_created: 'doc.text.fill',
    expense_updated: 'doc.text.fill',
    settlement_requested: 'bank',
    settlement_completed: 'checkmark.circle.fill',
    group_member_added: 'person.2.fill',
    group_member_removed: 'person.2.slash.fill',
    debt_assignment_requested: 'arrow.triangle.2.circlepath',
    debt_assignment_approved: 'checkmark.seal.fill',
    debt_assignment_rejected: 'xmark.seal.fill',
  };
  return iconMap[type] || 'bell';
};

const formatTimeAgo = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return t('notifications.just_now', { defaultValue: 'Vừa xong' });
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return t('notifications.minutes_ago', { count: diffInMinutes, defaultValue: `${diffInMinutes} phút trước` });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return t('notifications.hours_ago', { count: diffInHours, defaultValue: `${diffInHours} giờ trước` });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return t('notifications.yesterday', { defaultValue: 'Hôm qua' });
  }
  if (diffInDays < 7) {
    return t('notifications.days_ago', { count: diffInDays, defaultValue: `${diffInDays} ngày trước` });
  }

  return date.toLocaleDateString('vi-VN');
};

const groupNotificationsByDate = (notifications: any[]) => {
  const groups: Record<string, any[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt);
    notifDate.setHours(0, 0, 0, 0);

    let groupKey: string;
    if (notifDate.getTime() === today.getTime()) {
      groupKey = 'Today';
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = notifDate.toLocaleDateString('vi-VN');
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notif);
  });

  return groups;
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const accent = useThemeColor('accent');
  const muted = useThemeColor('muted');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, isLoading, error, refetch } = useNotifications({
    unreadOnly: activeTab === 'unread',
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const groupedNotifications = useMemo(() => {
    if (!notifications) return {};
    return groupNotificationsByDate(notifications);
  }, [notifications]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNotificationPress = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }
    // TODO: Navigate to relevant screen based on notification type
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <StickyHeader title={t('notifications.title', { defaultValue: 'Thông báo' })} />
        <ErrorState
          title={t('notifications.error_title', { defaultValue: 'Không thể tải thông báo' })}
          message={error instanceof Error ? error.message : t('notifications.error_default', { defaultValue: 'Đã xảy ra lỗi' })}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const groupKeys = Object.keys(groupedNotifications).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return b.localeCompare(a);
  });

  return (
    <View className="flex-1 bg-background">
      <StickyHeader
        title={t('notifications.title', { defaultValue: 'Thông báo' })}
        rightElement={
          notifications && notifications.length > 0 && notifications.some((n) => !n.isRead) ? (
            <PressableFeedback onPress={handleMarkAllAsRead}>
              <AppText className="text-accent font-semibold text-sm">{t('notifications.mark_all_read', { defaultValue: 'Đánh dấu tất cả' })}</AppText>
            </PressableFeedback>
          ) : null
        }
      />

      <View className="px-6 py-4 flex-row justify-center">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')} variant="primary" className="bg-surface-secondary rounded-full p-1">
          <Tabs.List>
            <Tabs.Indicator className="bg-accent shadow-none" />
            <Tabs.Trigger value="all" className="px-6 py-2 rounded-full">
              {({ isSelected }) => (
                <Tabs.Label className={cn("font-bold text-[13px]", isSelected ? "text-white" : "text-foreground")}>{t('notifications.tab_all', { defaultValue: 'Tất cả' })}</Tabs.Label>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="unread" className="px-6 py-2 rounded-full">
              {({ isSelected }) => (
                <Tabs.Label className={cn("font-bold text-[13px]", isSelected ? "text-white" : "text-foreground")}>{t('notifications.tab_unread', { defaultValue: 'Chưa đọc' })}</Tabs.Label>
              )}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color={accent} />
        </View>
      ) : notifications && notifications.length > 0 ? (
        <ScreenScrollView refreshing={refreshing} onRefresh={onRefresh}>
          <View className="pb-20">
            {groupKeys.map((groupTitle) => (
              <View key={groupTitle} className="mb-6">
                <AppText className="text-[13px] font-bold text-muted uppercase tracking-widest mb-4">
                  {groupTitle === 'Today' ? t('notifications.today', { defaultValue: 'Hôm nay' }) : groupTitle === 'Yesterday' ? t('notifications.yesterday', { defaultValue: 'Hôm qua' }) : groupTitle}
                </AppText>
                <View className="gap-4">
                  {groupedNotifications[groupTitle].map((notif) => (
                    <PressableFeedback key={notif.id} onPress={() => handleNotificationPress(notif)}>
                      <View className={cn("flex-row items-center p-3 rounded-2xl", !notif.isRead && "bg-accent/5")}>
                        <View className={cn("w-12 h-12 rounded-full items-center justify-center", !notif.isRead ? "bg-accent" : "bg-surface-secondary")}>
                          <IconSymbol
                            name={getNotificationIcon(notif.type) as any}
                            size={20}
                            color={!notif.isRead ? 'white' : muted}
                          />
                        </View>
                        <View className="flex-1 ml-4 pr-2">
                          <AppText className={cn("text-[15px] font-bold mb-0.5", !notif.isRead ? "text-foreground" : "text-foreground/70")} numberOfLines={2}>
                            {notif.title}
                          </AppText>
                          {notif.body && (
                            <AppText className="text-muted text-[13px]" numberOfLines={2}>
                              {notif.body}
                            </AppText>
                          )}
                        </View>
                        <View className="items-end">
                          <AppText className="text-muted text-[11px] font-medium mb-1">
                            {formatTimeAgo(notif.createdAt, t)}
                          </AppText>
                          {!notif.isRead && <View className="w-2 h-2 rounded-full bg-accent" />}
                        </View>
                      </View>
                    </PressableFeedback>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScreenScrollView>
      ) : (
        <EmptyState
          icon="bell.slash"
          title={activeTab === 'unread' ? t('notifications.empty_unread_title', { defaultValue: 'Không có thông báo chưa đọc' }) : t('notifications.empty_all_title', { defaultValue: 'Chưa có thông báo nào' })}
          description={activeTab === 'unread' ? t('notifications.empty_unread_desc', { defaultValue: 'Tất cả thông báo đã được đọc' }) : t('notifications.empty_all_desc', { defaultValue: 'Các thông báo sẽ hiển thị ở đây' })}
        />
      )}
    </View>
  );
}
