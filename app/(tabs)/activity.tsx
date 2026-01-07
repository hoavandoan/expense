import { ActivityItem } from '@/components/activity-item';
import { AppText } from '@/components/app-text';
import {
    AnimatedScrollView,
    HeaderComponentWrapper,
    HeaderNavBar,
} from '@/components/parallax-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { cn, Tabs, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVITY_SECTIONS = [
  {
    title: 'Hôm nay',
    data: [
      {
        id: '1',
        user: { name: 'Hùng', avatar: 'https://i.pravatar.cc/150?u=hung' },
        action: 'đã trả',
        subject: 'Ăn trưa',
        group: 'Du lịch Đà Lạt',
        groupIcon: 'person.2.fill' as any,
        amount: '250.000đ',
        status: 'bạn nợ 50k',
        typeIcon: 'fork.knife' as any,
        typeColor: 'bg-orange-500/10',
        iconColor: '#f97316',
      },
      {
        id: '2',
        user: { name: 'Lan', avatar: 'https://i.pravatar.cc/150?u=lan' },
        action: 'đã trả cho bạn',
        group: 'Nhà trọ Sài Gòn',
        groupIcon: 'house.fill' as any,
        amount: '+500.000đ',
        status: '',
        typeIcon: 'checkmark.circle.fill' as any,
        typeColor: 'bg-success/10',
        iconColor: '#22c55e',
      },
      {
        id: '3',
        user: { name: 'Tuấn', avatar: 'https://i.pravatar.cc/150?u=tuan' },
        action: 'đã tham gia nhóm',
        group: 'Cà phê sáng',
        groupIcon: 'cup.and.saucer.fill' as any,
        amount: '',
        status: '',
        typeIcon: 'person.fill.badge.plus' as any,
        typeColor: 'bg-default/10',
        iconColor: '#6b7280',
      },
    ],
  },
  {
    title: 'Hôm qua',
    data: [
      {
        id: '4',
        user: { name: 'Minh', avatar: 'https://i.pravatar.cc/150?u=minh' },
        action: 'đã trả',
        subject: 'GrabCar',
        group: 'Du lịch Đà Lạt',
        groupIcon: 'person.2.fill' as any,
        amount: '60.000đ',
        status: '',
        typeIcon: 'car.fill' as any,
        typeColor: 'bg-blue-500/10',
        iconColor: '#3b82f6',
      },
      {
        id: '5',
        user: { name: 'Bạn', avatar: 'https://i.pravatar.cc/150?u=me' },
        action: 'đã trả',
        subject: 'Đồ uống',
        group: 'Sinh nhật Trang',
        groupIcon: 'wineglass.fill' as any,
        amount: '1.200.000đ',
        status: 'nhận lại 800k',
        typeIcon: 'wineglass.fill' as any,
        typeColor: 'bg-purple-500/10',
        iconColor: '#a855f7',
        isMe: true,
      },
      {
        id: '6',
        user: { name: 'Trang', avatar: 'https://i.pravatar.cc/150?u=trang' },
        action: 'đã tạo nhóm',
        group: 'Sinh nhật Trang',
        groupIcon: 'wineglass.fill' as any,
        amount: '',
        status: '',
        typeIcon: 'plus' as any,
        typeColor: 'bg-default/10',
        iconColor: '#6b7280',
      },
    ],
  },
];

const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: 'list.bullet' as any },
  { id: 'expense', label: 'Chi tiêu', icon: 'doc.text.fill' as any },
  { id: 'payment', label: 'Thanh toán', icon: 'checkmark.circle.fill' as any },
];

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const muted = useThemeColor('muted');
  const [activeFilter, setActiveFilter] = useState('all');

  const ACTIVITY_HEADER_HEIGHT = 280;

  const renderTopNavBarComponent = () => (
    <HeaderNavBar useBlur={true} className="border-b border-divider/5">
      <View className="flex-row items-center justify-center h-full">
        <AppText className="text-lg font-bold text-foreground">Hoạt động</AppText>
      </View>
    </HeaderNavBar>
  );

  const renderHeaderComponent = () => (
    <HeaderComponentWrapper className="bg-background" useGradient={false}>
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="px-6 pb-6"
      >
        <AppText className="text-3xl font-extrabold text-foreground mb-6">Hoạt động</AppText>

        <View className="mb-6">
          <TextField className="bg-surface border border-divider/10 rounded-2xl">
            <TextField.Input
              placeholder="Tìm kiếm hoạt động, nhóm..."
              className="text-base h-12"
            >
              <TextField.InputStartContent>
                <IconSymbol name="magnifyingglass" size={20} color={muted} className="ml-3" />
              </TextField.InputStartContent>
            </TextField.Input>
          </TextField>
        </View>

        <View className='flex-row'>
          <Tabs
            value={activeFilter}
            onValueChange={setActiveFilter}
            variant="pill"
            className='bg-surface-secondary rounded-full p-1 border border-divider/5'
          >
            <Tabs.List>
              <Tabs.Indicator className="bg-surface shadow-sm" />
              <Tabs.ScrollView scrollAlign="center">
                {FILTERS.map((filter) => (
                  <Tabs.Trigger
                    key={filter.id}
                    value={filter.id}
                    className="flex-row items-center px-4 py-2 rounded-full"
                  >
                    {({ isSelected }) => (
                      <View className="flex-row items-center">
                        <IconSymbol
                          name={filter.icon}
                          size={16}
                          color={isSelected ? accent : muted}
                        />
                        <Tabs.Label
                          className={cn(
                            "ml-2 font-semibold text-sm transition-colors",
                            isSelected ? "text-accent" : "text-foreground/70"
                          )}
                        >
                          {filter.label}
                        </Tabs.Label>
                      </View>
                    )}
                  </Tabs.Trigger>
                ))}
              </Tabs.ScrollView>
            </Tabs.List>
          </Tabs>
        </View>
      </View>
    </HeaderComponentWrapper>
  );

  return (
    <View className="flex-1 bg-background">
      <AnimatedScrollView
        headerMaxHeight={ACTIVITY_HEADER_HEIGHT}
        disableScale={true}
        renderTopNavBarComponent={renderTopNavBarComponent}
        renderHeaderComponent={renderHeaderComponent}
      >
        <View className="px-6 pt-4 pb-20">
          {ACTIVITY_SECTIONS.map((section) => (
            <View key={section.title} className="mb-8">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                {section.title}
              </AppText>
              <View className="gap-4">
                {section.data.map((item) => (
                  <ActivityItem key={item.id} {...item} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </AnimatedScrollView>
    </View>
  );
}
