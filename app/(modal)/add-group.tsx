import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Divider, PressableFeedback, Select, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';

const MOCK_MEMBERS = [
  { id: '1', name: 'Minh Anh', role: 'Trưởng nhóm', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Bình', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Chi', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Dũng', avatarUrl: 'https://i.pravatar.cc/150?u=4' },
];

export default function AddGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('trip');

  const accent = useThemeColor('accent');
  const muted = useThemeColor('muted');

  const GROUP_TYPES = [
    { value: 'trip', label: 'Chuyến đi', icon: 'airplane' },
    { value: 'home', label: 'Nhà cửa', icon: 'house.fill' },
    { value: 'couple', label: 'Cặp đôi', icon: 'heart.fill' },
    { value: 'other', label: 'Khác', icon: 'ellipsis.circle.fill' },
  ];

  return (
    <ScreenScrollView className="bg-background">
      {/* Header (Image 3) */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <PressableFeedback onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface items-center justify-center shadow-sm">
          <IconSymbol name="chevron.left" size={20} color="black" />
        </PressableFeedback>
        <AppText className="text-lg font-bold">Tạo nhóm mới</AppText>
        <View className="w-10" />
      </View>

      <View className="px-6 pt-6 pb-10">
        {/* Image Upload (Image 3) */}
        <View className="items-center mb-10">
          <PressableFeedback className='rounded-full'>
            <View className="w-32 h-32 rounded-full border-2 border-dashed border-accent/40 items-center justify-center bg-accent/5">
              <View className="bg-accent/10 p-4 rounded-full">
                <IconSymbol name="camera.fill" size={32} color={accent} />
              </View>
            </View>
          </PressableFeedback>
          <AppText className="text-accent text-sm font-bold mt-4">Tải lên ảnh nhóm</AppText>

        </View>

        {/* Group Info Input */}
        <View className="mb-10 gap-6">
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">THÔNG TIN NHÓM</AppText>
            <TextField>
              <TextField.Input
                placeholder="Nhập tên nhóm (e.g. Ăn trưa Cty)"
                value={groupName}
                onChangeText={setGroupName}
                className="bg-surface border-divider/10 h-14 rounded-2xl px-4"
              />
            </TextField>
          </View>

          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">MÔ TẢ</AppText>
            <TextField>
              <TextField.Input
                placeholder="Mô tả ngắn gọn về nhóm..."
                value={description}
                onChangeText={setDescription}
                className="bg-surface border-divider/10 h-14 rounded-2xl px-4"
              />
            </TextField>
          </View>

          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">LOẠI NHÓM</AppText>
            <Select
              value={GROUP_TYPES.find(t => t.value === groupType)!}
              onValueChange={(opt) => opt && setGroupType(opt.value)}
            >
              <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <IconSymbol
                    name={GROUP_TYPES.find(t => t.value === groupType)?.icon as any}
                    size={20}
                    color={accent}
                  />
                  <Select.Value className="text-base font-medium" placeholder="Chọn loại nhóm" />
                </View>
                <IconSymbol name="chevron.right" size={16} color={muted} className="rotate-90" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay className='bg-black/10' />
                <Select.Content
                  placement="bottom"
                  className="rounded-2xl bg-surface border border-divider/10"
                  width={300}
                >
                  {GROUP_TYPES.map(type => (
                    <Select.Item key={type.value} value={type.value} label={type.label} className="p-4">
                      <View className="flex-row items-center gap-3">
                        <IconSymbol name={type.icon as any} size={18} color={accent} />
                        <Select.ItemLabel className="text-base" />
                      </View>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>
          </View>
        </View>

        {/* Member List (Image 3) */}
        <View className="mb-12">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest">THÀNH VIÊN (4)</AppText>
            <PressableFeedback>
              <AppText className="text-accent font-bold text-sm">+ THÊM</AppText>
            </PressableFeedback>
          </View>

          <Card variant="default" className="rounded-[32px] overflow-hidden border border-divider/5 shadow-sm">
            {MOCK_MEMBERS.map((member, index) => (
              <View key={member.id}>
                <View className="flex-row items-center p-4">
                  <Avatar size="sm" alt={member.name} className="mr-3">
                    <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                      <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    </Avatar.Image>
                    <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                  </Avatar>
                  <View className="flex-1">
                    <AppText className="font-bold text-base">{member.name}</AppText>
                    {member.role && <AppText className="text-accent text-[10px] font-bold">{member.role}</AppText>}
                  </View>
                  {!member.role && (
                    <PressableFeedback className="p-2">
                      <IconSymbol name="xmark" size={16} color="#A1A1AA" />
                    </PressableFeedback>
                  )}
                </View>
                {index < MOCK_MEMBERS.length - 1 && <Divider className="mx-4 opacity-5" />}
              </View>
            ))}
          </Card>
        </View>

        {/* Invite Section */}
        <View className="mb-12">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">MỜI THÀNH VIÊN</AppText>
          <View className="flex-row gap-4">
            <PressableFeedback className="flex-1 bg-surface border border-divider/10 h-16 rounded-2xl items-center justify-center flex-row gap-2">
              <IconSymbol name="link" size={20} color={accent} />
              <AppText className="font-bold">Sao chép Link</AppText>
            </PressableFeedback>
            <PressableFeedback className="flex-1 bg-surface border border-divider/10 h-16 rounded-2xl items-center justify-center flex-row gap-2">
              <IconSymbol name="qrcode" size={20} color={accent} />
              <AppText className="font-bold">Chia sẻ QR</AppText>
            </PressableFeedback>
          </View>
        </View>

        {/* Submit Button (Image 3) */}
        <Button variant="primary" size="lg" className="h-16 rounded-3xl bg-accent shadow-xl shadow-accent/40">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="plus" size={20} color="white" />
            <Button.Label className="text-white font-bold text-lg">Tạo nhóm</Button.Label>
          </View>
        </Button>
      </View>
    </ScreenScrollView>
  );
}
