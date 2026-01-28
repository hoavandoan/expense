import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Stack, useRouter } from "expo-router";

import { Button, PressableFeedback, useThemeColor } from "heroui-native";

export default function ModalLayout() {
  const router = useRouter();
  const foreground = useThemeColor("foreground");
  const background = useThemeColor("background");

  return (
    <Stack
      screenOptions={{
        presentation: "formSheet",
        headerShown: true,
        headerLeft: () => (
          <Button
            onPress={() => router.back()}
            variant="ghost"
            isIconOnly
            className="size-10 mr-2 bg-surface"
          >
            <IconSymbol name="chevron.left" size={24} color={foreground} />
          </Button>
        ),
        headerTitleStyle: {
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          color: foreground,
        },
        headerStyle: {
          backgroundColor: background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="add-expense"
        options={{
          title: "Thêm chi tiêu",
          headerRight: () => (
            <PressableFeedback onPress={() => router.back()} className="mr-4">
              <AppText className="text-accent font-bold text-base">Lưu</AppText>
            </PressableFeedback>
          ),
        }}
      />
      <Stack.Screen
        name="add-group"
        options={{
          title: "Tạo nhóm mới",
          headerRight: () => (
            <PressableFeedback onPress={() => router.back()} className="mr-4">
              <AppText className="text-accent font-bold text-base">Tạo</AppText>
            </PressableFeedback>
          ),
        }}
      />
      <Stack.Screen name="join-group" options={{ title: "Tham gia nhóm" }} />
      <Stack.Screen name="settle-up" options={{ title: "Thanh toán" }} />
      <Stack.Screen
        name="payment-confirm"
        options={{ title: "Xác nhận thanh toán" }}
      />
    </Stack>
  );
}
