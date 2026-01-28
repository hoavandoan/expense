import { AppText } from "@/components/app-text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, Card, cn } from "heroui-native";
import React, { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
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
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export const GroupCard: FC<GroupCardProps> = ({
  title,
  memberCount,
  balance,
  members,
  className,
  onPress,
  variant = "default",
  bgImage = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000",
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  if (variant === "horizontal") {
    return (
      <Animated.View className="w-[240px]" style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="bg-accent-soft rounded-3xl"
        >
          <Card
            variant="default"
            className={cn(
              "relative p-0 w-full rounded-3xl border border-divider/10 overflow-hidden",
              className
            )}
          >
            {bgImage && (
              <Image
                source={{ uri: bgImage }}
                contentFit="cover"
                className="absolute h-[150px] w-full"
              />
            )}
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
              style={StyleSheet.absoluteFill}
              className="w-full"
            />
            <View className="p-4 pt-20">
              <AppText variant="heading" weight="bold" className="text-white text-lg mb-2">
                {title}
              </AppText>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {members.slice(0, 3).map((member, index) => (
                    <Avatar
                      key={member.id}
                      size="sm"
                      alt={member.name}
                      className={cn("size-6 border-background border-[2px]")}
                      style={{
                        marginLeft: index > 0 ? -8 : 0,
                      }}
                    >
                      <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                        <Image
                          source={{ uri: member.avatarUrl }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      </Avatar.Image>
                      <Avatar.Fallback className="w-7 h-7 bg-accent/20">
                        <AppText weight="bold" className="text-[10px] text-white">
                          {member.name.charAt(0)}
                        </AppText>
                      </Avatar.Fallback>
                    </Avatar>
                  ))}
                  {memberCount > 3 && (
                    <View className="w-7 h-7 rounded-full bg-white/20 border border-white/20 items-center justify-center -ml-3">
                      <AppText weight="bold" className="text-[8px] text-white">
                        +{memberCount - 3}
                      </AppText>
                    </View>
                  )}
                </View>

                <View className="items-end">
                  <AppText
                    weight="bold"
                    className="text-white/70 text-[8px] uppercase tracking-widest"
                  >
                    BẠN ĐƯỢC TRẢ
                  </AppText>
                  <AppText
                    variant="heading"
                    weight="bold"
                    className={cn("text-base", balanceColor)}
                  >
                    {balanceText}
                  </AppText>
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
    <AnimatedCard
      variant="default"
      className={cn("mb-4 p-5 rounded-3xl border border-divider/10 bg-surface", className)}
      style={animatedStyle}
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
            {members.slice(0, 4).map((member, index) => (
              <Avatar
                key={member.id}
                size="sm"
                alt={member.name}
                className={cn(
                  index !== 0 && "-ml-3",
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
    </AnimatedCard>
  );
};

