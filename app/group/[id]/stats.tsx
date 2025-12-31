import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { useLocalSearchParams } from 'expo-router';
import { Card, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

export default function GroupStatsScreen() {
  const { id } = useLocalSearchParams();
  const accent = useThemeColor('accent');

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Thống kê nhóm" />
      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-8">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">TỔNG QUAN CHI TIÊU</AppText>
          <Card className="p-6 rounded-3xl border border-divider/5">
            <AppText className="text-muted text-xs uppercase font-bold mb-1">Tổng cộng đã chi</AppText>
            <AppText className="text-3xl font-bold mb-4">12.500.000 đ</AppText>
            <View className="flex-row gap-4">
              <View className="flex-1 bg-surface-secondary p-3 rounded-2xl">
                <AppText className="text-[10px] text-muted font-bold uppercase">Trung bình / người</AppText>
                <AppText className="text-lg font-bold">2.500.000 đ</AppText>
              </View>
              <View className="flex-1 bg-surface-secondary p-3 rounded-2xl">
                <AppText className="text-[10px] text-muted font-bold uppercase">Số lượng chi tiêu</AppText>
                <AppText className="text-lg font-bold">24</AppText>
              </View>
            </View>
          </Card>
        </View>

        <View className="mb-8">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">PHÂN LOẠI CHI TIÊU</AppText>
          <Card className="p-4 rounded-3xl border border-divider/5">
            {[
              { label: 'Ăn uống', amount: '5.200.000 đ', percent: 42, icon: 'fork.knife', color: 'bg-orange-500' },
              { label: 'Di chuyển', amount: '2.800.000 đ', percent: 22, icon: 'car.fill', color: 'bg-blue-500' },
              { label: 'Mua sắm', amount: '3.500.000 đ', percent: 28, icon: 'cart.fill', color: 'bg-purple-500' },
              { label: 'Khác', amount: '1.000.000 đ', percent: 8, icon: 'ellipsis', color: 'bg-gray-500' },
            ].map((cat, idx) => (
              <View key={idx} className="mb-6 last:mb-0">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className={`w-8 h-8 rounded-lg ${cat.color} items-center justify-center`}>
                      <IconSymbol name={cat.icon as any} size={16} color="white" />
                    </View>
                    <AppText className="font-bold">{cat.label}</AppText>
                  </View>
                  <AppText className="text-muted font-bold">{cat.amount}</AppText>
                </View>
                <View className="h-2 bg-divider/10 rounded-full overflow-hidden">
                  <View
                    className={`h-full ${cat.color}`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScreenScrollView>
    </View>
  );
}
