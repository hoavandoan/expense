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
          <AppText className="text-white/80 text-xs uppercase tracking-[2px] font-semibold">
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
            className="text-white font-bold text-3xl"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {showBalance
              ? formatCurrency(balance, "VND")
              : "••••••••"}
          </AppText>
        </View>

        <View className="flex-row bg-black/10 rounded-2xl p-3 gap-4">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-6 h-6 bg-success/20 rounded-full items-center justify-center">
                <IconSymbol name="arrow.down.left" size={12} color="#4ade80" />
              </View>
              <AppText className="text-white text-xs uppercase tracking-wider font-semibold">
                Bạn được trả
              </AppText>
            </View>
            <AppText
              className="text-white font-semibold text-base"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {showBalance
                ? `+ ${formatCurrency(totalOweMe, "VND")}`
                : "••••"}
            </AppText>
          </View>

          <View className="w-px bg-white/10 h-10 self-center" />

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-6 h-6 bg-danger/20 rounded-full items-center justify-center">
                <IconSymbol name="arrow.up.right" size={12} color="#fb7185" />
              </View>
              <AppText className="text-white text-xs uppercase tracking-wider font-semibold">
                Bạn nợ
              </AppText>
            </View>
            <AppText
              className="text-danger font-semibold text-base"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {showBalance
                ? `- ${formatCurrency(totalOwed, "VND")}`
                : "••••"}
            </AppText>
          </View>
        </View>
      </Surface>
    </Animated.View>
  );
};
