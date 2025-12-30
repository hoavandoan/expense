import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Checkbox, cn, Divider, PressableFeedback, Select, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

const MOCK_MEMBERS = [
  { id: '1', name: 'Bạn', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Hương', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Minh', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Tuấn', avatarUrl: 'https://i.pravatar.cc/150?u=4', isPlaceholder: true },
];

const CATEGORIES = [
  { value: 'food', label: 'Ăn uống', icon: 'fork.knife', color: '#F5A623', bg: '#FFF7ED' },
  { value: 'transport', label: 'Di chuyển', icon: 'car.fill', color: '#0070F3', bg: '#EFF6FF' },
  { value: 'shopping', label: 'Mua sắm', icon: 'cart.fill', color: '#FF0080', bg: '#FFF1F2' },
  { value: 'entertainment', label: 'Giải trí', icon: 'gamecontroller.fill', color: '#7928CA', bg: '#FAF5FF' },
  { value: 'utilities', label: 'Tiện ích', icon: 'bolt.fill', color: '#EAB308', bg: '#FEFCE8' },
  { value: 'other', label: 'Khác', icon: 'ellipsis.circle.fill', color: '#71717A', bg: '#F4F4F5' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const accent = useThemeColor('accent');
  const [amount, setAmount] = useState('150000');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['1', '2', '3']);

  const muted = useThemeColor('muted');

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const totalAmount = 150000;
  const splitAmount = selectedMembers.length > 0 ? Math.floor(totalAmount / selectedMembers.length) : 0;

  return (
    <ScreenScrollView>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
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
            <View className='w-1/2'>
              <TextField>
              <TextField.Input
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              className="bg-surface border-divider/10 h-14 rounded-2xl px-4 w-full"
              >
<TextField.InputEndContent>
            <IconSymbol name="dongsign" size={24} color={muted} className="mr-3" />
            </TextField.InputEndContent>
                </TextField.Input>
            </TextField>
            </View>
          </View>
          <AppText className="text-muted text-lg font-medium">Nhập số tiền</AppText>
        </View>

        {/* Description & Category Selection */}
        <Card variant="default" className="p-4 rounded-3xl border border-divider/5 mb-6">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: CATEGORIES.find(c => c.value === selectedCategory)?.bg }}
            >
              <IconSymbol 
                name={CATEGORIES.find(c => c.value === selectedCategory)?.icon as any || 'doc.text.fill'} 
                size={24} 
                color={CATEGORIES.find(c => c.value === selectedCategory)?.color || accent} 
              />
            </View>
            <TextField className="bg-transparent flex-1 border-0 h-10 px-0">
              <TextField.Input
                placeholder="Nhập mô tả (ví dũ: Ăn tối)"
                value={description}
                onChangeText={setDescription}
                className="text-lg text-foreground font-semibold"
              />
            </TextField>
          </View>
          
          <Divider className="mb-4 opacity-50" />
          
          <AppText className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 px-1">PHÂN LOẠI</AppText>
          <Select
            value={CATEGORIES.find(c => c.value === selectedCategory)!}
            onValueChange={(opt) => opt && setSelectedCategory(opt.value)}
          >
            <Select.Trigger className="h-12 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol 
                  name={CATEGORIES.find(c => c.value === selectedCategory)?.icon as any || 'doc.text.fill'} 
                  size={20} 
                  color={CATEGORIES.find(c => c.value === selectedCategory)?.color || accent} 
                  className="mr-3"
                />
                <Select.Value 
                  className="text-base font-medium text-foreground"
                  placeholder="Chọn phân loại"
                />
              </View>
              <IconSymbol name="chevron.right" size={16} color={muted} className="rotate-90" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay className='bg-black/10' />
              <Select.Content 
                placement="bottom"
                className="rounded-2xl bg-surface border border-divider/10"
                width={300}
                presentation="popover"
                align="start"
                alignOffset={-20}
               >
                {CATEGORIES.map(category => (
                  <Select.Item 
                    key={category.value} 
                    value={category.value} 
                    label={category.label}
                    className='p-4'
                  >
                    <View className="flex-row items-center gap-3">
                      <View 
                        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: category.bg }}
                      >
                        <IconSymbol name={category.icon as any} size={18} color={category.color} />
                      </View>
                      <Select.ItemLabel className="text-base" />
                    </View>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Portal>
          </Select>
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
              <IconSymbol name="chevron.right" size={16} color={muted} />
            </PressableFeedback>
            <Divider />
            <PressableFeedback className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-lg bg-accent/10 items-center justify-center mr-4">
                <IconSymbol name="creditcard.fill" size={20} color="#8B5CF6" />
              </View>
              <AppText className="flex-1 text-base font-medium">Người trả tiền</AppText>
              <View className="flex-row items-center mr-2">
                <Avatar size="sm" alt="Bạn" className="w-8 h-8 mr-2 border-2 border-surface">
                  <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} asChild>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} style={{ width: '100%', height: '100%' }} />
                  </Avatar.Image>
                  <Avatar.Fallback>B</Avatar.Fallback>
                </Avatar>
                <AppText className="font-semibold">Bạn</AppText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={muted} />
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
                  <PressableFeedback onPress={() => toggleMember(member.id)} className="p-4 flex-row items-center rounded-lg">
                    <View className="relative">
                      <Avatar size="md" alt={member.name} className={cn("mr-4 bg-accent-soft", member.isPlaceholder && "opacity-40")}>
                        {member.avatarUrl && (
                          <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                            <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                          </Avatar.Image>
                        )}
                        <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                      </Avatar>
                      {member.id === '1' && (
                        <View className="absolute bottom-0 right-4 w-3.5 h-3.5 bg-success rounded-full border-2 border-surface" />
                      )}
                    </View>
                    <View className="flex-1">
                      <AppText className={cn("text-base font-bold", member.isPlaceholder && "text-muted")}>{member.name}</AppText>
                      <AppText className="text-muted text-[13px]">{isSelected ? `${splitAmount.toLocaleString()} ₫` : '0 ₫'}</AppText>
                    </View>
                    <Checkbox
                      isSelected={isSelected}
                      onSelectedChange={() => toggleMember(member.id)}
                      className="size-6"
                    />
                  </PressableFeedback>
                  {index < MOCK_MEMBERS.length - 1 && <Divider className="mx-4" />}
                </View>
              );
            })}
          </Card>
        </View>

        {/* Custom Split Trigger */}
        {/* <PressableFeedback className="flex-row items-center justify-center mb-10">
          <IconSymbol name="slider.horizontal.3" size={18} color="#64748B" className="mr-2" />
          <AppText className="text-[#64748B] font-medium">Tùy chỉnh chia tiền</AppText>
        </PressableFeedback> */}

        {/* Footer Summary & Button */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <AppText className="text-muted font-medium">Đã chọn {selectedMembers.length} người</AppText>
            <AppText className="font-bold text-lg">Tổng: {totalAmount.toLocaleString()} đ</AppText>
          </View>
          <Button
            variant="primary"
            className="w-full h-16 rounded-2xl shadow-xl shadow-accent/20 bg-accent"
            onPress={() => router.back()}
          >
            <Button.Label className="text-lg font-bold">Lưu khoản chi</Button.Label>
          </Button>
        </View>
      </View>
    </ScreenScrollView>
  );
}

