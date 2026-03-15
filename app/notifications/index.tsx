import { AppText } from '@/components/app-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications, useTranslation } from '@/lib/hooks';
import type { Notification } from '@/lib/types';
import { FlashList } from '@shopify/flash-list';
import { cn, ListGroup, PressableFeedback, Separator, Spinner, Tabs, useThemeColor } from 'heroui-native';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

// --- Constants ---

const NOTIFICATION_ICON_MAP: Record<string, string> = {
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

const NOTIFICATION_COLOR_MAP: Record<string, { bg: string; icon: string }> = {
  expense_created: { bg: '#0070F320', icon: '#0070F3' },
  expense_updated: { bg: '#0070F320', icon: '#0070F3' },
  settlement_requested: { bg: '#F5A62320', icon: '#F5A623' },
  settlement_completed: { bg: '#17C96420', icon: '#17C964' },
  group_member_added: { bg: '#9455D320', icon: '#9455D3' },
  group_member_removed: { bg: '#F3126020', icon: '#F31260' },
  debt_assignment_requested: { bg: '#06B6D420', icon: '#06B6D4' },
  debt_assignment_approved: { bg: '#17C96420', icon: '#17C964' },
  debt_assignment_rejected: { bg: '#F3126020', icon: '#F31260' },
};

const DEFAULT_NOTIFICATION_COLOR = { bg: '#3F3F4620', icon: '#3F3F46' };

// --- Types ---

interface SectionHeaderItem {
  type: 'section-header';
  id: string;
  title: string;
}

interface SectionGroupItem {
  type: 'section-group';
  id: string;
  notifications: Notification[];
}

type FlashListItem = SectionHeaderItem | SectionGroupItem;

// --- Helpers ---

const getNotificationIcon = (type: string): string =>
  NOTIFICATION_ICON_MAP[type] || 'bell';

const getNotificationColor = (type: string) =>
  NOTIFICATION_COLOR_MAP[type] || DEFAULT_NOTIFICATION_COLOR;

const formatTimeAgo = (dateString: string, t: ReturnType<typeof useTranslation>['t']): string => {
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

const buildGroupKeys = (groupedNotifications: Record<string, Notification[]>): string[] =>
  [...Object.keys(groupedNotifications)].sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return b.localeCompare(a);
  });

const groupNotificationsByDate = (notifications: Notification[]): Record<string, Notification[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return notifications.reduce<Record<string, Notification[]>>((groups, notif) => {
    const notifDate = new Date(notif.createdAt);
    notifDate.setHours(0, 0, 0, 0);

    const groupKey =
      notifDate.getTime() === today.getTime()
        ? 'Today'
        : notifDate.getTime() === yesterday.getTime()
          ? 'Yesterday'
          : notifDate.toLocaleDateString('vi-VN');

    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), notif],
    };
  }, {});
};

const flattenGroupedNotifications = (
  groupedNotifications: Record<string, Notification[]>,
  groupKeys: string[],
): FlashListItem[] =>
  groupKeys.flatMap((groupTitle) => {
    const notifications = groupedNotifications[groupTitle];
    const sectionHeader: SectionHeaderItem = {
      type: 'section-header',
      id: `header-${groupTitle}`,
      title: groupTitle,
    };
    const sectionGroup: SectionGroupItem = {
      type: 'section-group',
      id: `group-${groupTitle}`,
      notifications,
    };
    return [sectionHeader, sectionGroup];
  });

// --- Memoized Notification Row ---

interface NotificationRowProps {
  notification: Notification;
  isLast: boolean;
  onPress: (notification: Notification) => void;
}

const NotificationRow = React.memo(({ notification, isLast, onPress }: NotificationRowProps) => {
  const colorConfig = getNotificationColor(notification.type);

  return (
    <>
      <ListGroup.Item
        onPress={() => onPress(notification)}
        className={cn(!notification.isRead && 'bg-accent/5 shadow-none')}
      >
        <ListGroup.ItemPrefix>
          <View
            className="w-10 h-10 rounded-2xl items-center justify-center"
            style={{ backgroundColor: colorConfig.bg }}
          >
            <IconSymbol
              name={getNotificationIcon(notification.type) as any}
              size={20}
              color={colorConfig.icon}
            />
          </View>
        </ListGroup.ItemPrefix>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle
            className={cn(
              'text-base',
              !notification.isRead ? 'text-foreground font-bold' : 'text-foreground/70 font-medium',
            )}
            numberOfLines={2}
          >
            {notification.title}
          </ListGroup.ItemTitle>
          {notification.body && (
            <ListGroup.ItemDescription numberOfLines={2} className="text-xs">
              {notification.body}
            </ListGroup.ItemDescription>
          )}
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix>
          <View className="items-end gap-1">
            {!notification.isRead && <View className="w-2 h-2 rounded-full bg-danger" />}
          </View>
        </ListGroup.ItemSuffix>
      </ListGroup.Item>
      {!isLast && <Separator className="mx-4 bg-separator/40" />}
    </>
  );
});

