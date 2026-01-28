import { Link, Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  const textColor = useThemeColor('foreground');
  const accentColor = useThemeColor('accent');

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-background">
        <Text className="text-xl font-bold mb-4" style={{ color: textColor }}>
          This screen doesn't exist.
        </Text>

        <Link href="/(tabs)" className="mt-4 py-4">
          <Text className="text-base font-semibold" style={{ color: accentColor }}>
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}
