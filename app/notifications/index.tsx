import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { cn, PressableFeedback, Tabs, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'request',
    title: 'Minh đã yêu cầu bạn tất toán',
    desc: 'Số tiền: 200.000 đ trong nhóm "Đà Lạt 2024"',
    time: '5 phút trước',
    isUnread: true,
    group: 'Today',
  },
  {
    id: '2',
    type: 'group',
    title: 'Bạn được thêm vào nhóm "Nhà trọ Happy"',
    desc: 'Bởi Thành (thanh.nd)',
    time: '1 giờ trước',
    isUnread: false,
    group: 'Today',
  },
  {
    id: '3',
    type: 'expense',
    title: 'Chi tiêu mới: "Tiền điện tháng 12"',
    desc: 'Thành vừa cập nhật trong nhóm "Nhà trọ Happy"',
    time: 'Hôm qua',
    isUnread: false,
    group: 'Yesterday',
  }
];

export default function NotificationsScreen() {
  const accent = useThemeColor('accent');
  const muted = useThemeColor('muted');
  const [activeTab, setActiveTab] = useState('all');

  const groups = ['Today', 'Yesterday'];

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Thông báo" />

      <View className="px-6 py-4 flex-row justify-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} variant="pill" className="bg-surface-secondary rounded-full p-1">
          <Tabs.List>
            <Tabs.Indicator className="bg-accent shadow-none" />
            <Tabs.Trigger value="all" className="px-6 py-2 rounded-full">
              {({ isSelected }) => (
                <Tabs.Label className={cn("font-bold text-[13px]", isSelected ? "text-white" : "text-foreground")}>All</Tabs.Label>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="income" className="px-6 py-2 rounded-full">
              {({ isSelected }) => (
                <Tabs.Label className={cn("font-bold text-[13px]", isSelected ? "text-white" : "text-foreground")}>Income</Tabs.Label>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="subscriptions" className="px-6 py-2 rounded-full">
              {({ isSelected }) => (
                <Tabs.Label className={cn("font-bold text-[13px]", isSelected ? "text-white" : "text-foreground")}>Subscriptions</Tabs.Label>
              )}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </View>

      <ScreenScrollView>
        <View className="px-6 pb-20">
          {groups.map((groupTitle) => (
            <View key={groupTitle} className="mb-6">
              <AppText className="text-[13px] font-bold text-muted uppercase tracking-widest mb-4">
                {groupTitle === 'Today' ? 'Hôm nay' : 'Hôm qua'}
              </AppText>
              <View className="gap-4">
                {NOTIFICATIONS.filter(n => n.group === groupTitle).map((notif) => (
                  <PressableFeedback key={notif.id}>
                    <View className="flex-row items-center">
                      <View className={cn("w-12 h-12 rounded-full items-center justify-center", notif.isUnread ? "bg-accent" : "bg-surface-secondary")}>
                        <IconSymbol
                          name={notif.type === 'request' ? 'bank' : notif.type === 'group' ? 'person.2.fill' : 'doc.text.fill'}
                          size={20}
                          color={notif.isUnread ? 'white' : muted}
                        />
                      </View>
                      <View className="flex-1 ml-4 pr-2">
                        <AppText className="text-[15px] font-bold text-foreground mb-0.5" numberOfLines={1}>
                          {notif.title}
                        </AppText>
                        <AppText className="text-muted text-[13px]" numberOfLines={1}>
                          {notif.desc}
                        </AppText>
                      </View>
                      <View className="items-end">
                        <AppText className="text-muted text-[11px] font-medium mb-1">
                          {notif.time.split(' ')[0]} {notif.time.includes('phút') ? 'm' : 'h'}
                        </AppText>
                        {notif.isUnread && <View className="w-2 h-2 rounded-full bg-accent" />}
                      </View>
                    </View>
                  </PressableFeedback>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScreenScrollView>
    </View>
  );
}
