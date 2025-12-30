import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Divider, PressableFeedback, TextField, useThemeColor } from 'heroui-native';
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

  const accent = useThemeColor('accent')

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

        {/* Group Name Input */}
        <View className="mb-10">
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
                    <Avatar.Image source={{ uri: member.avatarUrl }} />
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
