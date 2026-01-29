import { ActionIcon } from "@/components/ui/action-icon";
import { useRouter } from "expo-router";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export const QuickActions = () => {
  const router = useRouter();

  return (
    <View className="flex-row justify-center px-6 my-8 gap-6">
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <ActionIcon
          name="creditcard"
          label="Chi tiêu"
          onPress={() => router.push("/add-expense")}
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <ActionIcon
          name="plus"
          label="Tạo nhóm"
          onPress={() => router.push("/add-group")}
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <ActionIcon
          name="qrcode"
          label="Tham gia"
          onPress={() => router.push("/join-group")}
        />
      </Animated.View>
    </View>
  );
};
