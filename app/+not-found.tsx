import { useTranslation } from '@/lib/hooks/use-translation';
import { Link, Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const textColor = useThemeColor('foreground');
  const accentColor = useThemeColor('accent');

  return (
    <>
      <Stack.Screen options={{ title: t("not_found.title") }} />
      <View className="flex-1 items-center justify-center p-5 bg-background">
        <Text className="text-xl font-bold mb-4" style={{ color: textColor }}>
          {t("not_found.message")}
        </Text>

        <Link href="/(tabs)" className="mt-4 py-4">
          <Text className="text-base font-semibold" style={{ color: accentColor }}>
            {t("not_found.link")}
          </Text>
        </Link>
      </View>
    </>
  );
}
