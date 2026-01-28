import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { useGroup } from "@/lib/hooks";
import { FlashList } from "@shopify/flash-list";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
    Avatar,
    Button,
    Card,
    PressableFeedback,
    Spinner,
    useThemeColor,
    useToast,
} from "heroui-native";
import React, { useCallback, useMemo } from "react";
import { Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GroupMembersScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const foreground = useThemeColor("foreground");
  const success = useThemeColor("success");
  const danger = useThemeColor("danger");

  const { data: group, isLoading } = useGroup(id as string);

  const inviteCode = (group as any)?.invite_code || "";

  const { toast } = useToast();

  const handleCopyInviteCode = async () => {
    if (!inviteCode) {
      toast.show({
        label: "Lỗi",
        description: "Không tìm thấy mã mời cho nhóm này",
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: "Đóng",
        onActionPress: ({ hide }) => hide(),
      });
      return;
    }

    await Clipboard.setStringAsync(inviteCode);
    toast.show({
      label: "Đã sao chép",
      description: "Mã mời đã được lưu vào bộ nhớ tạm",
      variant: "success",
      icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
      actionLabel: "Đóng",
      onActionPress: ({ hide }) => hide(),
    });
  };

  const handleShareInvite = async () => {
    if (!inviteCode) {
      toast.show({
        label: "Lỗi",
        description: "Không tìm thấy mã mời cho nhóm này",
        variant: "danger",
        actionLabel: "Đóng",
        onActionPress: ({ hide }) => hide(),
      });
      return;
    }

    try {
      await Share.share({
        message: `Tham gia nhóm "${group?.name}" trên SplitSmart!\n\nMã mời: ${inviteCode}\n\nTải app và nhập mã để tham gia.`,
      });
    } catch (error: any) {
      toast.show({
        label: "Lỗi chia sẻ",
        description: error.message || "Đã có lỗi xảy ra khi thực hiện chia sẻ",
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: "Thử lại",
        onActionPress: ({ hide }) => hide(),
      });
    }
  };

  const members = (group as any)?.group_members || [];

  const renderMember = useCallback(({ item: member, index }: { item: any; index: number }) => {
    const userData = member.user;
    const isOwner = member.role === "owner";

    return (
      <View>
        <View className="px-4 py-4 flex-row items-center bg-surface">
          <Avatar
            size="md"
            alt={userData?.name || "User"}
            className="mr-4"
          >
            {userData?.avatar_url ? (
              <Avatar.Image
                source={{ uri: userData.avatar_url }}
                asChild
              >
                <Image
                  source={{ uri: userData.avatar_url }}
                  style={{ width: "100%", height: "100%" }}
                />
              </Avatar.Image>
            ) : (
              <Avatar.Fallback className="bg-accent/10">
                <AppText className="font-bold text-accent">
                  {userData?.name?.charAt(0) || "?"}
                </AppText>
              </Avatar.Fallback>
            )}
          </Avatar>
          <View className="flex-1">
            <AppText className="font-bold text-base">
              {userData?.name || "Thành viên"}
            </AppText>
            <AppText className="text-muted text-xs">
              {userData?.email}
            </AppText>
          </View>
          {isOwner && (
            <View className="bg-accent/10 px-3 py-1 rounded-full">
              <AppText className="text-accent text-[10px] font-bold">
                Chủ nhóm
              </AppText>
            </View>
          )}
        </View>
        {index < members.length - 1 && (
          <View className="h-px bg-divider/10 mx-4" />
        )}
      </View>
    );
  }, [members.length]);

  const ListHeader = useMemo(() => (
    <View className="p-5">
      {/* Invite Code Card */}
      <View className="mb-6">
        <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
          MÃ MỜI
        </AppText>
        <Card className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <AppText className="text-muted text-xs mb-1">
                Chia sẻ mã này để mời bạn bè
              </AppText>
              <AppText className="text-2xl font-bold text-accent tracking-widest">
                {inviteCode || "------"}
              </AppText>
            </View>
            <View className="flex-row gap-2">
              <PressableFeedback
                className="w-12 h-12 rounded-xl bg-surface items-center justify-center border border-divider/10"
                onPress={handleCopyInviteCode}
              >
                <IconSymbol name="link" size={20} color={accent} />
              </PressableFeedback>
              <PressableFeedback
                className="w-12 h-12 rounded-xl bg-accent items-center justify-center"
                onPress={handleShareInvite}
              >
                <IconSymbol
                  name="square.and.arrow.up"
                  size={20}
                  color="white"
                />
              </PressableFeedback>
            </View>
          </View>
        </Card>
      </View>

      <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
        DANH SÁCH THÀNH VIÊN ({members.length})
      </AppText>
    </View>
  ), [inviteCode, members.length, accent]);

  const ListFooter = useMemo(() => (
    <View className="p-5 pb-20">
      <Button
        variant="secondary"
        className="h-14 rounded-2xl border border-divider/10 bg-surface/5"
        onPress={handleShareInvite}
      >
        <View className="flex-row items-center gap-2">
          <IconSymbol
            name="square.and.arrow.up"
            size={18}
            color={foreground}
          />
          <Button.Label className="font-bold">Chia sẻ lời mời</Button.Label>
        </View>
      </Button>
    </View>
  ), [handleShareInvite, foreground]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" color={accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StickyHeader
        title="Thành viên"
        rightContent={
          <PressableFeedback
            className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center"
            onPress={handleShareInvite}
          >
            <IconSymbol name="person.badge.plus" size={20} color={accent} />
          </PressableFeedback>
        }
      />

      <FlashList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      />
    </View>
  );
}
