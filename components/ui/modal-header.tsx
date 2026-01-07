import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModalHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  onClose?: () => void;
  variant?: 'close' | 'back';
}

export function ModalHeader({ title, rightElement, onClose, variant = 'close' }: ModalHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor('foreground');

  const handleClose = onClose || (() => router.back());

  return (
    <View
      className="px-6 py-4 flex-row items-center justify-between bg-background border-b border-divider/5"
    >
      <PressableFeedback
        onPress={handleClose}
        className="w-10 h-10 rounded-full bg-surface items-center justify-center shadow-sm border border-divider/5"
      >
        <IconSymbol 
          name={variant === 'close' ? 'xmark' : 'chevron.left'} 
          size={20} 
          color={foreground} 
        />
      </PressableFeedback>
      
      <AppText className="text-lg font-bold text-foreground">{title}</AppText>
      
      <View className="w-10 items-center justify-center">
        {rightElement}
      </View>
    </View>
  );
}
