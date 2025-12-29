import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PressableFeedback } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

interface ActionIconProps {
  name: string;
  label: string;
  onPress?: () => void;
  color?: string;
}

export function ActionIcon({ name, label, onPress, color = '#17C964' }: ActionIconProps) {
  return (
    <PressableFeedback onPress={onPress} className="items-center gap-2">
      <View className="w-16 h-16 bg-surface rounded-2xl items-center justify-center">
        <IconSymbol name={name as any} size={28} color={color} />
      </View>
      <AppText className="text-[13px] font-medium text-muted">{label}</AppText>
    </PressableFeedback>
  );
}
