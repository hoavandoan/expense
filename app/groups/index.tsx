import { ScreenScrollView } from "@/components/screen-scroll-view";
import { EmptyState } from "@/components/ui/empty-state";
import { GroupCard } from "@/components/ui/group-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { useGroups } from "@/lib/hooks";
import { useRouter } from "expo-router";
import { Button, Spinner, useThemeColor } from "heroui-native";
import React from "react";
import { View } from "react-native";

export default function GroupsListScreen() {
  const router = useRouter();
  const accent = useThemeColor("accent");
  const { data: groups, isLoading } = useGroups();

  return (
    <View className="flex-1 bg-background">
      <StickyHeader 
        title="Tất cả nhóm" 
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
      
      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <Spinner size="lg" color={accent} />
          </View>
        ) : groups && groups.length > 0 ? (
          <View className="gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                title={group.name}
                memberCount={group.memberCount || 0}
                balance={group.totalExpenses || 0}
                members={
                  group.group_members?.map((m: any) => ({
                    id: m.user_id,
                    name: m.user?.name || "",
                    avatarUrl: m.user?.avatar_url,
                  })) || []
                }
                onPress={() => router.push(`/group/${group.id}` as any)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="person.3.fill"
            title="Chưa có nhóm nào"
            description="Tạo nhóm mới hoặc tham gia nhóm bạn bè để bắt đầu chia sẻ chi phí."
            actionLabel="Tạo nhóm ngay"
            onAction={() => router.push("/add-group")}
          />
        )}
      </ScreenScrollView>
    </View>
  );
}