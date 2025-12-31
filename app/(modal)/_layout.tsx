import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="add-group" />
      <Stack.Screen name="join-group" />
      <Stack.Screen name="settle-up" />
      <Stack.Screen name="payment-confirm" />
    </Stack>
  );
}
