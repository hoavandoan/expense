import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PressableFeedback } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

interface SettingsItemProps {
  icon: string;
  iconBgColor: string;
  label: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

export function SettingsItem({
  icon,
  iconBgColor,
  label,
  rightElement,
  onPress,
  showChevron = true
}: SettingsItemProps) {
  return (
    <PressableFeedback onPress={onPress} className="flex-row items-center py-3 px-4" animation="disabled">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: iconBgColor + '20' }} // 20% opacity
      >
        <IconSymbol name={icon as any} size={22} color={iconBgColor} />
      </View>
      <AppText className="flex-1 text-base font-medium text-foreground">{label}</AppText>
      <View className="flex-row items-center gap-2">
        {rightElement}
        {showChevron && <IconSymbol name="chevron.right" size={16} color="#A1A1AA" />}
      </View>
    </PressableFeedback>
  );
}
