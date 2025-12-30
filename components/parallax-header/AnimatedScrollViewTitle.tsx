import { cn } from "heroui-native";
import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { AnimatedScrollViewTitleProps } from "./types";

export const AnimatedScrollViewTitle: React.FC<AnimatedScrollViewTitleProps> = ({
  children,
  size,
  style,
  className,
}) => {
  const { width } = useWindowDimensions();
  const maxWidth = 0.5 * width;

  return (
    <View className={cn("px-[10px]", className)}>
      <Text
        numberOfLines={2}
        className="text-white font-bold text-left"
        style={[
          {
            maxWidth: maxWidth,
            fontSize: size ? size : 35,
          },
          style,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};
