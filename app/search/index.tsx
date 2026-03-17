import { AppText } from "@/components/app-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpenseCard } from "@/components/ui/expense-card";
import { GroupCard } from "@/components/ui/group-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { useAuth } from '@/contexts/auth-context';
import { useSearch, useTranslation } from "@/lib/hooks";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Avatar,
  Card,
  PressableFeedback,
  SearchField,
  Spinner,
  useThemeColor
} from "heroui-native";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SearchListItem = 
  | { type: "header"; title: string; id: string }
  | { type: "expense"; data: any; id: string }
  | { type: "group"; data: any; id: string }
  | { type: "user"; data: any; id: string };

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: searchResults, isLoading } = useSearch(searchQuery, { limit: 10 });

  const flattenedResults = useMemo(() => {
    if (!searchResults || searchQuery.trim().length < 2) return [];

    const flattened: SearchListItem[] = [];
    const { expenses = [], groups = [], users = [] } = searchResults as any;

    if (expenses.length > 0) {
      flattened.push({ type: "header", title: t('search.header.expenses', { defaultValue: "Khoản chi" }), id: "header-expenses" });
      expenses.forEach((expense: any) => {
        flattened.push({ type: "expense", data: expense, id: `expense-${expense.id}` });
      });
    }

    if (groups.length > 0) {
      flattened.push({ type: "header", title: t('search.header.groups', { defaultValue: "Nhóm" }), id: "header-groups" });
      groups.forEach((group: any) => {
        flattened.push({ type: "group", data: group, id: `group-${group.id}` });
      });
    }

    if (users.length > 0) {
      flattened.push({ type: "header", title: t('search.header.users', { defaultValue: "Người dùng" }), id: "header-users" });
      users.forEach((user: any) => {
        flattened.push({ type: "user", data: user, id: `user-${user.id}` });
      });
    }

    return flattened;
  }, [searchResults, searchQuery]);

  const handleRemoveRecentSearch = (item: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== item));
  };

  const renderItem = useCallback(({ item }: { item: SearchListItem }) => {
    switch (item.type) {
      case "header":
        return (
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 mt-8 px-2">
            {item.title}
          </AppText>
        );
      case "expense":
        const expense = item.data;
        // Construct a minimal memberMap for ExpenseCard since search results might not have them all
        const memberMap = new Map();
        if (expense.paid_by_user) {
          memberMap.set(expense.paid_by, {
            id: expense.paid_by,
            name: expense.paid_by_user.name,
            avatar_url: expense.paid_by_user.avatar_url,
          });
        }
        expense.expense_splits?.forEach((split: any) => {
          if (split.user) {
            memberMap.set(split.user_id, {
              id: split.user_id,
              name: split.user.name,
              avatar_url: split.user.avatar_url,
            });
          }
        });

        return (
          <View className="mb-3">
            <ExpenseCard
              expense={expense}
              currency={expense.group?.currency || "VND"}
              memberMap={memberMap}
              currentUserId={currentUser?.id}
              onPress={() => router.push(`/expense/${expense.id}` as any)}
            />
          </View>
        );
      case "group":
        const group = item.data;
        return (
          <View className="mb-4">
            <GroupCard
              title={group.name}
              memberCount={group.group_members?.length || 0}
              balance={0}
              members={group.group_members?.map((m: any) => ({
                id: m.user_id,
                name: m.user?.name,
                avatarUrl: m.user?.avatar_url,
              })) || []}
              onPress={() => router.push(`/group/${group.id}` as any)}
            />
          </View>
        );
      case "user":
        const user = item.data;
        return (
          <View className="mb-2">
            <Card className="rounded-2xl border border-border/10 bg-surface p-4">
              <View className="flex-row items-center gap-3">
                {user.avatar_url ? (
                  <Avatar size="md" alt={user.name}>
                    <Avatar.Image source={{ uri: user.avatar_url }} asChild>
                      <Image source={{ uri: user.avatar_url }} style={{ width: "100%", height: "100%" }} />
                    </Avatar.Image>
                  </Avatar>
                ) : (
                  <Avatar size="md" alt={user.name || "U"} className="bg-accent/10">
                    <Avatar.Fallback>
                      <AppText className="text-accent font-bold">
                        {(user.name || "U").charAt(0)}
                      </AppText>
                    </Avatar.Fallback>
                  </Avatar>
                )}
                <View className="flex-1">
                  <AppText className="font-bold text-base">{user.name || t('search.default_user', { defaultValue: "Người dùng" })}</AppText>
                  {user.email && (
                    <AppText className="text-muted text-sm">{user.email}</AppText>
                  )}
                </View>
                <IconSymbol name="chevron.right" size={20} color={muted} />
              </View>
            </Card>
          </View>
        );
      default:
        return null;
    }
  }, [currentUser?.id, router, muted, t]);

  const ListHeader = useMemo(() => {
    if (searchQuery.length < 2 && recentSearches.length > 0) {
      return (
        <View className="p-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
            {t('search.recent', { defaultValue: 'GẦN ĐÂY' })}
          </AppText>
          <View className="gap-2">
            {recentSearches.map((item, idx) => (
              <PressableFeedback
                key={idx}
                onPress={() => setSearchQuery(item)}
                className="flex-row items-center justify-between py-4 border-b border-border/10"
              >
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="clock" size={16} color={muted} />
                  <AppText className="text-base">{item}</AppText>
                </View>
                <PressableFeedback
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveRecentSearch(item);
                  }}
                >
                  <IconSymbol name="multiply" size={14} color={muted} />
                </PressableFeedback>
              </PressableFeedback>
            ))}
          </View>
        </View>
      );
    }
    return null;
  }, [searchQuery, recentSearches, muted]);

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title={t('search.title', { defaultValue: 'Tìm kiếm' })} />

      {/* Search Bar */}
      <View className="px-6 py-4">
        <SearchField value={searchQuery} onChange={setSearchQuery}>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              placeholder={t('search.placeholder', { defaultValue: 'Tìm nhóm, bạn bè, khoản chi...' })}
              autoFocus
              style={{ fontSize: 16 }}
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </View>

      {/* Search Content */}
      <View className="flex-1">
        {isLoading && searchQuery.length >= 2 ? (
          <View className="flex-1 items-center justify-center">
            <Spinner size="lg" color={accent} />
          </View>
        ) : searchQuery.length < 2 ? (
            <FlashList
              data={[]}
              renderItem={() => null}
              ListHeaderComponent={ListHeader}
              ListEmptyComponent={
                recentSearches.length === 0 ? (
                  <View className="flex-1 items-center justify-center px-10 pt-20">
                    <View className="w-20 h-20 rounded-full bg-surface-secondary items-center justify-center mb-6">
                      <IconSymbol name="magnifyingglass" size={40} color={muted} />
                    </View>
                    <AppText className="text-xl font-bold text-center mb-2">
                      {t('search.empty_query_title', { defaultValue: 'Tìm kiếm bất cứ điều gì' })}
                    </AppText>
                    <AppText className="text-muted text-center leading-6">
                      {t('search.empty_query_desc', { defaultValue: 'Nhập tên khoản chi, tên nhóm hoặc email của bạn bè để tìm kiếm nhanh chóng.' })}
                    </AppText>
                  </View>
                ) : null
              }
              // @ts-expect-error - FlashList types are incomplete
              estimatedItemSize={100}
            />
        ) : flattenedResults.length > 0 ? (
          <FlashList
            data={flattenedResults}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            // @ts-expect-error - FlashList types are incomplete
            estimatedItemSize={100}
            getItemType={(item) => item.type}
            extraData={t}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <EmptyState
            icon="magnifyingglass"
            title={t('search.no_results_title', { defaultValue: 'Không tìm thấy kết quả' })}
            description={t('search.no_results_desc', { query: searchQuery, defaultValue: `Không có kết quả nào cho "${searchQuery}"` })}
          />
        )}
      </View>
    </View>
  );
}
