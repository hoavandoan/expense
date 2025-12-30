import React from "react";
import { Animated } from "react-native";
import { useAnimateNavbar } from "./hooks";
import type { AnimatedNavbarProps } from "./types";

export const AnimatedNavbar = ({
  scroll,
  imageHeight,
  OverflowHeaderComponent,
  TopNavbarComponent,
  headerHeight,
  headerElevation,
}: AnimatedNavbarProps) => {
  const [headerOpacity, overflowHeaderOpacity] = useAnimateNavbar(
    scroll,
    imageHeight,
    headerHeight
  );

  return (
    <>
      <Animated.View
        className="absolute top-0 w-full bg-transparent"
        style={{
          zIndex: 10,
          height: headerHeight,
          opacity: headerOpacity,
          elevation: headerElevation,
          transform: [
            {
              translateY: headerOpacity.interpolate({
                inputRange: [0, 0.01, 1],
                outputRange: [-headerHeight, 0, 0],
              }),
            },
          ],
        }}
      >
        {TopNavbarComponent}
      </Animated.View>
      <Animated.View
        className="absolute top-0 w-full bg-transparent"
        style={{
          zIndex: 5,
          height: headerHeight,
          opacity: overflowHeaderOpacity,
          transform: [
            {
              translateY: overflowHeaderOpacity.interpolate({
                inputRange: [0, 0.01, 1],
                outputRange: [-headerHeight, 0, 0],
              }),
            },
          ],
        }}
      >
        {OverflowHeaderComponent}
      </Animated.View>
    </>
  );
};
