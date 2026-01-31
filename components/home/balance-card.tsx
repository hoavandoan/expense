import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { PressableFeedback, Surface } from "heroui-native";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface BalanceCardProps {
  balance: number;
  totalOwed: number;
  totalOweMe: number;
  showBalance: boolean;
  onToggleBalance: () => void;
}

export const BalanceCard = ({
  balance,
  totalOwed,
  totalOweMe,
  showBalance,
  onToggleBalance,
}: BalanceCardProps) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(800).springify()}
      className="px-6 mt-6"
    >
      <Surface
        variant="default"
        className="p-8 rounded-[32px] shadow-2xl overflow-hidden bg-accent relative"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-row items-center justify-between mb-4">
          <AppText weight="bold" className="text-white/80 text-[10px] uppercase tracking-[2px]">
            Số dư của bạn
          </AppText>
          <PressableFeedback 
            onPress={onToggleBalance}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
          >
            <IconSymbol
              name={showBalance ? "eye" : "eye.slash"}
              size={20}
              color="white"
            />
          </PressableFeedback>
        </View>

        <View className="flex-row items-baseline gap-2 mb-8">
          <AppText
            variant="heading"
            weight="bold"
            className="text-white text-5xl"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {showBalance
              ? formatCurrency(balance, "VND").replace("₫", "").trim()
              : "••••••••"}
          </AppText>
          <AppText variant="heading" weight="bold" className="text-white/90 text-2xl">
            đ
          </AppText>
        </View>

        <View className="flex-row bg-black/10 rounded-2xl p-5 gap-4">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-6 h-6 bg-success/20 rounded-full items-center justify-center">
                <IconSymbol name="arrow.down.left" size={12} color="#4ade80" />
              </View>
              <AppText weight="bold" className="text-white/70 text-[10px] uppercase tracking-wider">
                Bạn được trả
              </AppText>
            </View>
            <AppText
              variant="heading"
              weight="bold"
              className="text-white text-xl"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {showBalance
                ? `+ ${formatCurrency(totalOweMe, "VND").replace("₫", "").trim()}`
                : "••••"}
            </AppText>
          </View>

          <View className="w-px bg-white/10 h-10 self-center" />

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-6 h-6 bg-danger/20 rounded-full items-center justify-center">
                <IconSymbol name="arrow.up.right" size={12} color="#fb7185" />
              </View>
              <AppText weight="bold" className="text-white/70 text-[10px] uppercase tracking-wider">
                Bạn nợ
              </AppText>
            </View>
            <AppText
              variant="heading"
              weight="bold"
              className="text-white text-xl"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {showBalance
                ? `- ${formatCurrency(totalOwed, "VND").replace("₫", "").trim()}`
                : "••••"}
            </AppText>
          </View>
        </View>
      </Surface>
    </Animated.View>
  );
};
