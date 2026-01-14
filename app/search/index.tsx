import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { CATEGORY_CONFIG } from "@/constants";
import { useSearch } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
    Avatar,
    Card,
    PressableFeedback,
    Spinner,
    TextField,
    useThemeColor,
} from "heroui-native";
import React, { useMemo, useState } from "react";
import { View } from "react-native";

export default function SearchScreen() {
  const router = useRouter();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");
  const foreground = useThemeColor("foreground");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: searchResults, isLoading } = useSearch(searchQuery, { limit: 10 });

  const handleSearchItemPress = (type: "expense" | "group" | "user", id: string) => {
    if (type === "expense") {
      router.push(`/expense/${id}` as any);
    } else if (type === "group") {
      router.push(`/group/${id}` as any);
    } else if (type === "user") {
      // TODO: Navigate to user profile
    }
  };

  const handleRemoveRecentSearch = (item: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== item));
  };

  const hasResults = useMemo(() => {
    if (!searchResults) return false;
    return (
      searchResults.expenses.length > 0 ||
      searchResults.groups.length > 0 ||
      searchResults.users.length > 0
    );
  }, [searchResults]);

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Tìm kiếm" />

      <View className="px-6 py-4">
        <TextField>
          <View className="justify-center">
            <TextField.Input
              placeholder="Tìm nhóm, bạn bè, khoản chi..."
              placeholderTextColor={muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-surface border border-divider/10 rounded-2xl pl-12 h-16 text-foreground"
              autoFocus
            />
            <View className="absolute left-4" pointerEvents="none">
              <IconSymbol name="magnifyingglass" size={18} color={muted} />
            </View>
            {searchQuery.length > 0 && (
              <PressableFeedback
                onPress={() => setSearchQuery("")}
                className="absolute right-4 w-8 h-8 items-center justify-center"
              >
                <IconSymbol name="xmark.circle.fill" size={20} color={muted} />
              </PressableFeedback>
            )}
          </View>
        </TextField>
      </View>

      {isLoading && searchQuery.length >= 2 ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color={accent} />
        </View>
      ) : searchQuery.length >= 2 && searchResults ? (
        hasResults ? (
          <ScreenScrollView withKeyboardAvoidingView>
            <View className="px-6 pb-20">
              {/* Expenses Results */}
              {searchResults.expenses.length > 0 && (
                <View className="mb-8">
                  <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                    KHOẢN CHI ({searchResults.expenses.length})
                  </AppText>
                  <View className="gap-3">
                    {searchResults.expenses.map((expense) => {
                      const categoryConfig =
                        CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;
                      return (
                        <PressableFeedback
                          key={expense.id}
                          onPress={() => handleSearchItemPress("expense", expense.id)}
                        >
                          <Card className="rounded-2xl border border-divider/10 bg-surface p-4">
                            <View className="flex-row items-center gap-3">
                              <View
                                className={`w-12 h-12 rounded-xl items-center justify-center ${categoryConfig.bg}`}
                              >
                                <IconSymbol
                                  name={categoryConfig.icon}
                                  size={20}
                                  color={categoryConfig.color}
                                />
                              </View>
                              <View className="flex-1">
                                <AppText className="font-bold text-base" numberOfLines={1}>
                                  {expense.title}
                                </AppText>
                                <AppText className="text-muted text-sm" numberOfLines={1}>
                                  {expense.paidByUser?.name || "Người dùng"} •{" "}
                                  {expense.group?.name || "Nhóm"}
                                </AppText>
                              </View>
                              <AppText className="font-bold text-lg">
                                {formatCurrency(expense.amount, expense.group?.currency || "VND")}
                              </AppText>
                            </View>
                          </Card>
                        </PressableFeedback>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Groups Results */}
              {searchResults.groups.length > 0 && (
                <View className="mb-8">
                  <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                    NHÓM ({searchResults.groups.length})
                  </AppText>
                  <View className="gap-3">
                    {searchResults.groups.map((group) => (
                      <PressableFeedback
                        key={group.id}
                        onPress={() => handleSearchItemPress("group", group.id)}
                      >
                        <Card className="rounded-2xl border border-divider/10 bg-surface p-4">
                          <View className="flex-row items-center gap-3">
                            {group.coverImageUrl ? (
                              <Image
                                source={{ uri: group.coverImageUrl }}
                                className="w-12 h-12 rounded-xl"
                                contentFit="cover"
                              />
                            ) : (
                              <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center">
                                <IconSymbol name="person.3.fill" size={24} color={accent} />
                              </View>
                            )}
                            <View className="flex-1">
                              <AppText className="font-bold text-base" numberOfLines={1}>
                                {group.name}
                              </AppText>
                              {group.description && (
                                <AppText className="text-muted text-sm" numberOfLines={1}>
                                  {group.description}
                                </AppText>
                              )}
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={muted} />
                          </View>
                        </Card>
                      </PressableFeedback>
                    ))}
                  </View>
                </View>
              )}

              {/* Users Results */}
              {searchResults.users.length > 0 && (
                <View className="mb-8">
                  <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                    NGƯỜI DÙNG ({searchResults.users.length})
                  </AppText>
                  <View className="gap-3">
                    {searchResults.users.map((user) => (
                      <PressableFeedback
                        key={user.id}
                        onPress={() => handleSearchItemPress("user", user.id)}
                      >
                        <Card className="rounded-2xl border border-divider/10 bg-surface p-4">
                          <View className="flex-row items-center gap-3">
                            {user.avatarUrl ? (
                              <Avatar size="md" alt={user.name}>
                                <Avatar.Image source={{ uri: user.avatarUrl }} />
                              </Avatar>
                            ) : (
                              <Avatar size="md" alt={user.name} className="bg-accent/10">
                                <Avatar.Fallback>
                                  <AppText className="text-accent font-bold">
                                    {user.name.charAt(0)}
                                  </AppText>
                                </Avatar.Fallback>
                              </Avatar>
                            )}
                            <View className="flex-1">
                              <AppText className="font-bold text-base">{user.name}</AppText>
                              {user.email && (
                                <AppText className="text-muted text-sm">{user.email}</AppText>
                              )}
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={muted} />
                          </View>
                        </Card>
                      </PressableFeedback>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScreenScrollView>
        ) : (
          <EmptyState
            icon="magnifyingglass"
            title="Không tìm thấy kết quả"
            description={`Không có kết quả nào cho "${searchQuery}"`}
          />
        )
      ) : (
        <ScreenScrollView withKeyboardAvoidingView>
          {recentSearches.length > 0 && (
            <View className="p-6">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                GẦN ĐÂY
              </AppText>
              <View className="gap-2">
                {recentSearches.map((item, idx) => (
                  <PressableFeedback
                    key={idx}
                    onPress={() => setSearchQuery(item)}
                    className="flex-row items-center justify-between py-4 border-b border-divider/10"
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
          )}
        </ScreenScrollView>
      )}
    </View>
  );
}
