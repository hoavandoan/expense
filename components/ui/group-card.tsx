import { AppText } from "@/components/app-text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Card, cn } from "heroui-native";
import React, { FC } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface Member {
  id: string;
  avatarUrl?: string;
  name: string;
}

interface GroupCardProps {
  title: string;
  memberCount: number;
  balance: number;
  members: Member[];
  className?: string;
  onPress?: () => void;
  variant?: "default" | "horizontal";
  bgImage?: string;
  index?: number;
  scrollX?: SharedValue<number>;
}

export const CARD_WIDTH = 320;
export const CARD_HEIGHT = 170;
export const GAP = 12;

export const GroupCard: FC<GroupCardProps> = ({
  title,
  memberCount,
  balance,
  members,
  className,
  onPress,
  variant = "default",
  bgImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000",
  index = 0,
  scrollX,
}) => {
  const scale = useSharedValue(1);
  const { width } = useWindowDimensions();

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isPositive = balance >= 0;
  const balanceText = isPositive
    ? `+${(balance / 1000).toFixed(0)}k`
    : `-${(Math.abs(balance) / 1000).toFixed(0)}k`;

  const balanceColor = isPositive ? "text-success" : "text-danger";

  const animatedStyle = useAnimatedStyle(() => {
    let s = scale.value;
    let opacity = 1;

    if (variant === "horizontal" && scrollX) {
      const inputRange = [
        (index - 1) * (CARD_WIDTH + GAP),
        index * (CARD_WIDTH + GAP),
        (index + 1) * (CARD_WIDTH + GAP),
      ];

      s = interpolate(
        scrollX.value,
        inputRange,
        [0.92, 1, 0.92],
        "clamp"
      ) * scale.value;

      opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.75, 1, 0.75],
        "clamp"
      );
    }

    return {
      transform: [{ scale: s }],
      opacity,
    };
  });

  if (variant === "horizontal") {
    return (
      <Animated.View style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="flex-1"
        >
          <Card
            variant="default"
            className={cn(
              "flex-1 relative p-0 rounded-[] border border-border/10 overflow-hidden shadow-lg",
              className
            )}
            style={{
              borderCurve: 'continuous'
            }}
          >
            <Image
              source={{ uri: bgImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000" }}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
              style={StyleSheet.absoluteFill}
            />
            
            <View className="flex-1 justify-between p-6">
              {/* Top Row could have a badge or something, currently empty to focus on bottom */}
              <View />

              <View>
                <AppText 
                  variant="heading" 
                  weight="bold" 
                  className="text-white text-2xl mb-3"
                  numberOfLines={1}
                >
                  {title}
                </AppText>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="flex-row items-center">
                      {members.slice(0, 3).map((member, idx) => (
                        <Avatar
                          key={member.id}
                          size="sm"
                          alt={member.name}
                          className={cn("size-8 border-black/20 border-2")}
                          style={{
                            marginLeft: idx > 0 ? -12 : 0,
                            zIndex: 10 - idx,
                          }}
                        >
                          <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                            <Image
                              source={{ uri: member.avatarUrl }}
                              style={{ width: "100%", height: "100%" }}
                              contentFit="cover"
                            />
                          </Avatar.Image>
                          <Avatar.Fallback className="bg-accent/40">
                            <AppText weight="bold" className="text-[10px] text-white">
                              {member.name.charAt(0)}
                            </AppText>
                          </Avatar.Fallback>
                        </Avatar>
                      ))}
                      {memberCount > 3 && (
                        <View className="size-8 rounded-full bg-white/20 border border-white/20 items-center justify-center -ml-3 z-0">
                          <AppText weight="bold" className="text-[10px] text-white">
                            +{memberCount - 3}
                          </AppText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="items-end bg-black/40 px-3.5 py-1.5 rounded-full border border-white/20">
                    <AppText
                      weight="bold"
                      className="text-white/60 text-[8px] uppercase tracking-widest mb-0.5"
                    >
                      Tổng chi
                    </AppText>
                    <AppText
                      variant="heading"
                      weight="bold"
                      className={cn("text-sm", balanceColor)}
                    >
                      {balanceText}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </Pressable>
      </Animated.View>
    );
  }

  const balanceDisplay = isPositive
    ? `Bạn được trả: ${balance.toLocaleString()}đ`
    : `Bạn nợ: ${Math.abs(balance).toLocaleString()}đ`;

  return (
    <Animated.View style={animatedStyle}>
      <Card
        variant="default"
        className={cn("mb-4 p-5 rounded-3xl border border-border/10 bg-surface", className)}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="flex-row items-center justify-between"
        >
          <View className="flex-1 mr-4">
            <AppText variant="heading" weight="bold" className="text-lg mb-1">
              {title}
            </AppText>
            <AppText weight="medium" className="text-muted text-xs mb-3">
              {memberCount} thành viên
            </AppText>

            <View className="flex-row items-center">
              {members.slice(0, 4).map((member, idx) => (
                <Avatar
                  key={member.id}
                  size="sm"
                  alt={member.name}
                  className={cn(
                    idx !== 0 && "-ml-3",
                    "w-8 h-8 rounded-full border-2 border-surface"
                  )}
                >
                  {member.avatarUrl ? (
                    <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                      <Image
                        source={{ uri: member.avatarUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </Avatar.Image>
                  ) : (
                    <Avatar.Fallback className="bg-accent/10">
                      <AppText weight="bold" className="text-xs text-accent">
                        {member.name.charAt(0)}
                      </AppText>
                    </Avatar.Fallback>
                  )}
                </Avatar>
              ))}
              {memberCount > 4 && (
                <View className="w-8 h-8 rounded-full bg-surface-secondary border-2 border-surface items-center justify-center -ml-3">
                  <AppText weight="bold" className="text-[10px] text-muted">
                    +{memberCount - 4}
                  </AppText>
                </View>
              )}
            </View>
          </View>

          <View className="items-end bg-accent-soft px-4 py-2 rounded-2xl">
            <AppText weight="bold" className={cn("text-sm", balanceColor)}>
              {balanceDisplay}
            </AppText>
          </View>
        </Pressable>
      </Card>
    </Animated.View>
  );
};

