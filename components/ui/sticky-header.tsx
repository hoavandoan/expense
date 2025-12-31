import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StickyHeaderProps {
  title: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export function StickyHeader({ title, onBack, rightContent }: StickyHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-background border-b border-divider/5"
    >
      <View className="h-16 px-6 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <PressableFeedback
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center -ml-2"
          >
            <IconSymbol name="chevron.left" size={24} color="gray" />
          </PressableFeedback>
          <AppText className="text-xl font-bold ml-2 flex-1" numberOfLines={1}>
            {title}
          </AppText>
        </View>

        {rightContent && (
          <View className="ml-4">
            {rightContent}
          </View>
        )}
      </View>
    </View>
  );
}
