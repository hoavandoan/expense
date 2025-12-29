import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Card, cn, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

const MOCK_HISTORY = [
  { id: '1', title: 'Ăn trưa Kichi Kichi', subtitle: 'Chi cho tất cả • Hôm nay', amount: -150000, category: 'Ăn uống' },
  { id: '2', title: 'Thanh toán tiền nhà', subtitle: 'Bạn đã trả • Hôm qua', amount: 2500000, category: 'Nhà cửa' },
  { id: '3', title: 'Cafe sáng', subtitle: 'An trả • 24/12', amount: -25000, category: 'Ăn uống' },
  { id: '4', title: 'Vé xem phim', subtitle: 'Bạn đã trả • 23/12', amount: 120000, category: 'Giải trí' },
];

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');

  return (
    <ScreenScrollView className="bg-background">
      {/* Header (Image 2) */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <PressableFeedback onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface items-center justify-center shadow-sm">
          <IconSymbol name="chevron.left" size={20} color="black" />
        </PressableFeedback>
        <AppText className="text-lg font-bold">Lịch sử chi tiêu</AppText>
        <PressableFeedback className="w-10 h-10 rounded-full bg-surface items-center justify-center shadow-sm">
          <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color="black" />
        </PressableFeedback>
      </View>

      {/* Summary Stats (Image 2) */}
      <View className="flex-row px-6 gap-4 mb-8">
        <Card variant="default" className="flex-1 p-5 rounded-[28px] bg-accent/5 border border-accent/10">
          <AppText className="text-muted text-[10px] font-bold uppercase mb-2">TỔNG CHI TIÊU</AppText>
          <AppText className="text-xl font-bold">4.250k</AppText>
        </Card>
        <Card variant="default" className="flex-1 p-5 rounded-[28px] bg-success/5 border border-success/10">
          <AppText className="text-muted text-[10px] font-bold uppercase mb-2">SỐ DƯ CỦA BẠN</AppText>
          <AppText className="text-success text-xl font-bold">+1.250k</AppText>
        </Card>
      </View>

      {/* History List Grouped (Image 2) */}
      <View className="px-6 pb-10">
        <View className="mb-8">
          <AppText className="text-muted text-xs font-bold mb-4 ml-1">HÔM NAY</AppText>
          <View className="gap-3">
            <Card variant="default" className="p-4 rounded-[28px] border border-divider/5">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-orange-100 rounded-2xl items-center justify-center">
                  <IconSymbol name="creditcard" size={24} color="#F5A623" />
                </View>
                <View className="flex-1">
                  <AppText className="font-bold text-base">Ăn trưa Kichi</AppText>
                  <AppText className="text-muted text-xs">Chi cho cả nhóm • 12:30</AppText>
                </View>
                <AppText className="text-danger font-bold text-base">-150k</AppText>
              </View>
            </Card>
          </View>
        </View>

        <View className="mb-8">
          <AppText className="text-muted text-xs font-bold mb-4 ml-1">HÔM QUA</AppText>
          <View className="gap-3">
            <Card variant="default" className="p-4 rounded-[28px] border border-divider/5">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center">
                  <IconSymbol name="house.fill" size={24} color="#0070F3" />
                </View>
                <View className="flex-1">
                  <AppText className="font-bold text-base">Tiền nhà tháng 12</AppText>
                  <AppText className="text-muted text-xs">Bạn đã trả • 09:15</AppText>
                </View>
                <AppText className="text-success font-bold text-base">+2.500k</AppText>
              </View>
            </Card>
          </View>
        </View>

        <View className="mb-8">
          <AppText className="text-muted text-xs font-bold mb-4 ml-1">24 THÁNG 12</AppText>
          <View className="gap-3">
            {MOCK_HISTORY.slice(2).map((item) => (
              <Card key={item.id} variant="default" className="p-4 rounded-[28px] border border-divider/5">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center">
                    <IconSymbol name="paperplane.fill" size={24} color="#71717A" />
                  </View>
                  <View className="flex-1">
                    <AppText className="font-bold text-base">{item.title}</AppText>
                    <AppText className="text-muted text-xs">{item.subtitle}</AppText>
                  </View>
                  <AppText className={cn(
                    'font-bold text-base',
                    item.amount >= 0 ? 'text-success' : 'text-danger'
                  )}>
                    {item.amount >= 0 ? `+${item.amount / 1000}k` : `${item.amount / 1000}k`}
                  </AppText>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </View>
    </ScreenScrollView>
  );
}
