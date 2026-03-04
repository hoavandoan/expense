import { AppText } from '@/components/app-text';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCompleteSettlement, usePendingSettlements, useRejectSettlement } from '@/lib/hooks';
import { useTranslation } from '@/lib/hooks/use-translation';
import type { Settlement } from '@/lib/types';
import { Image } from 'expo-image';
import { Avatar, Button, Card, useThemeColor, useToast } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

interface PendingSettlementsProps {
  groupId: string;
}

export function PendingSettlements({ groupId }: PendingSettlementsProps) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const { data: pendingSettlements, isLoading } = usePendingSettlements(groupId);
  const completeSettlement = useCompleteSettlement();
  const rejectSettlement = useRejectSettlement();
  const success = useThemeColor('success');
  const danger = useThemeColor('danger');
  const warning = useThemeColor('warning');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    settlement?: Settlement;
  }>({ isOpen: false });

  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    settlement?: Settlement;
  }>({ isOpen: false });

  const handleConfirm = async () => {
    const settlement = confirmDialog.settlement;
    if (!settlement) return;

    try {
      await completeSettlement.mutateAsync({
        settlementId: settlement.id,
        groupId: groupId,
      });
      toast.show({
        label: t("pending_settlements.confirm_success_title"),
        description: t("pending_settlements.confirm_success_desc"),
        variant: 'success',
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: 'OK',
        onActionPress: ({ hide }) => hide(),
      });
    } catch (error: any) {
      toast.show({
        label: t("pending_settlements.confirm_error_title"),
        description: error.message || t("pending_settlements.confirm_error_desc"),
        variant: 'danger',
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: t("close"),
        onActionPress: ({ hide }) => hide(),
      });
    }
  };

  const handleReject = async () => {
    const settlement = rejectDialog.settlement;
    if (!settlement) return;

    try {
      await rejectSettlement.mutateAsync({
        settlementId: settlement.id,
        groupId: groupId,
      });
      toast.show({
        label: t("pending_settlements.reject_success_title"),
        description: t("pending_settlements.reject_success_desc"),
        variant: 'warning',
        icon: <IconSymbol name="exclamationmark.triangle.fill" size={20} color={warning} />,
        actionLabel: 'OK',
        onActionPress: ({ hide }) => hide(),
      });
    } catch (error: any) {
      toast.show({
        label: t("pending_settlements.reject_error_title"),
        description: error.message || t("pending_settlements.reject_error_desc"),
        variant: 'danger',
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: t("close"),
        onActionPress: ({ hide }) => hide(),
      });
    }
  };

  if (isLoading || !pendingSettlements || pendingSettlements.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3 ml-1">
        <View className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest">
          {t("pending_settlements.waiting_confirm", { count: pendingSettlements.length })}
        </AppText>
      </View>

      <Card variant="default" className="rounded-2xl overflow-hidden border border-warning/30 bg-warning/5">
        {pendingSettlements.map((settlement, idx) => {
          const fromUser = settlement.fromUser;

          console.log('fromUser', fromUser);
          
          return (
            <View key={settlement.id}>
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <Avatar size="md" alt={fromUser?.name || 'User'} className="mr-3">
                    {fromUser?.avatarUrl ? (
                      <Avatar.Image source={{ uri: fromUser.avatarUrl }} asChild>
                        <Image source={{ uri: fromUser.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                      </Avatar.Image>
                    ) : (
                      <Avatar.Fallback className="bg-warning/20">
                        <AppText className="font-bold text-warning">{fromUser?.name?.charAt(0) || '?'}</AppText>
                      </Avatar.Fallback>
                    )}
                  </Avatar>
                  <View className="flex-1">
                    <AppText className="font-bold">{fromUser?.name || t("group_detail.member")}</AppText>
                    <AppText className="text-muted text-xs">{t("pending_settlements.sent_to_you")}</AppText>
                  </View>
                  <AppText className="text-xl font-bold text-accent">
                    {settlement.amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}{locale === "vi" ? "đ" : ""}
                  </AppText>
                </View>

                {(settlement as any).note && (
                  <View className="bg-surface rounded-xl p-3 mb-3">
                    <AppText className="text-muted text-sm">{(settlement as any).note}</AppText>
                  </View>
                )}

                <View className="flex-row gap-3">
                  <Button
                    variant="danger-soft"
                    className="flex-1 h-12 rounded-xl"
                    onPress={() => setRejectDialog({ isOpen: true, settlement })}
                    isDisabled={rejectSettlement.isPending}
                  >
                    <Button.Label className="font-bold">{t("pending_settlements.reject_btn")}</Button.Label>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 h-12 rounded-xl bg-accent"
                    onPress={() => setConfirmDialog({ isOpen: true, settlement })}
                    isDisabled={completeSettlement.isPending}
                  >
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name="checkmark" size={16} color="white" />
                      <Button.Label className="font-bold text-white">{t("pending_settlements.confirm_btn")}</Button.Label>
                    </View>
                  </Button>
                </View>
              </View>
              {idx < pendingSettlements.length - 1 && <View className="h-px bg-divider/10 mx-4" />}
            </View>
          );
        })}
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={t("pending_settlements.confirm_dialog_title")}
        description={t("pending_settlements.confirm_dialog_desc", {
          amount: confirmDialog.settlement?.amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US") + (locale === "vi" ? "đ" : ""),
          name: (confirmDialog.settlement as any)?.from_user?.name || t("group_detail.member"),
        })}
        onConfirm={handleConfirm}
        isLoading={completeSettlement.isPending}
      />

      <ConfirmDialog
        isOpen={rejectDialog.isOpen}
        onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, isOpen: open }))}
        title={t("pending_settlements.reject_dialog_title")}
        description={t("pending_settlements.reject_dialog_desc")}
        confirmLabel={t("pending_settlements.reject_btn")}
        variant="danger"
        onConfirm={handleReject}
        isLoading={rejectSettlement.isPending}
      />
    </View>
  );
}
