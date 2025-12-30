import { BlurTint } from "expo-blur";
import type {
    ImageStyle,
    ScrollViewProps,
    StyleProp,
    TextStyle,
    ViewStyle,
} from "react-native";
import { Animated, ImageSourcePropType } from "react-native";

export type AnimatedViewProps = {
    renderHeaderNavBarComponent?: () => React.JSX.Element;
    renderTopNavBarComponent?: () => React.JSX.Element;
    renderOveralComponent?: () => React.JSX.Element;

    OverlayHeaderContent?: React.ReactNode;
    /**
     * Rendered on top of the screen as a navbar when scrolling to the top
     */
    TopNavBarComponent?: React.JSX.Element;

    /**
     * A component to use on top of header image. It can also be used
     * without header image to render a custom component as header.
     */
    HeaderComponent?: React.JSX.Element;

    /**
     *
     * @returns A component to use on top of header image. It can also be used
     * @function renderHeaderComponent
     * without header image to render a custom component as header.
     */

    renderHeaderComponent?: () => React.JSX.Element;

    /**
     * Rendered on top of the header. Transitions to TopNavbarComponent as you scroll
     */
    HeaderNavbarComponent?: React.JSX.Element;

    /**
     * Height of the header (headerImage or HeaderComponent). Default value is 300
     */
    headerMaxHeight?: number;

    /**
     * Height of the top navbar. Default value is 90
     */
    topBarHeight?: number;

    /**
     * [ANDROID ONLY] Elevation of the top navbar. Default value is 0
     */
    topBarElevation?: number;

    /**
     * @see https://reactnative.dev/docs/image#source
     */
    headerImage?: ImageSourcePropType;

    /**
     * Disables header scaling when scrolling
     */
    disableScale?: boolean;

    /**
     * Image styles
     */
    imageStyle?: StyleProp<ImageStyle>;
};

export type AnimatedScrollViewProps = AnimatedViewProps & ScrollViewProps;

export type AnimatedFlatListViewProps = AnimatedViewProps;

export type AnimatedNavbarProps = {
    scroll: Animated.Value;
    OverflowHeaderComponent?: React.JSX.Element;
    TopNavbarComponent?: React.JSX.Element;
    imageHeight: number;
    headerHeight: number;
    headerElevation: number;
};

export type AnimatedHeaderProps = {
    imageHeight: number;
    OverlayHeaderContent?: React.ReactNode;
    translateYUp: Animated.AnimatedInterpolation<string | number> | 0;
    translateYDown: Animated.AnimatedInterpolation<string | number> | 0 | any;
    scale: Animated.AnimatedInterpolation<string | number> | 1;

    imageStyle?: StyleProp<ImageStyle>;
    HeaderComponent?: React.JSX.Element;
    headerImage?: ImageSourcePropType;
};

export interface AnimatedScrollViewTitleProps {
    children: React.ReactNode;
    size?: number;
    style?: StyleProp<TextStyle>;
    className?: string;
}

export interface HeaderComponentWrapperProps {
    children: React.ReactNode;
    useGradient?: boolean;
    gradientColors?: string[];
    gradientHeight?: number;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

export interface HeaderNavBarProps {
    children: React.ReactNode;
    headerHeight?: number;
    intensity?: number;
    tint?: BlurTint;
    useBlur?: boolean;
    style?: StyleProp<ViewStyle>;
    className?: string;
}
