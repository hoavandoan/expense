import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { CATEGORY_CONFIG } from '@/constants';
import { useGroup } from '@/lib/hooks';
import { useGroupSpendingStats } from '@/lib/hooks/use-group-balance';
import { useTranslation } from '@/lib/hooks/use-translation';
import { formatCurrency } from '@/lib/utils';
import { useLocalSearchParams } from 'expo-router';
import { Card, Spinner, useThemeColor } from 'heroui-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

export default function GroupStatsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const groupId = typeof id === 'string' ? id : null;
  
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');

  const { data: group, isLoading: isLoadingGroup } = useGroup(groupId);
  const statsData = useGroupSpendingStats(groupId);
  const isLoading = isLoadingGroup;

  const stats = useMemo(() => {
    if (!statsData.totalAmount && statsData.categoryStats.length === 0) {
      return {
        totalAmount: 0,
        averagePerPerson: 0,
        count: 0,
        categories: [],
        pieData: []
      };
    }

    const { totalAmount, memberCount, categoryStats } = statsData;

    const categories = categoryStats.map((stat: any) => {
      const config = CATEGORY_CONFIG[stat.category] || CATEGORY_CONFIG.other;
      return {
        label: t(`categories.${stat.category}` as any),
        category: stat.category,
        amount: stat.amount,
        percent: totalAmount > 0 ? (stat.amount / totalAmount) * 100 : 0,
        icon: config.icon,
        color: config.color,
        bg: config.bg,
        value: stat.amount,
      };
    }).sort((a: any, b: any) => b.amount - a.amount);

    const pieData = categories.map((cat: any) => ({
      value: cat.amount,
      color: cat.color,
      text: cat.label,
    }));

    return {
      totalAmount,
      averagePerPerson: memberCount > 0 ? totalAmount / memberCount : 0,
      count: 0, 
      categories,
      pieData
    };
  }, [statsData, t]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <StickyHeader title={t("group_stats.title")} />
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color={accent} />
          <AppText className="mt-4 text-muted">{t("loading")}</AppText>
        </View>
      </View>
    );
  }

  if (stats.totalAmount === 0 && !isLoading) {
    return (
      <View className="flex-1 bg-background">
        <StickyHeader title={t("group_stats.title")} />
        <View className="flex-1 p-6">
          <EmptyState
            icon="chart.pie.fill"
            title={t("group_stats.empty_title")}
            description={t("group_stats.empty_desc")}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title={t("group_stats.title")} />
      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-8">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">{t("group_stats.overview_label")}</AppText>
          <Card className="p-6 rounded-3xl border border-border/10">
            <AppText className="text-muted text-xs uppercase font-bold mb-1">{t("group_stats.total_spent")}</AppText>
            <AppText className="text-3xl font-bold mb-4">
              {formatCurrency(stats.totalAmount, group?.currency)}
            </AppText>
            <View className="flex-row gap-4">
              <View className="flex-1 bg-surface-secondary p-4 rounded-2xl border border-divider/5">
                <AppText className="text-[10px] text-muted font-bold uppercase mb-1">{t("group_stats.avg_per_person")}</AppText>
                <AppText className="text-lg font-bold" numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(stats.averagePerPerson, group?.currency)}
                </AppText>
              </View>
              <View className="flex-1 bg-surface-secondary p-4 rounded-2xl border border-divider/5">
                <AppText className="text-[10px] text-muted font-bold uppercase mb-1">{t("group_stats.expense_count")}</AppText>
                <AppText className="text-lg font-bold">{stats.count}</AppText>
              </View>
            </View>
          </Card>
        </View>

        <View className="mb-8">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">{t("group_stats.category_split_label")}</AppText>
          <Card className="p-6 rounded-3xl border border-border/10">
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

            {stats.categories.map((cat: any, idx: number) => (
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
