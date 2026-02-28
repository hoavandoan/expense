import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { StickyHeader } from '@/components/ui/sticky-header';
import { Avatar, Button, Input, Label, PressableFeedback, TextField, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

export default function ProfileEditScreen() {
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Chỉnh sửa hồ sơ" />

      <ScreenScrollView withKeyboardAvoidingView>
        <View className="items-center mb-8">
          <Avatar size="lg" alt="User Profile" className="mb-4 w-24 h-24">
            <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} />
          </Avatar>
          <PressableFeedback>
            <AppText className="text-accent font-bold">Thay đổi ảnh đại diện</AppText>
          </PressableFeedback>
        </View>

        <View className="mb-8 gap-4">
          <TextField isRequired className="bg-surface border border-border/10 rounded-2xl px-4 h-20 justify-center">
            <Label className="mb-1">HỌ VÀ TÊN</Label>
            <Input defaultValue="Duy" className="text-base" />
          </TextField>

          <TextField isRequired className="bg-surface border border-border/10 rounded-2xl px-4 h-20 justify-center">
            <Label className="mb-1">EMAIL</Label>
            <Input defaultValue="duy@example.com" keyboardType="email-address" className="text-base" />
          </TextField>

          <TextField isRequired className="bg-surface border border-border/10 rounded-2xl px-4 h-20 justify-center">
            <Label className="mb-1">SỐ ĐIỆN THOẠI</Label>
            <Input defaultValue="0901234567" keyboardType="phone-pad" className="text-base" />
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
