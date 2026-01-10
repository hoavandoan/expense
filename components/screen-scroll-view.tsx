import { useHeaderHeight } from "@react-navigation/elements";
import { cn, useThemeColor } from "heroui-native";

import { type FC, type PropsWithChildren } from "react";
import { RefreshControl, ScrollView, type ScrollViewProps } from "react-native";

import Animated, { type AnimatedProps } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  let headerHeight = useHeaderHeight();

  // Calculate bottom padding: insets.bottom + a small buffer for the end of content
  const bottomPadding = (withTabBarOffset ? 32 : 16) + insets.bottom;

  const accent = useThemeColor("accent");

  return (
    <AnimatedScrollView
      className={cn("bg-background flex-1", className)}
      contentContainerClassName={cn("px-6", contentContainerClassName)}
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
            tintColor={accent}
          />
        ) : undefined
      }
      {...props}
    >
      {children}
    </AnimatedScrollView>
  );
};
