import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Checkbox, cn, Divider, PressableFeedback, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

const MOCK_MEMBERS = [
  { id: '1', name: 'Bạn', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Hương', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Minh', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Tuấn', avatarUrl: 'https://i.pravatar.cc/150?u=4', isPlaceholder: true },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');
  const [amount, setAmount] = useState('150.000');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['1', '2', '3']);

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const totalAmount = 150000;
  const splitAmount = selectedMembers.length > 0 ? Math.floor(totalAmount / selectedMembers.length) : 0;

  return (
    <ScreenScrollView className="bg-background text-foreground">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider/5 bg-surface">
        <PressableFeedback onPress={() => router.back()}>
          <IconSymbol name="xmark" size={24} color="gray" />
        </PressableFeedback>
        <AppText className="text-lg font-bold">Tạo khoản chi</AppText>
        <PressableFeedback onPress={() => router.back()}>
          <AppText className="text-accent font-bold text-base">Lưu</AppText>
        </PressableFeedback>
      </View>

      <View className="px-5 pt-8">
        {/* Amount Section */}
        <View className="items-center mb-8">
          <View className="flex-row items-center justify-center mb-2">
            <IconSymbol name="dongsign" size={24} color="#94A3B8" className="mr-3" />
            <TextField className="bg-transparent border-0 w-64 h-16">
              <TextField.Input
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                className="text-[56px] font-bold text-center text-[#1E293B]"
              />
            </TextField>
          </View>
          <AppText className="text-[#94A3B8] text-sm font-medium">Nhập số tiền</AppText>
        </View>

        {/* Description Card */}
        <Card variant="default" className="p-4 rounded-2xl border border-divider/5 flex-row items-center mb-6">
          <View className="w-10 h-10 rounded-lg bg-success-soft items-center justify-center mr-3">
            <IconSymbol name="doc.text.fill" size={20} color={accent} />
          </View>
          <TextField className="bg-transparent flex-1 border-0 h-10">
            <TextField.Input
              placeholder="Nhập mô tả (ví dụ: Ăn tối)"
              value={description}
              onChangeText={setDescription}
              className="text-base text-foreground font-medium"
            />
          </TextField>
          <IconSymbol name="triangle.fill" size={12} color="#64748B" className="rotate-0 ml-2" />
        </Card>

        {/* Details Section */}
        <View className="mb-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">CHI TIẾT</AppText>
          <Card variant="default" className="rounded-2xl overflow-hidden border border-divider/5">
            <PressableFeedback className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-lg bg-accent/10 items-center justify-center mr-4">
                <IconSymbol name="calendar" size={20} color={accent} />
              </View>
              <AppText className="flex-1 text-base font-medium">Ngày</AppText>
              <AppText className="text-muted mr-2">Hôm nay, 24/10</AppText>
              <IconSymbol name="chevron.right" size={16} color="#94A3B8" />
            </PressableFeedback>
            <Divider />
            <PressableFeedback className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-lg bg-accent/10 items-center justify-center mr-4">
                <IconSymbol name="creditcard.fill" size={20} color="#8B5CF6" />
              </View>
              <AppText className="flex-1 text-base font-medium">Người trả tiền</AppText>
              <View className="flex-row items-center mr-2">
                <Avatar size="sm" alt="Bạn" className="mr-2 border-2 border-surface">
                  <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} />
                </Avatar>
                <AppText className="font-semibold">Bạn</AppText>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#94A3B8" />
            </PressableFeedback>
          </Card>
        </View>

        {/* Split Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest">CHIA CHO</AppText>
            <PressableFeedback>
              <AppText className="text-accent text-xs font-bold uppercase">Chọn tất cả</AppText>
            </PressableFeedback>
          </View>
          <Card variant="default" className="rounded-2xl overflow-hidden border border-divider/5">
            {MOCK_MEMBERS.map((member, index) => {
              const isSelected = selectedMembers.includes(member.id);
              return (
                <View key={member.id}>
                  <PressableFeedback onPress={() => toggleMember(member.id)} className="p-4 flex-row items-center">
                    <View className="relative">
                      <Avatar size="md" alt={member.name} className={cn("mr-4", member.isPlaceholder && "opacity-40")}>
                        {member.avatarUrl && <Avatar.Image source={{ uri: member.avatarUrl }} />}
                        <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                      </Avatar>
                      {member.id === '1' && (
                        <View className="absolute bottom-0 right-4 w-3 h-3 bg-success rounded-full border-2 border-surface" />
                      )}
                    </View>
                    <View className="flex-1">
                      <AppText className={cn("text-base font-bold", member.isPlaceholder && "text-muted")}>{member.name}</AppText>
                      <AppText className="text-muted text-xs">{isSelected ? `${splitAmount.toLocaleString()} ₫` : '0 ₫'}</AppText>
                    </View>
                    <Checkbox
                      isSelected={isSelected}
                      onSelectedChange={() => toggleMember(member.id)}
                    >
                      <Checkbox.Indicator className="rounded-md" />
                    </Checkbox>
                  </PressableFeedback>
                  {index < MOCK_MEMBERS.length - 1 && <Divider />}
                </View>
              );
            })}
          </Card>
        </View>

        {/* Custom Split Trigger */}
        <PressableFeedback className="flex-row items-center justify-center mb-10">
          <IconSymbol name="slider.horizontal.3" size={18} color="#64748B" className="mr-2" />
          <AppText className="text-[#64748B] font-medium">Tùy chỉnh chia tiền</AppText>
        </PressableFeedback>

        {/* Footer Summary & Button */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <AppText className="text-muted font-medium">Đã chọn {selectedMembers.length} người</AppText>
            <AppText className="font-bold text-lg">Tổng: {totalAmount.toLocaleString()} đ</AppText>
          </View>
          <Button
            variant="primary"
            className="w-full h-16 rounded-2xl shadow-xl shadow-success/20 bg-accent"
            onPress={() => router.back()}
          >
            <Button.Label className="text-lg font-bold">Lưu khoản chi</Button.Label>
          </Button>
        </View>
      </View>
    </ScreenScrollView>
  );
}

