import React from "react";
import {
    Animated,
    ImageBackground,
    useWindowDimensions,
    View,
} from "react-native";
import type { AnimatedHeaderProps } from "./types";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export const AnimatedHeader = ({
  HeaderComponent,
  headerImage,
  imageHeight,
  translateYUp,
  translateYDown,
  scale,
  imageStyle,
  OverlayHeaderContent,
}: AnimatedHeaderProps) => {
  const { width } = useWindowDimensions();
  
  const opacity = translateYDown.interpolate({
    inputRange: [-imageHeight * 0.3, 0, imageHeight * 0.3],
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = translateYDown.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View
      className="items-center overflow-hidden"
      style={{
        marginTop: -imageHeight * 4,
        paddingTop: imageHeight * 4,
      }}
    >
      {HeaderComponent ? (
        <>
          {headerImage ? (
            <AnimatedImageBackground
              source={headerImage}
              style={[
                { height: imageHeight, width: width * 1.2 },
                {
                  transform: [
                    { scale: scale },
                    { translateY: translateYUp },
                    { translateY: translateYDown },
                  ],
                },
                imageStyle,
              ]}
            >
              {HeaderComponent}
            </AnimatedImageBackground>
          ) : (
            <>
              <Animated.View
                style={[
                  { height: imageHeight, width },
                  {
                    transform: [
                      { scale },
                      { translateY: translateYUp },
                      { translateY: translateYDown },
                    ],
                    opacity: headerOpacity,
                  },
                ]}
              >
                {HeaderComponent}
              </Animated.View>

              <Animated.View className="absolute bottom-0 w-full">
                <Animated.View style={{ opacity }}>
                  {OverlayHeaderContent}
                </Animated.View>
              </Animated.View>
            </>
          )}
        </>
      ) : (
        <Animated.Image
          source={headerImage}
          style={[
            { height: imageHeight, width: width * 1.2 },
            {
              transform: [
                { scale },
                { translateY: translateYUp },
                { translateY: translateYDown },
              ],
            },
            imageStyle,
          ]}
        />
      )}
    </View>
  );
};
