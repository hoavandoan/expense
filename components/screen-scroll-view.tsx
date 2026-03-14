import { useHeaderHeight } from "@react-navigation/elements";
import { cn, useThemeColor } from "heroui-native";

import { type FC, type PropsWithChildren } from "react";
import { RefreshControl, ScrollView, type ScrollViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import Animated, { type AnimatedProps } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Props extends AnimatedProps<ScrollViewProps> {
  className?: string;
  contentContainerClassName?: string;
  withTabBarOffset?: boolean;
  withKeyboardAvoidingView?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * A standardized ScrollView for screens.
 * Handles header offset, safe areas, and optional tab bar padding.
 * Uses KeyboardAwareScrollView from react-native-keyboard-controller for better keyboard handling.
 */
export const ScreenScrollView: FC<PropsWithChildren<Props>> = ({
  children,
  className,
  contentContainerClassName,
  withTabBarOffset = false,
  withKeyboardAvoidingView = false,
  refreshing,
  onRefresh,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  // Calculate bottom padding: insets.bottom + a small buffer for the end of content
  const bottomPadding = (withTabBarOffset ? 32 : 16) + insets.bottom;

  const accent = useThemeColor("accent");

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing || false}
      onRefresh={onRefresh}
      tintColor={accent}
    />
  ) : undefined;

  // Use KeyboardAwareScrollView for forms with inputs
  // Note: Modal screens already have their own header, so paddingTop is minimal
  if (withKeyboardAvoidingView) {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={bottomPadding}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            paddingHorizontal: 24,
          },
          props.contentContainerStyle as any,
        ]}
        refreshControl={refreshControl}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  // Use standard AnimatedScrollView for non-form screens
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
      refreshControl={refreshControl}
      {...props}
    >
      {children}
    </AnimatedScrollView>
  );
};
