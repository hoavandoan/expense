import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StickyHeader } from "@/components/ui/sticky-header";
import { CATEGORY_CONFIG } from "@/constants";
import { useDeleteExpense, useExpense, useTranslation } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  cn,
  Separator,
  Spinner,
  useThemeColor,
  useToast,
} from "heroui-native";
import React, { useState } from "react";
import { View } from "react-native";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 24) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function ExpenseDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor("accent");
  const danger = useThemeColor("danger");
  const success = useThemeColor("success");
  const { user } = useAuthStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: expense, isLoading, error, refetch } = useExpense(id as string);
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!expense) return;

    try {
      await deleteExpense.mutateAsync({
        expenseId: expense.id,
        groupId: expense.groupId,
      });
      toast.show({
        label: t('expense_detail.delete_success_title', { defaultValue: "Đã xóa" }),
        description: t('expense_detail.delete_success_desc', { defaultValue: "Khoản chi tiêu đã được gỡ bỏ khỏi nhóm" }),
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: "OK",
        onActionPress: ({ hide }) => hide(),
      });
      router.back();
    } catch (error: any) {
      toast.show({
        label: t('expense_detail.delete_error_title', { defaultValue: "Lỗi xóa" }),
        description: error.message || t('expense_detail.delete_error_desc', { defaultValue: "Không thể xóa khoản chi lúc này" }),
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: t('expense_edit.retry', { defaultValue: "Thử lại" }),
        onActionPress: ({ hide }) => hide(),
      });
    }
  };

  const handleEdit = () => {
    if (!expense) return;
    router.push(`/expense/${expense.id}/edit` as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" color={accent} />
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View className="flex-1 bg-background">
        <StickyHeader title={t('expense_detail.title', { defaultValue: "Chi tiết chi tiêu" })} />
        <ErrorState
          title={t('expense_detail.error_title', { defaultValue: "Không thể tải chi tiết" })}
          message={
            error instanceof Error ? error.message : t('expense_detail.error_not_found', { defaultValue: "Khoản chi không tồn tại" })
          }
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const expenseData = expense as any;
  const categoryConfig =
    CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;
  const paidByUser = expenseData.paid_by_user;
  const splits = expenseData.expense_splits || [];
  const groupCurrency = expenseData.group?.currency || "VND";
  const canEdit = expenseData.created_by === user?.id; // Only creator can edit

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title={t('expense_detail.title', { defaultValue: "Chi tiết chi tiêu" })} />

      <ScreenScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="py-6 pb-8 items-center bg-background border-b border-border/10">
          <View
            className={`w-16 h-16 rounded-2xl items-center justify-center mb-4 ${categoryConfig.bg}`}
          >
            <IconSymbol
              name={categoryConfig.icon as any}
              size={32}
              color={categoryConfig.color}
            />
          </View>
          <AppText className="text-muted text-xs uppercase font-bold tracking-widest mb-1">
            {categoryConfig.label}
          </AppText>
          <AppText
            className="text-3xl font-bold mb-2 text-center"
            numberOfLines={2}
          >
            {expense.title}
          </AppText>
          <AppText className="text-2xl font-bold text-danger">
            {formatCurrency(expense.amount, groupCurrency)}
          </AppText>

          <View className="mt-6 flex-row items-center gap-2 bg-surface-secondary px-4 py-2 rounded-full">
            {paidByUser?.avatar_url ? (
              <Avatar size="sm" alt={paidByUser.name || ""}>
                <Avatar.Image source={{ uri: paidByUser.avatar_url }} />
              </Avatar>
            ) : (
              <Avatar
                size="sm"
                alt={paidByUser?.name || ""}
                className="bg-accent/10"
              >
                <Avatar.Fallback>
                  <AppText className="text-accent font-bold text-xs">
                    {paidByUser?.name?.charAt(0) || "U"}
                  </AppText>
                </Avatar.Fallback>
              </Avatar>
            )}
            <AppText className="text-xs font-medium">
              {t('expense_detail.paid_by', { defaultValue: 'Trả bởi' })}{" "}
              <AppText className="font-bold">
                {paidByUser?.name || t('expense_detail.default_user', { defaultValue: 'Người dùng' })}
              </AppText>{" "}
              • {formatDate(expense.createdAt)}
            </AppText>
          </View>
        </View>

        <View className="py-6">
          {expense.description && (
            <View className="mb-10">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                {t('expense_detail.description', { defaultValue: 'MÔ TẢ' })}
              </AppText>
              <AppText className="text-base text-foreground/80 leading-relaxed px-1">
                {expense.description}
              </AppText>
            </View>
          )}

          {splits.length > 0 && (
            <View className="mb-10">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                {t('expense_detail.split_for', { count: splits.length, defaultValue: `CHIA CHO ${splits.length} NGƯỜI` })}
              </AppText>
              <Card className="rounded-2xl border border-border/10 overflow-hidden bg-surface">
                {splits.map((split: any, idx: number) => {
                  const splitUser = split.user || {};
                  const isPaid = split.is_paid;
                  const isMe = split.user_id === user?.id;

                  return (
                    <View key={split.id || idx}>
                      <View className="p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          {splitUser.avatar_url ? (
                            <Avatar size="sm" alt={splitUser.name || ""}>
                              <Avatar.Image
                                source={{ uri: splitUser.avatar_url }}
                              />
                            </Avatar>
                          ) : (
                            <Avatar
                              size="sm"
                              alt={splitUser.name || ""}
                              className="bg-surface-tertiary"
                            >
                              <Avatar.Fallback>
                                <AppText className="text-[10px] font-bold">
                                  {splitUser.name?.charAt(0) || "U"}
                                </AppText>
                              </Avatar.Fallback>
                            </Avatar>
                          )}
                          <AppText className="font-bold">
                            {isMe ? t('expense_detail.you', { defaultValue: "Bạn" }) : splitUser.name || t('expense_detail.member', { defaultValue: "Thành viên" })}
                          </AppText>
                        </View>
                        <View className="items-end">
                          <AppText className="font-bold">
                            {formatCurrency(split.amount, groupCurrency)}
                          </AppText>
                          <AppText
                            className={cn("text-[10px]", isPaid ? "text-success" : "text-muted")}
                          >
                            {isPaid ? t('expense_detail.paid', { defaultValue: "Đã trả" }) : t('expense_detail.unpaid', { defaultValue: "Chưa trả" })}
                          </AppText>
                        </View>
                      </View>
                      {idx < splits.length - 1 && (
                        <Separator className="mx-4 bg-border/10" />
                      )}
                    </View>
                  );
                })}
              </Card>
            </View>
          )}

          {expense.receiptUrl && (
            <View className="mb-10">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">
                {t('expense_detail.receipt', { defaultValue: 'ẢNH HÓA ĐƠN' })}
              </AppText>
              <Card className="h-60 rounded-2xl overflow-hidden bg-surface border border-border/10 shadow-sm">
                <Image
                  source={{ uri: expense.receiptUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </Card>
            </View>
          )}

          {canEdit && (
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                onPress={handleEdit}
                className="flex-1"
              >
                {t('expense_detail.edit', { defaultValue: 'Chỉnh sửa' })}
              </Button>
              <Button
                variant="danger"
                onPress={() => setShowDeleteDialog(true)}
                className="flex-1"
              >
                {t('expense_detail.delete', { defaultValue: 'Xóa' })}
              </Button>
            </View>
          )}
        </View>
      </ScreenScrollView>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('expense_detail.delete_dialog_title', { defaultValue: 'Xóa khoản chi' })}
        description={t('expense_detail.delete_dialog_desc', { title: expense.title, defaultValue: `Bạn có chắc chắn muốn xóa khoản chi "${expense.title}"? Hành động này không thể hoàn tác.` })}
        confirmLabel={t('expense_detail.delete', { defaultValue: 'Xóa' })}
        cancelLabel={t('expense_detail.cancel', { defaultValue: 'Hủy' })}
        variant="danger"
        isLoading={deleteExpense.isPending}
        onConfirm={handleDelete}
      />
    </View>
  );
}
