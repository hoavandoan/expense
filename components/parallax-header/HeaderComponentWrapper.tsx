import { LinearGradient } from "expo-linear-gradient";
import { cn } from "heroui-native";
import React from "react";
import { View } from "react-native";
import { HeaderComponentWrapperProps } from "./types";

export const HeaderComponentWrapper: React.FC<HeaderComponentWrapperProps> = ({
  children,
  useGradient = true,
  gradientColors,
  gradientHeight = 150,
  style,
  className,
}) => {
  return (
    <View className={cn("w-full relative", className)} style={style}>
      {children}
      {useGradient && (
        <LinearGradient
          colors={(gradientColors as any) || (["transparent", "rgba(0,0,0,0.8)"] as any)}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: gradientHeight,
          }}
        />
      )}
    </View>
  );
};
