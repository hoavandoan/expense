import { cn } from "heroui-native";
import React from "react";
import { View } from "react-native";

interface AnimatedScrollViewTitleWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedScrollViewTitleWrapper: React.FC<AnimatedScrollViewTitleWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <View className={cn("relative w-full px-4 pb-4", className)}>
      {children}
    </View>
  );
};
