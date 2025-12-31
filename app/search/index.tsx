import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { PressableFeedback, TextField, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

export default function SearchScreen() {
  const foreground = useThemeColor('foreground');

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Tìm kiếm" />

      <View className="px-6 py-4">
        <TextField className="bg-surface-secondary rounded-2xl px-2">
          <TextField.InputStartContent>
            <IconSymbol name="magnifyingglass" size={18} color="gray" />
          </TextField.InputStartContent>
          <TextField.Input placeholder="Tìm nhóm, bạn bè, khoản chi..." />
        </TextField>
      </View>

      <ScreenScrollView>
        <View className="p-6">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4">GẦN ĐÂY</AppText>
          <View className="gap-2">
            {['Đà Lạt', 'Tiền điện', 'Hương', 'Nhà trọ'].map((item, idx) => (
              <PressableFeedback key={idx} className="flex-row items-center justify-between py-3 border-b border-divider/5">
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="clock" size={16} color="gray" />
                  <AppText className="text-base">{item}</AppText>
                </View>
                <IconSymbol name="multiply" size={14} color="gray" />
              </PressableFeedback>
            ))}
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
}
