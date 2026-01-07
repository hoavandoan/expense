import { useHeaderHeight } from '@react-navigation/elements';
import { cn, useThemeColor } from 'heroui-native';

import { type FC, type PropsWithChildren } from 'react';
import { Platform, RefreshControl, ScrollView, type ScrollViewProps, View } from 'react-native';

import Animated, { type AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);


interface Props extends AnimatedProps<ScrollViewProps> {
  className?: string;
  contentContainerClassName?: string;
  withTabBarOffset?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * A standardized ScrollView for screens.
 * Handles header offset, safe areas, and optional tab bar padding.
 */
export const ScreenScrollView: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  contentContainerClassName,
  withTabBarOffset = false,
  refreshing,
  onRefresh,
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

  // Calculate bottom padding: insets.bottom + optional tab bar height (roughly 100px)
  const bottomPadding = (withTabBarOffset ? 100 : 0) + (isIOS ? insets.bottom : insets.bottom + 16);

  return (
    <AnimatedScrollView
      className={cn('bg-background flex-1', className)}
      contentContainerStyle={[
        {
          paddingTop: headerHeight,
          paddingBottom: bottomPadding,
        },
        props.contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            tintColor={useThemeColor('accent')}
          />
        ) : undefined
      }
      {...props}
    >
      <View className={cn('px-5', contentContainerClassName)}>
        {children}
      </View>
    </AnimatedScrollView>
  );
};

