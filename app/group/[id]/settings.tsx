import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ModalHeader } from "@/components/ui/modal-header";
import { ShareQRSheet } from "@/components/ui/share-qr-sheet";
import { useGroup, useLeaveGroup, useUpdateGroup } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Divider,
  PressableFeedback,
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor("accent");
  const danger = useThemeColor("danger");
  const success = useThemeColor("success");
  const warning = useThemeColor("warning");
  const { user } = useAuthStore();
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
        label: "Đã rời nhóm",
        description: "Bạn không còn là thành viên của nhóm này nữa",
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: "OK",
        onActionPress: ({ hide }) => hide(),
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      toast.show({
        label: "Lỗi rời nhóm",
        description: error.message || "Đã có lỗi xảy ra khi thực hiện yêu cầu",
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: "Thử lại",
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
        label: "Thành công",
        description: "Tên nhóm đã được cập nhật mới",
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: "OK",
        onActionPress: ({ hide }) => hide(),
      });
    } catch (error: any) {
      toast.show({
        label: "Lỗi cập nhật",
        description: error.message || "Không thể đổi tên nhóm lúc này",
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: "Thử lại",
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
        <ModalHeader title="Cài đặt nhóm" variant="back" />
        <ErrorState
          title="Không thể tải cài đặt"
          message={
            error instanceof Error ? error.message : "Nhóm không tồn tại"
          }
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const members = groupData?.group_members || [];

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Cài đặt nhóm" variant="back" />

      <ScreenScrollView withKeyboardAvoidingView>
        <View className="gap-8">
          {/* Group Info */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
              THÔNG TIN NHÓM
            </AppText>
            <Card className="rounded-2xl border border-divider/10 overflow-hidden bg-surface">
              <View className="p-4">
                {isEditingName && canEdit ? (
                  <View className="gap-3">
                    <TextField className="bg-surface-secondary border border-divider/10 rounded-xl">
                      <TextField.Input
                        value={editedName}
                        onChangeText={setEditedName}
                        placeholder="Tên nhóm"
                        className="h-12"
                        autoFocus
                      />
                    </TextField>
                    <View className="flex-row gap-3">
                      <Button
                        variant="ghost"
                        className="flex-1"
                        onPress={() => {
                          setIsEditingName(false);
                          setEditedName("");
                        }}
                      >
                        <Button.Label className="font-semibold">
                          Hủy
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
                          <Button.Label className="font-bold">Lưu</Button.Label>
                        )}
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <AppText className="text-muted text-xs mb-1">
                        Tên nhóm
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
              <Divider className="bg-divider/10" />
              <View className="p-4">
                <AppText className="text-muted text-xs mb-1">Mã mời</AppText>
                <View className="flex-row items-center justify-between">
                  <AppText className="text-base font-semibold font-mono">
                    {groupData.invite_code || "N/A"}
                  </AppText>
                  <Button
                    onPress={async () => {
                      if (!groupData.invite_code) return;
                      await Clipboard.setStringAsync(groupData.invite_code);
                      toast.show({
                        label: "Đã sao chép",
                        description: "Mã mời đã được lưu vào bộ nhớ tạm",
                        variant: "success",
                        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
                        actionLabel: "Đóng",
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
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
              CHIA SẺ NHÓM
            </AppText>
            <Card className="rounded-2xl border border-divider/10 overflow-hidden bg-surface">
              <PressableFeedback onPress={() => setIsShareSheetOpen(true)}>
                <View className="p-4 flex-row items-center gap-4">
                  <View className="bg-white p-2 rounded-xl border border-divider/10">
                    <QRCode
                      value={`expense://join-group/${groupData.invite_code}`}
                      size={60}
                    />
                  </View>
                  <View className="flex-1">
                    <AppText className="font-bold text-base mb-0.5">Mã QR nhóm</AppText>
                    <AppText className="text-muted text-xs">Chia sẻ hoặc quét để tham gia nhóm</AppText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="gray" />
                </View>
              </PressableFeedback>
            </Card>
          </View>

          {/* Members */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest ml-1">
                THÀNH VIÊN ({members.length})
              </AppText>
              {canEdit && (
                <PressableFeedback
                  onPress={() => {
                    // TODO: Navigate to add member screen
                    toast.show({
                      label: "Thêm thành viên sẽ được triển khai sau",
                      variant: "warning",
                      icon: <IconSymbol name="exclamationmark.triangle.fill" size={20} color={warning} />,
                    });
                  }}
                >
                  <AppText className="text-accent font-semibold text-sm">
                    Thêm thành viên
                  </AppText>
                </PressableFeedback>
              )}
            </View>
            <Card className="rounded-2xl border border-divider/10 overflow-hidden bg-surface">
              {members.length === 0 ? (
                <View className="p-6">
                  <EmptyState
                    icon="person.3.fill"
                    title="Chưa có thành viên"
                    description="Thêm thành viên vào nhóm"
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
                                ? "Bạn"
                                : memberUser.name || "Thành viên"}
                            </AppText>
                            <AppText className="text-muted text-xs">
                              {memberUser.email || ""}
                            </AppText>
                          </View>
                          {member.role === "owner" && (
                            <View className="bg-accent/10 px-2 py-1 rounded-full">
                              <AppText className="text-accent text-xs font-bold">
                                Owner
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
                                label: "Xác nhận xóa thành viên chưa được cấu hình",
                                variant: "warning",
                                icon: <IconSymbol name="exclamationmark.triangle.fill" size={20} color={warning} />,
                              });
                            }}
                            variant="ghost"
                            isIconOnly
                            className="size-9"
                          >
                            <IconSymbol name="trash" size={18} color={danger} />
                          </Button>
                        )}
                      </View>
                      {idx < members.length - 1 && (
                        <Divider className="bg-divider/10" />
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
              <IconSymbol name="arrow.right.square" size={20} color={useThemeColor("surface")} />
              <Button.Label>Rời nhóm</Button.Label>
            </Button>
          </View>
        </View>
      </ScreenScrollView>

      <ConfirmDialog
        isOpen={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        title="Rời nhóm"
        description={`Bạn có chắc chắn muốn rời nhóm "${group.name}"? Bạn sẽ không thể xem hoặc chỉnh sửa các khoản chi trong nhóm này.`}
        confirmLabel="Rời nhóm"
        cancelLabel="Hủy"
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
