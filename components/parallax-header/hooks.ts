import { useMemo, useRef } from "react";
import { Animated } from "react-native";

export const useAnimateScrollView = (imageHeight: number, disableScale?: boolean) => {
    const scroll = useRef(new Animated.Value(0)).current;
    const scale = scroll.interpolate({
        inputRange: [-imageHeight, 0, imageHeight],
        outputRange: [2.5, 1, 1],
        extrapolate: "clamp",
    });
    const translateYDown = scroll.interpolate({
        inputRange: [-imageHeight, 0, imageHeight],
        outputRange: [-imageHeight * 0.6, 0, imageHeight * 0.5],
        extrapolate: "clamp",
    });
    const translateYUp = scroll.interpolate({
        inputRange: [-imageHeight, 0, imageHeight],
        outputRange: [imageHeight * 0.3, 0, 0],
        extrapolate: "clamp",
    });
    const onScroll = useMemo(() => Animated.event(
        [{ nativeEvent: { contentOffset: { y: scroll } } }],
        { useNativeDriver: true },
    ), [scroll]);
    return [
        scroll,
        onScroll,
        disableScale ? 1 : scale,
        translateYDown,
        translateYUp,
    ] as const;
};

export const useAnimateNavbar = (
    scroll: Animated.Value,
    imageHeight: number,
    headerHeight: number
) => {
    const HEADER_HEIGHT_DIFFERENCE = imageHeight - headerHeight;
    const headerOpacity = scroll.interpolate({
        inputRange: [0, HEADER_HEIGHT_DIFFERENCE * 0.75, HEADER_HEIGHT_DIFFERENCE],
        outputRange: [0, 0, 1],
        extrapolate: "clamp",
    });
    const overflowHeaderOpacity = scroll.interpolate({
        inputRange: [0, HEADER_HEIGHT_DIFFERENCE * 0.75, HEADER_HEIGHT_DIFFERENCE],
        outputRange: [1, 1, 0],
        extrapolate: "clamp",
    });
    return [headerOpacity, overflowHeaderOpacity];
};
