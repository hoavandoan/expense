import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { Card, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'request',
    title: 'Minh đã yêu cầu bạn tất toán',
    desc: 'Số tiền: 200.000đ trong nhóm "Đà Lạt 2024"',
    time: '5 phút trước',
    isUnread: true,
  },
  {
    id: '2',
    type: 'group',
    title: 'Bạn được thêm vào nhóm "Nhà trọ Happy"',
    desc: 'Bởi Thành (thanh.nd)',
    time: '1 giờ trước',
    isUnread: false,
  },
  {
    id: '3',
    type: 'expense',
    title: 'Chi tiêu mới: "Tiền điện tháng 12"',
    desc: 'Thành vừa cập nhật trong nhóm "Nhà trọ Happy"',
    time: 'Hôm qua',
    isUnread: false,
  }
];

export default function NotificationsScreen() {
  const accent = useThemeColor('accent');

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Thông báo" />

      <ScreenScrollView>
        <View className="p-6">
          <View className="flex-row items-center justify-between mb-6">
            <AppText className="text-muted text-xs font-bold uppercase tracking-widest">GẦN ĐÂY</AppText>
            <PressableFeedback>
              <AppText className="text-accent text-xs font-bold">Đánh dấu đã đọc</AppText>
            </PressableFeedback>
          </View>

          <View className="gap-3">
            {NOTIFICATIONS.map((notif) => (
              <PressableFeedback key={notif.id}>
                <Card
                  className={`p-4 rounded-2xl border border-divider/5 flex-row items-start gap-3 ${notif.isUnread ? 'bg-accent/5' : ''}`}
                >
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${notif.isUnread ? 'bg-accent' : 'bg-surface-tertiary'}`}>
                    <IconSymbol
                      name={notif.type === 'request' ? 'bank' : notif.type === 'group' ? 'person.2.fill' : 'doc.text.fill'}
                      size={20}
                      color={notif.isUnread ? 'white' : 'gray'}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <AppText className={`text-sm font-bold flex-1 mr-2 ${notif.isUnread ? 'text-foreground' : 'text-foreground/70'}`}>
                        {notif.title}
                      </AppText>
                      {notif.isUnread && <View className="w-2 h-2 rounded-full bg-accent mt-1.5" />}
                    </View>
                    <AppText className="text-xs text-muted mt-0.5" numberOfLines={2}>
                      {notif.desc}
                    </AppText>
                    <AppText className="text-[10px] text-muted mt-2 font-medium">
                      {notif.time}
                    </AppText>
                  </View>
                </Card>
              </PressableFeedback>
            ))}
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
}
