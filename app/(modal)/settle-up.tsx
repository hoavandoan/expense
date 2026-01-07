import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ModalHeader } from '@/components/ui/modal-header';
import { useCreateSettlement, useGroup } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { assignDebtsOptimized } from '@/lib/utils/debt-calculator';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Button, Card, cn, PressableFeedback, Spinner, useThemeColor } from 'heroui-native';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

interface DebtItem {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: 'you_owe' | 'owe_you';
  avatarUrl?: string;
}

export default function SettleUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const accent = useThemeColor('accent');
  const [selectedMethod, setSelectedMethod] = useState<'vietqr' | 'bank' | 'cash'>('vietqr');
  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);

  const { user } = useAuthStore();
  const { data: group, isLoading } = useGroup(params.groupId || null);
  const createSettlement = useCreateSettlement();

  // Calculate debts from group data
  const debts = useMemo((): DebtItem[] => {
    if (!group || !user) return [];
    
    // Cast to any to handle Supabase response structure
    const groupData = group as any;
    
    const members: { userId: string; user: any }[] = groupData.group_members?.map((m: any) => ({
      userId: m.user_id,
      user: m.user,
    })) || [];

    const expenses: { id: string; paidBy: string; amount: number; title: string; participants: string[] }[] = 
      groupData.expenses?.map((e: any) => ({
        id: e.id,
        paidBy: e.paid_by,
        amount: e.amount,
        title: e.title,
        participants: e.expense_splits?.map((s: any) => s.user_id) || [],
      })) || [];

    if (members.length === 0 || expenses.length === 0) return [];

    // Calculate balances manually to avoid type issues
    const balances: Record<string, number> = {};
    members.forEach(member => {
      balances[member.userId] = 0;
    });

    expenses.forEach(expense => {
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
      const perPerson = expense.amount / expense.participants.length;
      expense.participants.forEach(participantId => {
        balances[participantId] = (balances[participantId] || 0) - perPerson;
      });
    });

    const optimizedDebts = assignDebtsOptimized(balances);

    // Filter to only debts involving current user
    const userDebts: DebtItem[] = [];
    
    optimizedDebts.forEach((debt, index) => {
      if (debt.from === user.id) {
        const toMember = members.find((m: { userId: string }) => m.userId === debt.to);
        userDebts.push({
          id: `debt-${index}`,
          userId: debt.to,
          name: toMember?.user?.name || 'Thành viên',
          amount: debt.amount,
          type: 'you_owe',
          avatarUrl: toMember?.user?.avatar_url,
        });
      } else if (debt.to === user.id) {
        const fromMember = members.find((m: { userId: string }) => m.userId === debt.from);
        userDebts.push({
          id: `debt-${index}`,
          userId: debt.from,
          name: fromMember?.user?.name || 'Thành viên',
          amount: debt.amount,
          type: 'owe_you',
          avatarUrl: fromMember?.user?.avatar_url,
        });
      }
    });

    return userDebts;
  }, [group, user]);

  const totalOwe = debts.filter(d => d.type === 'you_owe').reduce((acc, d) => acc + d.amount, 0);
  const totalGain = debts.filter(d => d.type === 'owe_you').reduce((acc, d) => acc + d.amount, 0);

  const handleConfirmPayment = async () => {
    if (!selectedDebt || !params.groupId) {
      Alert.alert('Lỗi', 'Vui lòng chọn khoản thanh toán');
      return;
    }

    try {
      await createSettlement.mutateAsync({
        groupId: params.groupId,
        toUserId: selectedDebt.userId,
        amount: selectedDebt.amount,
        note: `Thanh toán qua ${selectedMethod}`,
      });

      Alert.alert(
        'Đã gửi yêu cầu',
        `Yêu cầu thanh toán ${selectedDebt.amount.toLocaleString()}đ cho ${selectedDebt.name} đang chờ xác nhận.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" color={accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ModalHeader 
        title="Tất toán" 
        variant="back" 
      />

      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-10 items-center">
          <View className="w-20 h-20 rounded-full bg-accent/10 items-center justify-center mb-4">
            <IconSymbol name="dongsign" size={40} color={accent} />
          </View>
          <AppText className="text-3xl font-bold mb-1">
            {totalOwe > totalGain ? (totalOwe - totalGain).toLocaleString() : (totalGain - totalOwe).toLocaleString()} đ
          </AppText>
          <AppText className="text-muted font-medium uppercase tracking-widest text-xs">
            {totalOwe > totalGain ? 'BẠN CẦN TRẢ TỔNG CỘNG' : 'BẠN SẼ NHẬN LẠI TỔNG CỘNG'}
          </AppText>
        </View>

        <View className="mb-8">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">CHI TIẾT CÁC KHOẢN</AppText>
          {debts.length === 0 ? (
            <View className="p-6 bg-surface rounded-2xl border border-divider/10 items-center">
              <IconSymbol name="checkmark.circle.fill" size={40} color={accent} />
              <AppText className="text-foreground font-semibold mt-3">Không có khoản nợ</AppText>
              <AppText className="text-muted text-sm text-center mt-1">
                Tất cả đã được thanh toán
              </AppText>
            </View>
          ) : (
            <Card variant="default" className="rounded-2xl border border-divider/10 overflow-hidden">
              {debts.map((debt, idx) => (
                <PressableFeedback 
                  key={debt.id}
                  onPress={() => setSelectedDebt(selectedDebt?.id === debt.id ? null : debt)}
                >
                  <View className={cn(
                    "p-4 flex-row items-center",
                    selectedDebt?.id === debt.id && "bg-accent/5"
                  )}>
                    <Avatar size="md" alt={debt.name} className="mr-4">
                      {debt.avatarUrl ? (
                        <Avatar.Image source={{ uri: debt.avatarUrl }} asChild>
                          <Image source={{ uri: debt.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                        </Avatar.Image>
                      ) : (
                        <Avatar.Fallback className="bg-accent/10">
                          <AppText className="font-bold text-accent">{debt.name.charAt(0)}</AppText>
                        </Avatar.Fallback>
                      )}
                    </Avatar>
                    <View className="flex-1">
                      <AppText className="font-bold text-base">{debt.name}</AppText>
                      <AppText className="text-muted text-xs">
                        {debt.type === 'you_owe' ? 'Bạn nợ' : 'Nợ bạn'}
                      </AppText>
                    </View>
                    <AppText className={cn("text-lg font-bold", debt.type === 'you_owe' ? 'text-danger' : 'text-accent')}>
                      {debt.amount.toLocaleString()} đ
                    </AppText>
                    {selectedDebt?.id === debt.id && (
                      <IconSymbol name="checkmark.circle.fill" size={24} color={accent} className="ml-2" />
                    )}
                  </View>
                  {idx < debts.length - 1 && <View className="h-px bg-divider/10 mx-4" />}
                </PressableFeedback>
              ))}
            </Card>
          )}
        </View>

        {debts.length > 0 && selectedDebt && (
          <>
            <View className="mb-8">
              <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">PHƯƠNG THỨC THANH TOÁN</AppText>
              <View className="gap-3">
                {[
                  { id: 'vietqr', label: 'VietQR', icon: 'qrcode', desc: 'Chuyển khoản nhanh qua QR' },
                  { id: 'bank', label: 'Chuyển khoản', icon: 'creditcard', desc: 'Nhập số tài khoản thủ công' },
                  { id: 'cash', label: 'Tiền mặt', icon: 'dongsign', desc: 'Xác nhận đã trả bằng tiền mặt' },
                ].map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <PressableFeedback
                      key={method.id}
                      onPress={() => setSelectedMethod(method.id as any)}
                    >
                      <Card
                        variant="default"
                        className={cn(
                          "p-4 rounded-2xl border flex-row items-center",
                          isSelected ? "border-accent bg-accent/5" : "border-divider/5"
                        )}
                      >
                        <View className={cn(
                          "w-12 h-12 rounded-xl items-center justify-center mr-4",
                          isSelected ? "bg-accent" : "bg-surface-secondary"
                        )}>
                          <IconSymbol name={method.icon as any} size={24} color={isSelected ? "white" : "gray"} />
                        </View>
                        <View className="flex-1">
                          <AppText className="font-bold text-base">{method.label}</AppText>
                          <AppText className="text-muted text-xs">{method.desc}</AppText>
                        </View>
                        <View className={cn(
                          "w-6 h-6 rounded-full border-2 items-center justify-center",
                          isSelected ? "border-accent bg-accent" : "border-divider"
                        )}>
                          {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                        </View>
                      </Card>
                    </PressableFeedback>
                  );
                })}
              </View>
            </View>

            <Button
              size="lg"
              className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20 mb-10"
              onPress={handleConfirmPayment}
              isDisabled={createSettlement.isPending}
            >
              <Button.Label className="text-lg font-bold text-white">
                {createSettlement.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </Button.Label>
            </Button>
          </>
        )}
      </ScreenScrollView>
    </View>
  );
}
