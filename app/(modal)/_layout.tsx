import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="add-group" />
    </Stack>
  );
}
