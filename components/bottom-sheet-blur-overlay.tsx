import { useBottomSheet, useBottomSheetAnimation } from 'heroui-native';
import { StyleSheet, Pressable } from 'react-native';
import { interpolate, useDerivedValue } from 'react-native-reanimated';
import { AnimatedBlurView } from './animated-blur-view';
import { useUniwind } from 'uniwind';

export const BottomSheetBlurOverlay = () => {
  const { theme } = useUniwind();
  const { onOpenChange } = useBottomSheet();
  const { progress } = useBottomSheetAnimation();

  const blurIntensity = useDerivedValue(() => {
    return interpolate(progress.get(), [0, 1, 2], [0, 40, 0]);
  });

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => onOpenChange(false)}
    >
      <AnimatedBlurView
        blurIntensity={blurIntensity}
        tint={theme === 'dark' ? 'dark' : 'systemUltraThinMaterialDark'}
        style={StyleSheet.absoluteFill}
      />
    </Pressable>
  );
};
