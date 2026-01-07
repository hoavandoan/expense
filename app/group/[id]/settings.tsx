import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { useLocalSearchParams } from 'expo-router';
import { Avatar, Button, Card, PressableFeedback, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';

export default function GroupSettingsScreen() {
  const { id } = useLocalSearchParams();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const [simplifyDebts, setSimplifyDebts] = useState(true);

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Cài đặt nhóm" />

      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-8">
          <Avatar size="lg" alt="Group Image" className="mb-4 w-24 h-24">
            <Avatar.Image source={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=200' }} />
          </Avatar>
          <PressableFeedback>
            <AppText className="text-accent font-bold">Thay đổi ảnh nhóm</AppText>
          </PressableFeedback>
        </View>

        <View className="mb-8">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">THÔNG TIN CHUNG</AppText>
          <Card className="p-4 rounded-2xl border border-divider/10 gap-4">
            <TextField className="bg-surface-secondary">
              <TextField.Label>Tên nhóm</TextField.Label>
              <TextField.Input defaultValue="Đà Lạt 2024 🍓" />
            </TextField>
            <TextField
              className="bg-surface-secondary"
            >
              <TextField.Label>Mô tả</TextField.Label>
              <TextField.Input
                multiline
                numberOfLines={3}
                defaultValue="Chuyến đi chơi cuối năm cùng hội bạn thân"
              />
            </TextField>
          </Card>
        </View>

        <View className="mb-8">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">TÙY CHỌN</AppText>
          <Card className="rounded-2xl border border-divider/10 overflow-hidden">
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <AppText className="font-bold text-base">Tối ưu hóa nợ</AppText>
                <AppText className="text-muted text-xs">Tự động đơn giản hóa các khoản nợ chéo trong nhóm</AppText>
              </View>
              <Switch
                value={simplifyDebts}
                onValueChange={setSimplifyDebts}
                trackColor={{ false: '#767577', true: accent }}
              />
            </View>
            <View className="h-px bg-divider/10 mx-4" />
            <PressableFeedback>
              <View className="p-4 flex-row items-center justify-between">
                <View>
                  <AppText className="font-bold text-base">Tiền tệ</AppText>
                  <AppText className="text-muted text-xs">VNĐ (đ)</AppText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="gray" />
              </View>
            </PressableFeedback>
          </Card>
        </View>

        <View className="gap-3 mb-10">
          <Button
            variant="secondary"
            size="lg"
            className="h-14 rounded-2xl bg-danger/10"
          >
            <Button.Label className="text-danger font-bold">Rời khỏi nhóm</Button.Label>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-14 rounded-2xl bg-danger/10"
          >
            <Button.Label className="text-danger font-bold">Xóa nhóm</Button.Label>
          </Button>
        </View>
      </ScreenScrollView>
    </View>
  );
}
