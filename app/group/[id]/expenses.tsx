import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ExpenseCard } from "@/components/ui/expense-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { EXPENSE_CATEGORIES } from "@/constants";
import { useExpenses, useGroup } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatDate } from "@/lib/utils";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  PressableFeedback,
  Select,
  Spinner,
  Tabs,
  TextField,
  cn,
  useThemeColor
} from "heroui-native";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ExpenseListItem = 
  | { type: "header"; title: string; id: string }
  | { type: "expense"; data: any; id: string };

export default function GroupExpensesScreen() {
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

  const { data: group, isLoading: isLoadingGroup } = useGroup(id as string);
  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    error,
    refetch,
  } = useExpenses(id as string);

  const groupData = group as any;
  const members = groupData?.group_members || [];

  const flattenedExpenses = useMemo(() => {
    if (!expenses) return [];

    let filtered = expenses;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((expense: any) => {
        const title = expense.title?.toLowerCase() || "";
        const description = expense.description?.toLowerCase() || "";
        return title.includes(query) || description.includes(query);
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (expense: any) => expense.category === selectedCategory
      );
    }

    // Filter by member
    if (selectedMember) {
      filtered = filtered.filter((expense: any) => {
        if (expense.paid_by === selectedMember) return true;
        return expense.expense_splits?.some(
          (split: any) => split.user_id === selectedMember
        );
      });
    }

    // Sort
    filtered = [...filtered].sort((a: any, b: any) => {
      if (sortBy === "amount") {
        return b.amount - a.amount;
      }
      // Sort by date (newest first)
      return (
        new Date(b.expense_date || b.created_at).getTime() -
        new Date(a.expense_date || a.created_at).getTime()
      );
    });

    // Group and flatten
    const groups: Record<string, any[]> = {};
    filtered.forEach((expense: any) => {
      const date = new Date(expense.expense_date || expense.created_at);
      const dateKey = formatDate(date.toISOString());
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });

    const flattened: ExpenseListItem[] = [];
    Object.keys(groups).forEach((dateKey) => {
      flattened.push({ type: "header", title: dateKey, id: `header-${dateKey}` });
      groups[dateKey].forEach((expense) => {
        flattened.push({ type: "expense", data: expense, id: expense.id });
      });
    });

    return flattened;
  }, [expenses, searchQuery, selectedCategory, selectedMember, sortBy]);

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

  const renderItem = useCallback(({ item, index }: { item: ExpenseListItem; index: number }) => {
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
        entering={FadeInUp.delay(index * 40).duration(300).springify().damping(15)}
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
  }, [groupData?.currency, memberMap, user?.id, router]);

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
        <StickyHeader title="Khoản chi" />
        <ErrorState
          title="Không thể tải khoản chi"
          message={error instanceof Error ? error.message : "Đã xảy ra lỗi"}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Khoản chi" />

      {/* Filters */}
      <View className="px-6 py-4 bg-surface border-b border-divider/10 gap-4">
        {/* Search */}
        <TextField className="bg-surface-secondary border border-divider/10 rounded-xl">
          <View className="justify-center">
            <TextField.Input
              placeholder="Tìm kiếm khoản chi..."
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
            placeholder="Tất cả danh mục"
            className="flex-1"
          >
            <Select.Trigger className="h-12 border border-divider/10 bg-surface-secondary rounded-xl px-4">
              <Select.Value placeholder="Danh mục" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content className="rounded-xl bg-surface border border-divider/10">
                <Select.Item value={null} label="Tất cả danh mục" />
                {EXPENSE_CATEGORIES.map((category) => (
                  <Select.Item
                    key={category.value}
                    value={category.value}
                    label={category.label}
                  />
                ))}
              </Select.Content>
            </Select.Portal>
          </Select>

          <Select
            value={
              selectedMember
                ? members.find((m: any) => m.user_id === selectedMember) || null
                : null
            }
            onValueChange={(opt: any) =>
              setSelectedMember(opt?.user_id || null)
            }
            placeholder="Tất cả thành viên"
            className="flex-1"
          >
            <Select.Trigger className="h-12 border border-divider/10 bg-surface-secondary rounded-xl px-4">
              <Select.Value placeholder="Thành viên" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content className="rounded-xl bg-surface border border-divider/10">
                <Select.Item value={null} label="Tất cả thành viên" />
                {members.map((member: any) => (
                  <Select.Item
                    key={member.user_id}
                    value={member.user_id}
                    label={member.user?.name || "Thành viên"}
                  />
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
            variant="pill"
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
                    Ngày
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
                    Số tiền
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
        keyExtractor={(item) => item.id}
        estimatedItemSize={100}
        getItemType={(item) => item.type}
        onRefresh={refetch}
        refreshing={false}
        ListEmptyComponent={
          <EmptyState
            icon="doc.text.fill"
            title={
              searchQuery || selectedCategory || selectedMember
                ? "Không tìm thấy kết quả"
                : "Chưa có khoản chi nào"
            }
            description={
              searchQuery || selectedCategory || selectedMember
                ? "Thử thay đổi bộ lọc"
                : "Thêm khoản chi mới để bắt đầu"
            }
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 10 }}
      />
    </View>
  );
}
