import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { useGroup } from "@/lib/hooks";
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
} from "heroui-native";
import React from "react";
import { Alert, Share, View } from "react-native";

export default function GroupMembersScreen() {
  const { id } = useLocalSearchParams();
  const accent = useThemeColor("accent");
  const foreground = useThemeColor("foreground");

  const { data: group, isLoading } = useGroup(id as string);

  const inviteCode = (group as any)?.invite_code || "";

  // const { toast } = useToast();

  const handleCopyInviteCode = async () => {
    if (!inviteCode) {
      Alert.alert("Lỗi", "Không tìm thấy mã mời");
      return;
    }

    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Đã sao chép", `Mã mời: ${inviteCode}`);
  };

  const handleShareInvite = async () => {
    if (!inviteCode) {
      Alert.alert("Lỗi", "Không tìm thấy mã mời");
      return;
    }

    try {
      await Share.share({
        message: `Tham gia nhóm "${group?.name}" trên SplitSmart!\n\nMã mời: ${inviteCode}\n\nTải app và nhập mã để tham gia.`,
      });
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const members = (group as any)?.group_members || [];

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

      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
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

        {/* Members List */}
        <View className="mb-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
            DANH SÁCH THÀNH VIÊN ({members.length})
          </AppText>
          <Card className="rounded-2xl border border-divider/10 overflow-hidden">
            {members.map((member: any, idx: number) => {
              const userData = member.user;
              const isOwner = member.role === "owner";

              return (
                <View key={member.id}>
                  <View className="p-4 flex-row items-center">
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
                  {idx < members.length - 1 && (
                    <View className="h-px bg-divider/10 mx-4" />
                  )}
                </View>
              );
            })}
          </Card>
        </View>

        {/* Share Button */}
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
      </ScreenScrollView>
    </View>
  );
}
