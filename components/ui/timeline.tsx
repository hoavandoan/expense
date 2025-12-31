import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { cn, Surface } from 'heroui-native';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: any; // SF Symbol or mapped name
  status?: 'complete' | 'current' | 'upcoming';
  meta?: string;
  children?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  activeColor?: string;
  inactiveColor?: string;
  animated?: boolean;
  animationType?: 'bounce' | 'spring' | 'rotate' | 'fade' | 'scale';
  onItemPress?: (item: TimelineItem) => void;
  className?: string;
  lineWidth?: number;
  iconSize?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const Timeline = ({
  items = [],
  activeColor = '#6366f1',
  inactiveColor = '#3f3f46',
  animated = true,
  animationType = 'bounce',
  onItemPress,
  className,
  lineWidth = 2,
  iconSize = 18,
}: TimelineProps) => {
  const statusRefs = React.useRef<Record<string | number, string>>({});

  useEffect(() => {
    items.forEach((item) => {
      statusRefs.current[item.id] = item.status || 'upcoming';
    });
    return () => {
      statusRefs.current = {};
    };
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Animated.View className={cn('p-4', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isComplete = item.status === 'complete';
        const isCurrent = item.status === 'current';

        const prevStatus = statusRefs.current[item.id];
        const wasComplete = prevStatus === 'complete';
        const statusChanged = prevStatus && prevStatus !== item.status;
        statusRefs.current[item.id] = item.status || 'upcoming';

        const dotScale = useSharedValue(statusChanged ? 1.5 : 1);
        const dotColorAnimated = useSharedValue(isComplete ? 1 : isCurrent ? 0.5 : 0);
        const lineProgress = useSharedValue(isComplete ? 1 : 0);
        const iconRotate = useSharedValue(statusChanged ? 0 : 1);

        useEffect(() => {
          if (statusChanged) {
            switch (animationType) {
              case 'bounce':
                dotScale.value = withSequence(withTiming(1.5, { duration: 200 }), withSpring(1));
                break;
              case 'spring':
                dotScale.value = withSpring(1.2, { damping: 2, stiffness: 80 });
                break;
              case 'rotate':
                iconRotate.value = withSequence(withTiming(0, { duration: 10 }), withTiming(4, { duration: 800 }));
                dotScale.value = withSequence(withTiming(1.6, { duration: 200 }), withSpring(1));
                break;
              case 'scale':
                dotScale.value = withSequence(withTiming(0.5, { duration: 200 }), withTiming(1.2, { duration: 200 }), withTiming(1, { duration: 200 }));
                break;
              default:
                dotScale.value = withSequence(withTiming(1.5, { duration: 200 }), withSpring(1));
            }

            dotColorAnimated.value = withTiming(isComplete ? 1 : isCurrent ? 0.5 : 0, { duration: 400 });
            iconRotate.value = withSequence(withTiming(0, { duration: 10 }), withTiming(1, { duration: 400 }));

            if (isComplete) {
              lineProgress.value = withTiming(1, { duration: 600 });
            } else if (wasComplete) {
              lineProgress.value = withTiming(0, { duration: 600 });
            }
          } else {
            lineProgress.value = isComplete ? 1 : 0;
          }
        }, [item.status, isComplete, isCurrent, animationType]);

        const dotAnimatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: dotScale.value }],
          backgroundColor: interpolateColor(
            dotColorAnimated.value,
            [0, 0.5, 1],
            [inactiveColor, activeColor, activeColor]
          ),
        }));

        const lineAnimatedStyle = useAnimatedStyle(() => ({
          backgroundColor: interpolateColor(
            lineProgress.value,
            [0, 1],
            [inactiveColor, activeColor]
          ),
          width: lineWidth,
          transform: [
            { scaleY: lineProgress.value },
            { translateY: -2 * (1 - lineProgress.value) },
          ],
          opacity: 0.6 + lineProgress.value * 0.4,
        }));

        const iconAnimatedStyle = useAnimatedStyle(() => ({
          transform: [
            { rotateZ: `${iconRotate.value * 360}deg` },
            { scale: 0.8 + iconRotate.value * 0.2 },
          ],
        }));

        const iconName = item.icon || (isComplete ? 'checkmark' : isCurrent ? 'activity' : 'circle');

        return (
          <AnimatedTouchableOpacity
            key={item.id}
            className="flex-row mb-4 gap-3"
            activeOpacity={onItemPress ? 0.7 : 1}
            onPress={() => onItemPress && onItemPress(item)}
            entering={animated ? FadeInDown.delay(index * 100).springify() : undefined}
            layout={LinearTransition.springify()}
          >
            <View className="items-center w-10">
              <Animated.View
                style={dotAnimatedStyle}
                className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
              >
                <Animated.View style={iconAnimatedStyle}>
                  <IconSymbol name={iconName} size={iconSize} color="#fff" />
                </Animated.View>
              </Animated.View>

              {!isLast && (
                <View className="flex-1 items-center">
                  <Animated.View style={lineAnimatedStyle} className="flex-1 mt-1" />
                </View>
              )}
            </View>

            <View className="flex-1 ml-4 mt-1">
              <View className="flex-row justify-between items-start mb-1.5">
                <AppText className={cn("text-base font-bold flex-1", (isComplete || isCurrent) ? "text-white" : "text-muted")}>
                  {item.title}
                </AppText>
                {item.timestamp && (
                  <AppText className="text-muted text-xs ml-2">
                    {item.timestamp}
                  </AppText>
                )}
              </View>

              {item.description && (
                <AppText className="text-muted text-sm leading-5 mb-2">
                  {item.description}
                </AppText>
              )}

              {item.meta && (
                <Surface className="bg-surface-secondary/20 px-2 py-1 rounded-lg self-start mt-1 mb-2">
                  <AppText className="text-white/60 text-xs">
                    {item.meta}
                  </AppText>
                </Surface>
              )}

              {item.children && (
                <View className="p-3">
                  {item.children}
                </View>
              )}
            </View>
          </AnimatedTouchableOpacity>
        );
      })}
    </Animated.View>
  );
};
