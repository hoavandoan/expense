import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { StickyHeader } from '@/components/ui/sticky-header';
import { Avatar, Button, PressableFeedback, TextField, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

export default function ProfileEditScreen() {
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Chỉnh sửa hồ sơ" />

      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-8">
          <Avatar size="lg" alt="User Profile" className="mb-4 w-24 h-24">
            <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} />
          </Avatar>
          <PressableFeedback>
            <AppText className="text-accent font-bold">Thay đổi ảnh đại diện</AppText>
          </PressableFeedback>
        </View>

        <View className="mb-8 gap-4">
          <TextField className="bg-surface border border-divider/10 rounded-2xl px-4 h-16">
            <TextField.Label>Họ và tên</TextField.Label>
            <TextField.Input defaultValue="Duy" />
          </TextField>

          <TextField className="bg-surface border border-divider/10 rounded-2xl px-4 h-16">
            <TextField.Label>Email</TextField.Label>
            <TextField.Input defaultValue="duy@example.com" keyboardType="email-address" />
          </TextField>

          <TextField className="bg-surface border border-divider/10 rounded-2xl px-4 h-16">
            <TextField.Label>Số điện thoại</TextField.Label>
            <TextField.Input defaultValue="0901234567" keyboardType="phone-pad" />
          </TextField>
        </View>

        <Button
          size="lg"
          className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20"
        >
          <Button.Label className="text-white font-bold text-lg">Lưu thay đổi</Button.Label>
        </Button>
      </ScreenScrollView>
    </View>
  );
}