// --- Main Screen ---

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const accent = useThemeColor('accent');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, isLoading, error, refetch } = useNotifications({
    unreadOnly: activeTab === 'unread',
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const flattenedData = useMemo(() => {
    if (!notifications) return [];
    const grouped = groupNotificationsByDate(notifications);
    const keys = buildGroupKeys(grouped);
    return flattenGroupedNotifications(grouped, keys);
  }, [notifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }
    // TODO: Navigate to relevant screen based on notification type
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead.mutateAsync();
  }, [markAllAsRead]);

  const keyExtractor = useCallback((item: FlashListItem) => item.id, []);

  const getItemType = useCallback((item: FlashListItem) => item.type, []);

  const translateSectionTitle = useCallback(
    (title: string): string => {
      if (title === 'Today') return t('notifications.today', { defaultValue: 'Hôm nay' });
      if (title === 'Yesterday') return t('notifications.yesterday', { defaultValue: 'Hôm qua' });
      return title;
    },
    [t],
  );

  const renderItem = useCallback(
    ({ item }: { item: FlashListItem }) => {
      if (item.type === 'section-header') {
        return (
          <AppText className="text-[13px] font-bold text-muted uppercase tracking-widest mb-3 mt-2 ml-1">
            {translateSectionTitle(item.title)}
          </AppText>
        );
      }

      return (
        <ListGroup className="mb-4 rounded-2xl shadow-xs">
          {item.notifications.map((notif, index) => (
            <NotificationRow
              key={notif.id}
              notification={notif}
              isLast={index === item.notifications.length - 1}
              onPress={handleNotificationPress}
            />
          ))}
        </ListGroup>
      );
    },
    [handleNotificationPress, translateSectionTitle],
  );



  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="bell.slash"
        title={
          activeTab === 'unread'
            ? t('notifications.empty_unread_title', { defaultValue: 'Không có thông báo chưa đọc' })
            : t('notifications.empty_all_title', { defaultValue: 'Chưa có thông báo nào' })
        }
        description={
          activeTab === 'unread'
            ? t('notifications.empty_unread_desc', { defaultValue: 'Tất cả thông báo đã được đọc' })
            : t('notifications.empty_all_desc', { defaultValue: 'Các thông báo sẽ hiển thị ở đây' })
        }
      />
    ),
    [activeTab, t],
  );

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

  const hasUnread = notifications?.some((n) => !n.isRead) ?? false;

  return (
    <View className="flex-1 bg-background">
      <StickyHeader
        title={t('notifications.title', { defaultValue: 'Thông báo' })}
        rightContent={
          notifications && notifications.length > 0 && hasUnread ? (
            <PressableFeedback onPress={handleMarkAllAsRead}>
              <AppText className="text-accent font-semibold text-sm">
                {t('notifications.mark_all_read', { defaultValue: 'Đánh dấu tất cả' })}
              </AppText>
            </PressableFeedback>
          ) : null
        }
      />

      <View className="px-6 pb-4 flex-row justify-center">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}
          variant="primary"
          className="bg-surface-secondary rounded-full p-1"
        >
          <Tabs.List>
            <Tabs.Indicator className="bg-accent shadow-none" />
            <Tabs.Trigger value="all" className="px-6 py-2 rounded-full">
              {({ isSelected }) => (
                <Tabs.Label className={cn('font-bold text-[13px]', isSelected ? 'text-white' : 'text-foreground')}>
                  {t('notifications.tab_all', { defaultValue: 'Tất cả' })}
                </Tabs.Label>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="unread" className="px-6 py-2 rounded-full">
              {({ isSelected }) => (
                <Tabs.Label className={cn('font-bold text-[13px]', isSelected ? 'text-white' : 'text-foreground')}>
                  {t('notifications.tab_unread', { defaultValue: 'Chưa đọc' })}
                </Tabs.Label>
              )}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color={accent} />
        </View>
      ) : (
        <FlashList
          data={flattenedData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={renderEmptyState}
          contentContainerClassName="px-6 pb-20"
        />
      )}
    </View>
  );
}
