import { EmptyState } from "@/components/ui/empty-state";
import { GroupCard } from "@/components/ui/group-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { useGroups, useTranslation } from "@/lib/hooks";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Button, Spinner, useThemeColor } from "heroui-native";
import React, { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GroupsListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const { data: groups, isLoading, refetch } = useGroups();

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View 
      className="mb-4"
      entering={FadeInUp.delay(index * 60).duration(300).springify().damping(15)}
      exiting={FadeOut.duration(200)}
    >
      <GroupCard
        title={item.name}
        memberCount={item.memberCount || 0}
        balance={item.totalExpenses || 0}
        members={
          item.group_members?.map((m: any) => ({
            id: m.user_id,
            name: m.user?.name || "",
            avatarUrl: m.user?.avatar_url,
          })) || []
        }
        onPress={() => router.push(`/group/${item.id}` as any)}
      />
    </Animated.View>
  ), [router, t]);


  return (
    <View className="flex-1 bg-background">
      <StickyHeader 
        title={t('groups.title', { defaultValue: 'Tất cả nhóm' })} 
        rightContent={
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => router.push("/add-group")}
            className="w-10 h-10 rounded-full"
          >
            <IconSymbol name="plus" size={20} color={accent} />
          </Button>
        }
      />
      
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color={accent} />
        </View>
      ) : (
        <FlashList
          data={groups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          // @ts-expect-error - FlashList types are incomplete
          estimatedItemSize={150}
          extraData={t}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="person.3.fill"
              title={t('groups.empty_title', { defaultValue: 'Chưa có nhóm nào' })}
              description={t('groups.empty_desc', { defaultValue: 'Tạo nhóm mới hoặc tham gia nhóm bạn bè để bắt đầu chia sẻ chi phí.' })}
              actionLabel={t('groups.create_btn', { defaultValue: 'Tạo nhóm ngay' })}
              onAction={() => router.push("/add-group")}
            />
          }
          contentContainerStyle={{ 
            paddingHorizontal: 20, 
            paddingTop: 20,
            paddingBottom: insets.bottom + 100 
          }}
        />
      )}
    </View>
  );
}