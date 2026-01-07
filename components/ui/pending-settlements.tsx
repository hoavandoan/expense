import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCompleteSettlement, usePendingSettlements, useRejectSettlement } from '@/lib/hooks';
import type { Settlement } from '@/lib/types';
import { Image } from 'expo-image';
import { Avatar, Button, Card, useThemeColor } from 'heroui-native';
import React from 'react';
import { Alert, View } from 'react-native';

interface PendingSettlementsProps {
  groupId: string;
}

export function PendingSettlements({ groupId }: PendingSettlementsProps) {
  const accent = useThemeColor('accent');
  const { data: pendingSettlements, isLoading } = usePendingSettlements(groupId);
  const completeSettlement = useCompleteSettlement();
  const rejectSettlement = useRejectSettlement();

  const handleConfirm = (settlement: Settlement) => {
    Alert.alert(
      'Xác nhận đã nhận tiền',
      `Bạn xác nhận đã nhận ${settlement.amount.toLocaleString()}đ từ ${(settlement as any).from_user?.name || 'thành viên'}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await completeSettlement.mutateAsync({
                settlementId: settlement.id,
                groupId: groupId,
              });
              Alert.alert('Thành công', 'Đã xác nhận thanh toán');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message);
            }
          },
        },
      ]
    );
  };

  const handleReject = (settlement: Settlement) => {
    Alert.alert(
      'Từ chối thanh toán',
      'Bạn chắc chắn muốn từ chối yêu cầu thanh toán này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectSettlement.mutateAsync({
                settlementId: settlement.id,
                groupId: groupId,
              });
              Alert.alert('Đã từ chối', 'Yêu cầu thanh toán đã bị từ chối');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !pendingSettlements || pendingSettlements.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3 ml-1">
        <View className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest">
          CHỜ XÁC NHẬN ({pendingSettlements.length})
        </AppText>
      </View>

      <Card variant="default" className="rounded-2xl overflow-hidden border border-warning/30 bg-warning/5">
        {pendingSettlements.map((settlement, idx) => {
          const fromUser = (settlement as any).from_user;
          
          return (
            <View key={settlement.id}>
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <Avatar size="md" alt={fromUser?.name || 'User'} className="mr-3">
                    {fromUser?.avatar_url ? (
                      <Avatar.Image source={{ uri: fromUser.avatar_url }} asChild>
                        <Image source={{ uri: fromUser.avatar_url }} style={{ width: '100%', height: '100%' }} />
                      </Avatar.Image>
                    ) : (
                      <Avatar.Fallback className="bg-warning/20">
                        <AppText className="font-bold text-warning">{fromUser?.name?.charAt(0) || '?'}</AppText>
                      </Avatar.Fallback>
                    )}
                  </Avatar>
                  <View className="flex-1">
                    <AppText className="font-bold">{fromUser?.name || 'Thành viên'}</AppText>
                    <AppText className="text-muted text-xs">gửi cho bạn</AppText>
                  </View>
                  <AppText className="text-xl font-bold text-accent">
                    {settlement.amount.toLocaleString()}đ
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
                    onPress={() => handleReject(settlement)}
                    isDisabled={rejectSettlement.isPending}
                  >
                    <Button.Label className="font-bold">Từ chối</Button.Label>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 h-12 rounded-xl bg-accent"
                    onPress={() => handleConfirm(settlement)}
                    isDisabled={completeSettlement.isPending}
                  >
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name="checkmark" size={16} color="white" />
                      <Button.Label className="font-bold text-white">Xác nhận</Button.Label>
                    </View>
                  </Button>
                </View>
              </View>
              {idx < pendingSettlements.length - 1 && <View className="h-px bg-divider/10 mx-4" />}
            </View>
          );
        })}
      </Card>
    </View>
  );
}
