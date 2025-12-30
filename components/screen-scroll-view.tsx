import { useHeaderHeight } from '@react-navigation/elements';
import { cn } from 'heroui-native';
import { type FC, type PropsWithChildren } from 'react';
import { Platform, ScrollView, type ScrollViewProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Props extends AnimatedProps<ScrollViewProps> {
  className?: string;
  contentContainerClassName?: string;
}

export const ScreenScrollView: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  contentContainerClassName,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  let headerHeight = 0;
  const isIOS = Platform.OS === 'ios';

  try {
    headerHeight = useHeaderHeight();
  } catch (e) {
    headerHeight = insets.top;
  }

  console.log(headerHeight, insets)
  return (
    <AnimatedScrollView
      className={cn('bg-background text-foreground', className)}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: isIOS ? 0 : insets.bottom + 52,
      }}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </AnimatedScrollView>
  );
};