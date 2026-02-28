import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
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
      style={{ paddingTop: insets.top }}
      className="bg-background border-b border-border/10"
    >
      <View className="h-16 px-6 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Button
            onPress={handleClose}
            variant="ghost"
            isIconOnly
            className="size-10 mr-3 bg-surface"
          >
            <IconSymbol 
              name={variant === 'close' ? 'xmark' : 'chevron.left'} 
              size={24} 
              color={foreground} 
            />
          </Button>
          <AppText 
            className="text-lg font-bold text-foreground flex-1"
            numberOfLines={1}
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            {title}
          </AppText>
        </View>
        
        {rightElement && (
          <View className="ml-4">
            {rightElement}
          </View>
        )}
      </View>
    </View>
  );
}
