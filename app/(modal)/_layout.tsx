import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTranslation } from "@/lib/hooks";
import { Stack, useRouter } from "expo-router";

import { Button, PressableFeedback, useThemeColor } from "heroui-native";

export default function ModalLayout() {
  const { t } = useTranslation();
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
          title: t('modal_layout.add_expense_title', { defaultValue: "Thêm chi tiêu" }),
          headerRight: () => (
            <PressableFeedback onPress={() => router.back()} className="mr-4">
              <AppText className="text-accent font-bold text-base">{t('modal_layout.save_btn', { defaultValue: "Lưu" })}</AppText>
            </PressableFeedback>
          ),
        }}
      />
      <Stack.Screen
        name="add-group"
        options={{
          title: t('modal_layout.create_group_title', { defaultValue: "Tạo nhóm mới" }),
          headerRight: () => (
            <PressableFeedback onPress={() => router.back()} className="mr-4">
              <AppText className="text-accent font-bold text-base">{t('modal_layout.create_btn', { defaultValue: "Tạo" })}</AppText>
            </PressableFeedback>
          ),
        }}
      />
      <Stack.Screen name="join-group" options={{ title: t('modal_layout.join_group_title', { defaultValue: "Tham gia nhóm" }) }} />
      <Stack.Screen name="settle-up" options={{ title: t('modal_layout.settle_up_title', { defaultValue: "Thanh toán" }) }} />
      <Stack.Screen
        name="payment-confirm"
        options={{ title: t('modal_layout.payment_confirm_title', { defaultValue: "Xác nhận thanh toán" }) }}
      />
    </Stack>
  );
}
