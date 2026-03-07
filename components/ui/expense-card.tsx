import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTranslation } from "@/lib/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/utils/expense";
import { Image } from "expo-image";
import { Avatar, Card, cn, Separator } from "heroui-native";
import React, { FC } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ExpenseCardProps {
  expense: any;
  currency: string;
  memberMap: Map<string, any>;
  currentUserId?: string;
  onPress?: () => void;
  className?: string;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export const ExpenseCard: FC<ExpenseCardProps> = ({
  expense,
  currency,
  memberMap,
  currentUserId,
  onPress,
  className,
}) => {
  const { t, locale } = useTranslation();
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

  const payer = memberMap.get(expense.paid_by);
  const participants =
    expense.expense_splits
      ?.map((split: any) => memberMap.get(split.user_id))
      .filter(Boolean) || [];

  return (
    <AnimatedCard
      variant="default"
      className={cn("p-4 rounded-2xl bg-surface border border-border/10", className)}
      style={animatedStyle}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-3">
              <IconSymbol
                name={getCategoryIcon(expense.category) as any}
                size={20}
                color="var(--accent)"
              />
            </View>
            <View className="flex-1">
              <AppText
                className="font-bold text-base text-foreground"
                numberOfLines={1}
              >
                {expense.title}
              </AppText>
              <AppText className="text-muted text-[10px] uppercase font-bold mt-0.5">
                {new Date(
                  expense.expense_date || expense.created_at
                ).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
              </AppText>
            </View>
          </View>
          <View className="items-end">
            <AppText className="font-bold text-base text-foreground">
              {formatCurrency(expense.amount, currency)}
            </AppText>
          </View>
        </View>

        <Separator className="bg-border/5 mb-3" />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Avatar size="sm" alt={payer?.name || "P"} className="mr-2 size-6">
              {payer?.avatar_url ? (
                <Avatar.Image source={{ uri: payer.avatar_url }} asChild>
                  <Image
                    source={{ uri: payer.avatar_url }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <AppText className="font-bold text-accent text-[8px]">
                    {payer?.name?.charAt(0) || "P"}
                  </AppText>
                </Avatar.Fallback>
              )}
            </Avatar>
            <AppText className="text-xs text-muted">
              {t("expense_card.paid_by")}{" "}
              <AppText className="text-foreground font-semibold">
                {expense.paid_by === currentUserId
                  ? t("expense_card.you")
                  : payer?.name || t("expense_card.someone")}
              </AppText>
            </AppText>
          </View>

          <View className="flex-row items-center">
            {participants.slice(0, 3).map((p: any, index: number) => (
              <Avatar
                key={p.id + index}
                size="sm"
                alt={p.name}
                className={cn(
                  index !== 0 && "-ml-3",
                  "size-6"
                )}
              >
                {p.avatar_url ? (
                  <Avatar.Image source={{ uri: p.avatar_url }} asChild>
                    <Image
                      source={{ uri: p.avatar_url }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Avatar.Image>
                ) : (
                  <Avatar.Fallback className="bg-surface-tertiary">
                    <AppText className="text-[8px] font-bold">
                      {p.name?.charAt(0)}
                    </AppText>
                  </Avatar.Fallback>
                )}
              </Avatar>
            ))}
            {participants.length > 3 && (
              <View className="size-5 rounded-full bg-surface-tertiary items-center justify-center -ml-2">
                <AppText className="text-[8px] font-bold text-muted">
                  +{participants.length - 3}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </AnimatedCard>
  );
};

