import {
    BlurMask,
    Canvas,
    Circle,
    LinearGradient,
    Rect,
    vec,
} from "@shopify/react-native-skia";
import { useThemeColor } from "heroui-native";
import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { Easing, useDerivedValue, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";

/**
 * Animated Skia background with soft blobs and gradients for a premium onboarding feel.
 * Optimized for Reanimated v4 + Skia performance.
 */
export const SkiaOnboardingBackground = () => {
  const { width, height } = useWindowDimensions();
  const accent = useThemeColor("accent");
  const background = useThemeColor("surface-secondary");
  
  // Animation values for blobs
  const blob1X = useSharedValue(width * 0.2);
  const blob1Y = useSharedValue(height * 0.3);
  const blob2X = useSharedValue(width * 0.8);
  const blob2Y = useSharedValue(height * 0.7);

  // Use derived values to create animated points for Skia props
  const blob1Pos = useDerivedValue(() => vec(blob1X.get(), blob1Y.get()));
  const blob2Pos = useDerivedValue(() => vec(blob2X.get(), blob2Y.get()));

  useEffect(() => {
    blob1X.set(withRepeat(
      withTiming(width * 0.4, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    ));
    blob1Y.set(withRepeat(
      withTiming(height * 0.5, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    ));
    
    blob2X.set(withRepeat(
      withTiming(width * 0.6, { duration: 7500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    ));
    blob2Y.set(withRepeat(
      withDelay(2000, withTiming(height * 0.4, { duration: 5000, easing: Easing.inOut(Easing.sin) })),
      -1,
      true
    ));
  }, [width, height]);

  return (
    <Canvas style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Base Background */}
      <Rect x={0} y={0} width={width} height={height} color={background} />
      
      {/* Animated Blobs */}
      <Circle c={blob1Pos} r={width * 0.6} color={accent} opacity={0.35}>
        <BlurMask blur={80} style="normal" />
      </Circle>
      
      <Circle c={blob2Pos} r={width * 0.5} color={accent} opacity={0.35}>
        <BlurMask blur={100} style="normal" />
      </Circle>
      
      {/* Subtle Overlay Gradient */}
      <Rect x={0} y={0} width={width} height={height} opacity={0.4}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={["transparent", background]}
        />
      </Rect>
    </Canvas>
  );
};
