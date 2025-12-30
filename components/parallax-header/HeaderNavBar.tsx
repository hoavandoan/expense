import { BlurView } from "expo-blur";
import { cn } from "heroui-native";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderNavBarProps } from "./types";

export const HeaderNavBar: React.FC<HeaderNavBarProps> = ({
  children,
  headerHeight = 100,
  intensity = 30,
  tint = "dark",
  useBlur,
  style,
  className,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn("w-full overflow-hidden", className)}
      style={[{ height: headerHeight }, style]}
    >
      {useBlur ? (
        <BlurView
          intensity={intensity}
          tint={tint}
          className="flex-1 px-5 flex-row items-center justify-between"
          style={{ paddingTop: insets.top }}
        >
          {children}
        </BlurView>
      ) : (
        <View
          className="flex-1 px-5 flex-row items-center justify-between"
          style={{ paddingTop: insets.top }}
        >
          {children}
        </View>
      )}
    </View>
  );
};
