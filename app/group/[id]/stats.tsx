import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { CATEGORY_CONFIG } from '@/constants';
import { useExpenses, useGroup } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';
import { useLocalSearchParams } from 'expo-router';
import { Card, Spinner, useThemeColor } from 'heroui-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

export default function GroupStatsScreen() {
  const { id } = useLocalSearchParams();
  const groupId = typeof id === 'string' ? id : null;
  
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');

  const { data: group, isLoading: isLoadingGroup } = useGroup(groupId);
  const { data: expenses, isLoading: isLoadingExpenses } = useExpenses(groupId);

  const isLoading = isLoadingGroup || isLoadingExpenses;

  const stats = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        totalAmount: 0,
        averagePerPerson: 0,
        count: 0,
        categories: [],
        pieData: []
      };
    }

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const memberCount = group?.group_members?.length || 1;
    
    const catMap: Record<string, number> = {};
    expenses.forEach(exp => {
      catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
    });

    const categories = Object.entries(catMap).map(([cat, amount]) => {
      const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
      return {
        label: config.label,
        amount,
        percent: (amount / totalAmount) * 100,
        icon: config.icon,
        color: config.color,
        bg: config.bg,
        value: amount,
      };
    }).sort((a, b) => b.amount - a.amount);

    const pieData = categories.map(cat => ({
      value: cat.amount,
      color: cat.color,
      text: cat.label,
    }));

    return {
      totalAmount,
      averagePerPerson: totalAmount / memberCount,
      count: expenses.length,
      categories,
      pieData
    };
  }, [expenses, group]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <StickyHeader title="Thống kê nhóm" />
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color={accent} />
          <AppText className="mt-4 text-muted">Đang tải dữ liệu...</AppText>
        </View>
      </View>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <StickyHeader title="Thống kê nhóm" />
        <View className="flex-1 p-6">
          <EmptyState
            icon="chart.pie.fill"
            title="Chưa có dữ liệu"
            description="Hãy thêm các khoản chi tiêu để xem thống kê."
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Thống kê nhóm" />
      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-8">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">TỔNG QUAN CHI TIÊU</AppText>
          <Card className="p-6 rounded-3xl border border-divider/10">
            <AppText className="text-muted text-xs uppercase font-bold mb-1">Tổng cộng đã chi</AppText>
            <AppText className="text-3xl font-bold mb-4">
              {formatCurrency(stats.totalAmount, group?.currency)}
            </AppText>
            <View className="flex-row gap-4">
              <View className="flex-1 bg-surface-secondary p-4 rounded-2xl border border-divider/5">
                <AppText className="text-[10px] text-muted font-bold uppercase mb-1">Trung bình / người</AppText>
                <AppText className="text-lg font-bold" numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(stats.averagePerPerson, group?.currency)}
                </AppText>
              </View>
              <View className="flex-1 bg-surface-secondary p-4 rounded-2xl border border-divider/5">
                <AppText className="text-[10px] text-muted font-bold uppercase mb-1">Số lượng chi tiêu</AppText>
                <AppText className="text-lg font-bold">{stats.count}</AppText>
              </View>
            </View>
          </Card>
        </View>

        <View className="mb-8">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">PHÂN LOẠI CHI TIÊU</AppText>
          <Card className="p-6 rounded-3xl border border-divider/10">
            <View className="items-center justify-center mb-6">
              <PieChart
                data={stats.pieData}
                donut
                radius={80}
                innerRadius={50}
                innerCircleColor="transparent"
                showText={false}
                focusOnPress
                textColor={foreground}
              />
            </View>

            {stats.categories.map((cat, idx) => (
              <View key={idx} className="mb-6 last:mb-0">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-3">
                    <View 
                      style={{ backgroundColor: cat.color }}
                      className="w-8 h-8 rounded-xl items-center justify-center shadow-sm"
                    >
                      <IconSymbol name={cat.icon as any} size={16} color="white" />
                    </View>
                    <View>
                      <AppText className="font-bold">{cat.label}</AppText>
                      <AppText className="text-[10px] text-muted font-bold uppercase">
                        {cat.percent.toFixed(1)}%
                      </AppText>
                    </View>
                  </View>
                  <AppText className="font-bold">
                    {formatCurrency(cat.amount, group?.currency)}
                  </AppText>
                </View>
                <View className="h-1.5 bg-divider/5 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ 
                      width: `${cat.percent}%`,
                      backgroundColor: cat.color 
                    }}
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
