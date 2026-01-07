import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stack, useRouter } from 'expo-router';

import { Button, PressableFeedback, useThemeColor } from 'heroui-native';


export default function ModalLayout() {
  const router = useRouter();
  return (

    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
        headerLeft: () => (
          <Button
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-secondary"
          >
            <IconSymbol name="chevron.left" size={24} color={useThemeColor('foreground')} />
          </Button>
        ),
        headerTitleStyle: {
          fontFamily: 'Inter_700Bold',
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: useThemeColor('background'),
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="add-expense"
        options={{
          title: 'Thêm chi tiêu',
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
          title: 'Tạo nhóm mới',
          headerRight: () => (
            <PressableFeedback onPress={() => router.back()} className="mr-4">
              <AppText className="text-accent font-bold text-base">Tạo</AppText>
            </PressableFeedback>
          ),
        }}
      />
      <Stack.Screen name="join-group" options={{ title: 'Tham gia nhóm' }} />
      <Stack.Screen name="settle-up" options={{ title: 'Thanh toán' }} />
      <Stack.Screen name="payment-confirm" options={{ title: 'Xác nhận thanh toán' }} />

    </Stack>

  );
}
