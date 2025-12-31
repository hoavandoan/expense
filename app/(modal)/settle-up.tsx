import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, cn, PressableFeedback, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

const MOCK_DEBTS = [
  { id: '1', name: 'Hương', amount: 50000, type: 'owe_you' as const, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '2', name: 'Minh', amount: 200000, type: 'you_owe' as const, avatarUrl: 'https://i.pravatar.cc/150?u=3' },
];

export default function SettleUpScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');
  const [selectedMethod, setSelectedMethod] = useState<'vietqr' | 'bank' | 'cash'>('vietqr');

  const totalOwe = MOCK_DEBTS.filter(d => d.type === 'you_owe').reduce((acc, d) => acc + d.amount, 0);
  const totalGain = MOCK_DEBTS.filter(d => d.type === 'owe_you').reduce((acc, d) => acc + d.amount, 0);

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Tất toán" />

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
          <Card variant="default" className="rounded-3xl border border-divider/5 overflow-hidden">
            {MOCK_DEBTS.map((debt, idx) => (
              <View key={debt.id}>
                <View className="p-4 flex-row items-center">
                  <Avatar size="md" alt={debt.name} className="mr-4">
                    <Avatar.Image source={{ uri: debt.avatarUrl }} />
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
                </View>
                {idx < MOCK_DEBTS.length - 1 && <View className="h-px bg-divider/10 mx-4" />}
              </View>
            ))}
          </Card>
        </View>

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
          className="h-16 rounded-2xl bg-accent shadow-xl mb-10"
          onPress={() => router.push('/(modal)/payment-confirm')}
        >
          <Button.Label className="text-lg font-bold">Xác nhận thanh toán</Button.Label>
        </Button>
      </ScreenScrollView>
    </View>
  );
}
