import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ModalHeader } from "@/components/ui/modal-header";
import { ShareQRSheet } from "@/components/ui/share-qr-sheet";
import { useGroup, useLeaveGroup, useUpdateGroup } from "@/lib/hooks";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useAuthStore } from "@/lib/stores/auth-store";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Input,
  PressableFeedback,
  Separator,
  Skeleton,
  Spinner,
  TextField,
  useThemeColor,
  useToast,
} from "heroui-native";
import React, { useState } from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function GroupSettingsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor("accent");
  const danger = useThemeColor("danger");
  const success = useThemeColor("success");
  const warning = useThemeColor("warning");
  const { user } = useAuthStore();
  const surface = useThemeColor("surface");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);

  const { data: group, isLoading, error, refetch } = useGroup(id as string);
  const updateGroup = useUpdateGroup();
  const leaveGroup = useLeaveGroup();
  const { toast } = useToast();

  const groupData = group as any;
  const currentUserMember = groupData?.group_members?.find(
    (m: any) => m.user_id === user?.id
  );
  const isOwner = currentUserMember?.role === "owner";
  const isAdmin = currentUserMember?.role === "admin" || isOwner;
  const canEdit = isAdmin;

  const handleLeaveGroup = async () => {
    if (!group) return;

    try {
      await leaveGroup.mutateAsync(group.id);
      toast.show({
        label: t("group_settings.leave_success_title"),
        description: t("group_settings.leave_success_desc"),
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: t("ok"),
        onActionPress: ({ hide }) => hide(),
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      toast.show({
        label: t("group_settings.leave_error_title"),
        description: error.message || t("error_processing_request"),
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: t("retry"),
        onActionPress: ({ hide }) => hide(),
      });
    }
  };

  const handleUpdateName = async () => {
    if (!group || !editedName.trim()) return;

    try {
      await updateGroup.mutateAsync({
        groupId: group.id,
        name: editedName.trim(),
      });
      setIsEditingName(false);
      toast.show({
        label: t("success"),
        description: t("group_settings.update_name_success"),
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: t("ok"),
        onActionPress: ({ hide }) => hide(),
      });
    } catch (error: any) {
      toast.show({
        label: t("group_settings.update_error_title"),
        description: error.message || t("group_settings.update_error_desc"),
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: t("retry"),
        onActionPress: ({ hide }) => hide(),
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-6">
        <Skeleton className="w-full h-64 rounded-2xl mb-6" />
        <Skeleton className="w-3/4 h-8 rounded-xl mb-4" />
        <Skeleton className="w-1/2 h-6 rounded-xl mb-8" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View className="flex-1 bg-background">
        <ModalHeader title={t("group_settings.title")} variant="back" />
        <ErrorState
          title={t("group_settings.load_error")}
          message={
            error instanceof Error ? error.message : t("group_detail.not_found_title")
          }
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const members = groupData?.group_members || [];

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title={t("group_settings.title")} variant="back" />

      <ScreenScrollView withKeyboardAvoidingView>
        <View className="gap-6">
          {/* Group Info */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
              {t("group_settings.info_label")}
            </AppText>
            <Card className="rounded-2xl border border-border/10 overflow-hidden bg-surface">
              <View className="p-4">
                {isEditingName && canEdit ? (
                  <View className="gap-3">
                    <TextField>
                      <Input
                        value={editedName}
                        onChangeText={setEditedName}
                        placeholder={t("group_settings.name_label")}
                        autoFocus
                      />
                    </TextField>
                    <View className="flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onPress={() => {
                          setIsEditingName(false);
                          setEditedName("");
                        }}
                      >
                        <Button.Label className="font-semibold">
                          {t("common.cancel")}
                        </Button.Label>
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1"
                        onPress={handleUpdateName}
                        isDisabled={updateGroup.isPending || !editedName.trim()}
                      >
                        {updateGroup.isPending ? (
                          <Spinner size="sm" color="white" />
                        ) : (
                          <Button.Label className="font-bold">{t("common.save")}</Button.Label>
                        )}
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <AppText className="text-muted text-xs mb-1">
                        {t("group_settings.name_display_label")}
                      </AppText>
                      <AppText className="text-lg font-bold">
                        {group.name}
                      </AppText>
                    </View>
                    {canEdit && (
                      <Button
                        onPress={() => {
                          setEditedName(group.name);
                          setIsEditingName(true);
                        }}
                        variant="ghost"
                        isIconOnly
                        className="size-9"
                      >
                        <IconSymbol name="pencil" size={18} color={accent} />
                      </Button>
                    )}
                  </View>
                )}
              </View>
              <Separator className="bg-border/10" />
              <View className="p-4">
                <AppText className="text-muted text-xs mb-1">{t("group_settings.invite_code_label")}</AppText>
                <View className="flex-row items-center justify-between">
                  <AppText className="text-base font-semibold font-mono">
                    {groupData.invite_code || "N/A"}
                  </AppText>
                  <Button
                    onPress={async () => {
                      if (!groupData.invite_code) return;
                      await Clipboard.setStringAsync(groupData.invite_code);
                      toast.show({
                        label: t("common.copied"),
                        description: t("group_members.copy_success"),
                        variant: "success",
                        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
                        actionLabel: t("common.close"),
                        onActionPress: ({ hide }) => hide(),
                      });
                    }}
                    variant="ghost"
                    isIconOnly
                    className="size-9"
                  >
                    <IconSymbol name="doc.on.doc" size={18} color={accent} />
                  </Button>
                </View>
              </View>
            </Card>
          </View>

          {/* QR Share Section */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
              {t("group_settings.share_label")}
            </AppText>
            <Card className="rounded-2xl border border-border/10 overflow-hidden bg-surface">
              <PressableFeedback onPress={() => setIsShareSheetOpen(true)}>
                <View className="p-4 flex-row items-center gap-4">
                  <View className="bg-white p-2 rounded-xl border border-border/10">
                    <QRCode
                      value={`expense://join-group/${groupData.invite_code}`}
                      size={60}
                    />
                  </View>
                  <View className="flex-1">
                    <AppText className="font-bold text-base mb-0.5">{t("group_settings.qr_title")}</AppText>
                    <AppText className="text-muted text-xs">{t("group_settings.qr_desc")}</AppText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="gray" />
                </View>
              </PressableFeedback>
            </Card>
          </View>

          {/* Members */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest ml-1">
                {t("group_settings.members_label", { count: members.length })}
              </AppText>
              {canEdit && (
                <PressableFeedback
                  onPress={() => {
                    // TODO: Navigate to add member screen
                    toast.show({
                      label: t("group_settings.add_member_temp"),
                      variant: "warning",
                      icon: <IconSymbol name="exclamationmark.triangle.fill" size={20} color={warning} />,
                    });
                  }}
                >
                  <AppText className="text-accent font-semibold text-sm">
                    {t("group_settings.add_member_btn")}
                  </AppText>
                </PressableFeedback>
              )}
            </View>
            <Card className="rounded-2xl border border-border/10 overflow-hidden bg-surface">
              {members.length === 0 ? (
                <View className="p-6">
                  <EmptyState
                    icon="person.3.fill"
                    title={t("group_settings.no_members_title")}
                    description={t("group_settings.no_members_desc")}
                  />
                </View>
              ) : (
                members.map((member: any, idx: number) => {
                  const memberUser = member.user || {};
                  const isCurrentUser = member.user_id === user?.id;
                  const canRemove =
                    canEdit && !isCurrentUser && member.role !== "owner";

                  return (
                    <View key={member.id || idx}>
                      <View className="p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                          {memberUser.avatar_url ? (
                            <Avatar size="md" alt={memberUser.name || ""}>
                              <Avatar.Image
                                source={{ uri: memberUser.avatar_url }}
                              />
                            </Avatar>
                          ) : (
                            <Avatar
                              size="md"
                              alt={memberUser.name || ""}
                              className="bg-accent/10"
                            >
                              <Avatar.Fallback>
                                <AppText className="text-accent font-bold">
                                  {memberUser.name?.charAt(0) || "U"}
                                </AppText>
                              </Avatar.Fallback>
                            </Avatar>
                          )}
                          <View className="flex-1">
                            <AppText className="font-bold text-base">
                              {isCurrentUser
                                ? t("group_card.you")
                                : memberUser.name || t("group_detail.member")}
                            </AppText>
                            <AppText className="text-muted text-xs">
                              {memberUser.email || ""}
                            </AppText>
                          </View>
                          {member.role === "owner" && (
                            <View className="bg-accent/10 px-2 py-1 rounded-full">
                              <AppText className="text-accent text-xs font-bold">
                                {t("group_members.owner")}
                              </AppText>
                            </View>
                          )}
                          {member.role === "admin" &&
                            member.role !== "owner" && (
                              <View className="bg-surface-secondary px-2 py-1 rounded-full">
                                <AppText className="text-muted text-xs font-semibold">
                                  Admin
                                </AppText>
                              </View>
                            )}
                        </View>
                        {canRemove && (
                          <Button
                            onPress={() => {
                              // TODO: Implement remove member
                              toast.show({
                                label: t("group_settings.remove_member_temp"),
                                variant: "warning",
                                icon: <IconSymbol name="exclamationmark.triangle.fill" size={20} color={warning} />,
                              });
                            }}
                            variant="danger-soft"
                            isIconOnly
                            className="size-8"
                          >
                            <IconSymbol name="trash" size={18} color={danger} />
                          </Button>
                        )}
                      </View>
                      {idx < members.length - 1 && (
                        <Separator className="bg-border/10" />
                      )}
                    </View>
                  );
                })
              )}
            </Card>
          </View>

          {/* Danger Zone */}
          <View>
            <Button variant="danger" onPress={() => setShowLeaveDialog(true)}>
              <IconSymbol name="arrow.right.square" size={20} color={surface} />
              <Button.Label>{t("group_settings.leave_btn")}</Button.Label>
            </Button>
          </View>
        </View>
      </ScreenScrollView>

      <ConfirmDialog
        isOpen={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        title={t("group_settings.leave_dialog_title")}
        description={t("group_settings.leave_dialog_desc", { name: group.name })}
        confirmLabel={t("group_settings.leave_btn")}
        cancelLabel={t("cancel")}
        variant="danger"
        isLoading={leaveGroup.isPending}
        onConfirm={handleLeaveGroup}
      />

      <ShareQRSheet
        isOpen={isShareSheetOpen}
        onOpenChange={setIsShareSheetOpen}
        groupName={group.name}
        inviteCode={groupData.invite_code}
      />
    </View>
  );
}
