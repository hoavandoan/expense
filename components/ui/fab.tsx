import { IconSymbol } from '@/components/ui/icon-symbol';
import { cn, PressableFeedback } from 'heroui-native';
import React from 'react';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FABProps {
  onPress: () => void;
  icon?: string;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(PressableFeedback);

export const FAB = ({ onPress, icon = 'plus', className = '' }: FABProps) => {
  const scale = useSharedValue(1);
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    bottom: insets.bottom + 100, // Elevated to sit above the floating tab bar
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(500).springify()}
      style={animatedStyle}
      className={cn(`absolute right-6 z-50`, className)}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="w-14 h-14 rounded-2xl bg-accent items-center justify-center shadow-xl shadow-accent/40"
      >
        <IconSymbol name={icon as any} size={28} color="white" />
      </AnimatedPressable>
    </Animated.View>
  );
};
