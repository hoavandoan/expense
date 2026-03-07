import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ExpenseCard } from "@/components/ui/expense-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { EXPENSE_CATEGORIES } from "@/constants";
import { useGroup, useInfiniteExpenses, useTranslation } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatDate } from "@/lib/utils";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Input,
  PressableFeedback,
  Select,
  Spinner,
  Tabs,
  TextField,
  cn,
  useThemeColor
} from "heroui-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEBOUNCE_MS = 500;

type ExpenseListItem =
  | { type: "header"; title: string; id: string }
  | { type: "expense"; data: any; id: string };

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function GroupExpensesScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const debouncedSearch = useDebounced(searchQuery, DEBOUNCE_MS);

  const { data: group, isLoading: isLoadingGroup } = useGroup(id as string);

  const groupData = group as any;
  const members = groupData?.group_members || [];

  const {
    data,
    isLoading: isLoadingExpenses,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteExpenses({
    groupId: id as string,
    search: debouncedSearch,
    category: selectedCategory ?? undefined,
    memberId: selectedMember ?? undefined,
    sortBy,
  });

  // Flatten pages → grouped list items for FlashList
  const flattenedExpenses = useMemo<ExpenseListItem[]>(() => {
    const allExpenses = data?.pages.flatMap((page) => page.data) ?? [];

    const groups: Record<string, any[]> = {};
    allExpenses.forEach((expense: any) => {
      const date = new Date(expense.expense_date || expense.created_at);
      const dateKey = formatDate(date.toISOString());
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });

    return Object.keys(groups).reduce<ExpenseListItem[]>((acc, dateKey) => {
      acc.push({ type: "header", title: dateKey, id: `header-${dateKey}` });
      groups[dateKey].forEach((expense) => {
        acc.push({ type: "expense", data: expense, id: expense.id });
      });
      return acc;
    }, []);
  }, [data]);

  const memberMap = useMemo(() => {
    const map = new Map();
    groupData?.group_members?.forEach((member: any) => {
      map.set(member.user_id, {
        id: member.user_id,
        name: member.user?.name,
        avatar_url: member.user?.avatar_url,
      });
    });
    return map;
  }, [groupData]);

  const memberOptions = useMemo(() =>
    (groupData?.group_members ?? []).map((member: any) => ({
      value: member.user_id,
      label: member.user?.name || t('search.default_user', { defaultValue: "Người dùng" }),
    })),
    [groupData, t]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ExpenseListItem; index: number }) => {
      if (item.type === "header") {
        return (
          <Animated.View
            entering={FadeInUp.delay(index * 30).duration(250)}
            exiting={FadeOut.duration(200)}
          >
            <AppText className="text-lg font-bold text-foreground mb-4 px-6 mt-6">
              {item.title}
            </AppText>
          </Animated.View>
        );
      }

      const { data: expense } = item;
      return (
        <Animated.View
          className="px-6 mb-3"
          entering={FadeInUp.delay(index * 40)
            .duration(300)
            .springify()
            .damping(15)}
          exiting={FadeOut.duration(200)}
        >
          <ExpenseCard
            expense={expense}
            currency={groupData?.currency || "VND"}
            memberMap={memberMap}
            currentUserId={user?.id}
            onPress={() => router.push(`/expense/${expense.id}` as any)}
            className="mb-1"
          />
        </Animated.View>
      );
    },
    [groupData?.currency, memberMap, user?.id, router, t]
  );

  const hasActiveFilters = !!(debouncedSearch || selectedCategory || selectedMember);

  if (isLoadingGroup || isLoadingExpenses) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" color={accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <StickyHeader title={t('search.header.expenses', { defaultValue: "Khoản chi" })} />
        <ErrorState
          title={t('common.error', { defaultValue: "Không thể tải khoản chi" })}
          message={error instanceof Error ? error.message : t('common.error_occurred', { defaultValue: "Đã xảy ra lỗi" })}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title={t('search.header.expenses', { defaultValue: "Khoản chi" })} />

      {/* Filters */}
      <View className="px-6 py-4 bg-surface border-b border-border/10 gap-4">
        {/* Search */}
        <TextField className="bg-surface-secondary border border-border/10 rounded-xl">
          <View className="justify-center">
            <Input
              placeholder={t('search.placeholder', { defaultValue: "Tìm kiếm khoản chi..." })}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="h-12 pl-10"
            />
            <View className="absolute left-3" pointerEvents="none">
              <IconSymbol name="magnifyingglass" size={18} color={muted} />
            </View>
            {searchQuery.length > 0 && (
              <PressableFeedback
                onPress={() => setSearchQuery("")}
                className="absolute right-3"
              >
                <IconSymbol name="xmark.circle.fill" size={18} color={muted} />
              </PressableFeedback>
            )}
          </View>
        </TextField>

        {/* Category and Member Filters */}
        <View className="flex-row gap-3">
          <Select
            value={
              selectedCategory
                ? EXPENSE_CATEGORIES.find(
                    (c) => c.value === selectedCategory
                  ) || null
                : null
            }
            onValueChange={(opt: any) =>
              setSelectedCategory(opt?.value || null)
            }
            className="flex-1"
          >
            <Select.Trigger className="h-12 border border-border/10 bg-surface-secondary rounded-xl px-4">
              <Select.Value placeholder={t('common.category', { defaultValue: "Danh mục" })} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content presentation="popover" placement="bottom" width={200} className="rounded-xl bg-surface border border-border/10">
                <Select.Item value={null} label={t('common.all_categories', { defaultValue: "Tất cả danh mục" })} className="p-4">
                  <Select.ItemLabel />
                  <Select.ItemIndicator />
                </Select.Item>
                {EXPENSE_CATEGORIES.map((category) => (
                  <Select.Item
                    key={category.value}
                    value={category.value}
                    label={category.label}
                    className="p-4"
                  >
                    <Select.ItemLabel />
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Portal>
          </Select>

          <Select
            value={
              selectedMember
                ? memberOptions.find((m) => m.value === selectedMember) || null
                : null
            }
            onValueChange={(opt: any) =>
              setSelectedMember(opt?.value || null)
            }
            className="flex-1"
          >
            <Select.Trigger className="h-12 border border-border/10 bg-surface-secondary rounded-xl px-4">
              <Select.Value placeholder={t('search.default_user', { defaultValue: "Thành viên" })} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content presentation="popover" placement="bottom" width={200} className="rounded-xl bg-surface border border-border/10">
                <Select.Item value={null} label={t('common.all_members', { defaultValue: "Tất cả thành viên" })} className="p-4">
                  <Select.ItemLabel />
                  <Select.ItemIndicator />
                </Select.Item>
                {memberOptions.map((member) => (
                  <Select.Item
                    key={member.value}
                    value={member.value}
                    label={member.label}
                    className="p-4"
                  >
                    <Select.ItemLabel />
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Portal>
          </Select>
        </View>

        {/* Sort Tabs */}
        <View className="flex-row justify-center">
          <Tabs
            value={sortBy}
            onValueChange={(v) => setSortBy(v as "date" | "amount")}
            variant="primary"
          >
            <Tabs.List>
              <Tabs.Indicator className="bg-accent shadow-none" />
              <Tabs.Trigger value="date" className="px-6 py-2 rounded-full">
                {({ isSelected }) => (
                  <Tabs.Label
                    className={cn(
                      "font-bold text-sm",
                      isSelected ? "text-white" : "text-foreground"
                    )}
                  >
                    {t('common.date', { defaultValue: "Ngày" })}
                  </Tabs.Label>
                )}
              </Tabs.Trigger>
              <Tabs.Trigger value="amount" className="px-6 py-2 rounded-full">
                {({ isSelected }) => (
                  <Tabs.Label
                    className={cn(
                      "font-bold text-sm",
                      isSelected ? "text-white" : "text-foreground"
                    )}
                  >
                    {t('common.amount', { defaultValue: "Số tiền" })}
                  </Tabs.Label>
                )}
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </View>
      </View>

      {/* Expenses List */}
      <FlashList
        data={flattenedExpenses}
        renderItem={renderItem}
        // @ts-expect-error - FlashList type issues
        estimatedItemSize={100}
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.type}
        extraData={t}
        onRefresh={() => refetch()}
        refreshing={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <Spinner size="sm" color={accent} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="doc.text.fill"
            title={hasActiveFilters ? t('search.no_results_title', { defaultValue: "Không tìm thấy kết quả" }) : t('common.no_expenses', { defaultValue: "Chưa có khoản chi nào" })}
            description={
              hasActiveFilters ? t('group.expenses.empty_filter', { defaultValue: "Thử thay đổi bộ lọc" }) : t('group.expenses.empty_start', { defaultValue: "Thêm khoản chi mới để bắt đầu" })
            }
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 10 }}
      />
    </View>
  );
}
