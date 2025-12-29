import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Checkbox, cn, FormField, PressableFeedback, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

const MOCK_MEMBERS = [
  { id: '1', name: 'Bạn' },
  { id: '2', name: 'An' },
  { id: '3', name: 'Bình' },
  { id: '4', name: 'Chi' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(MOCK_MEMBERS.map(m => m.id));

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <ScreenScrollView className="bg-background">
      <View className="px-6 py-6">
        <View className="flex-row items-center justify-between mb-10 pt-4">
          <AppText className="text-3xl font-bold">Thêm chi tiêu</AppText>
          <PressableFeedback onPress={() => router.back()} className="bg-surface-secondary p-2 rounded-full">
            <IconSymbol name="xmark" size={20} color="gray" />
          </PressableFeedback>
        </View>

        {/* Amount Input Section */}
        <View className="items-center mb-10 bg-accent/5 py-8 rounded-[40px] border border-accent/10">
          <AppText className="text-muted font-bold uppercase tracking-widest text-xs mb-4">Số tiền chi ra</AppText>
          <View className="flex-row items-center">
            <TextField className="bg-transparent border-0 w-48">
              <TextField.Input
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                className="text-5xl font-bold text-center text-foreground"
              />
            </TextField>
            <AppText className="text-3xl font-bold text-accent ml-2">đ</AppText>
          </View>
        </View>

        <FormField className="mb-8">
          <FormField.Label className="text-base font-bold mb-3">Nội dung</FormField.Label>
          <TextField className="bg-surface-secondary rounded-2xl h-14 px-4">
            <TextField.Input
              placeholder="Ăn trưa, cafe, mua sắm..."
              value={description}
              onChangeText={setDescription}
            />
          </TextField>
        </FormField>

        {/* Split Section */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4">
            <AppText className="text-lg font-bold">Chia tiền với</AppText>
            <AppText className="text-accent text-sm font-bold">CHỌN TẤT CẢ</AppText>
          </View>
          <Card variant="default" className="p-3 gap-3 rounded-[32px] border border-divider/5 shadow-sm">
            {MOCK_MEMBERS.map((member) => (
              <PressableFeedback key={member.id} onPress={() => toggleMember(member.id)}>
                <View
                  className={cn(
                    'p-4 flex-row items-center justify-between rounded-2xl',
                    selectedMembers.includes(member.id) ? 'bg-accent/10' : 'bg-surface-secondary/50'
                  )}
                >
                  <View className="flex-row items-center">
                    <Avatar size="sm" alt={member.name} className="mr-4 border border-surface shadow-sm">
                      <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                    </Avatar>
                    <AppText className="font-bold text-base">{member.name}</AppText>
                  </View>
                  <Checkbox
                    isSelected={selectedMembers.includes(member.id)}
                    onSelectedChange={() => toggleMember(member.id)}
                  >
                    <Checkbox.Indicator />
                  </Checkbox>
                </View>
              </PressableFeedback>
            ))}
          </Card>
        </View>

        <View className="pb-8">
          <Button
            variant="primary"
            className="w-full h-16 rounded-[24px] shadow-lg"
            isDisabled={!amount || !description || selectedMembers.length === 0}
            onPress={() => router.back()}
          >
            <Button.Label className="text-lg font-bold">Lưu giao dịch</Button.Label>
          </Button>
        </View>
      </View>
    </ScreenScrollView>
  );
}

