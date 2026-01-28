import { useThemeColor } from 'heroui-native';
import { ActivityIndicator, Text, View } from 'react-native';

/**
 * Valid OAuth callback route.
 * preventing 404 "Unmatched Route" on Android during redirects.
 */
export default function AuthCallback() {
  const accentColor = useThemeColor('accent');
  const textColor = useThemeColor('foreground');

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={accentColor} />
      <Text className="mt-4 font-medium" style={{ color: textColor }}>
        Hoàn tất đăng nhập...
      </Text>
    </View>
  );
}
