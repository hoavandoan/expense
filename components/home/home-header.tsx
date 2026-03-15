import { AppText } from "@/components/app-text";
import { HeaderComponentWrapper } from "@/components/parallax-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTranslation } from "@/lib/hooks";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Avatar, Button, PressableFeedback, useThemeColor } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  user: any;
  isAuthenticated: boolean;
  unreadCount?: number;
}

export const HomeHeader = ({ user, isAuthenticated, unreadCount = 0 }: HomeHeaderProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const foreground = useThemeColor("foreground");

  return (
    <HeaderComponentWrapper className="bg-transparent" useGradient={false}>
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="px-6 pb-4 flex-row items-center justify-between gap-4"
      >
        <View className="flex-row items-center gap-3 flex-1">
          <PressableFeedback
            onPress={() => router.push("/settings")}
            className="rounded-full bg-accent"
          >
            <Avatar
              size="md"
              alt="User profile"
              className="bg-surface shadow-sm"
            >
              {isAuthenticated && user?.avatarUrl ? (
                <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <IconSymbol name="person" size={20} color={accent} />
                </Avatar.Fallback>
              )}
            </Avatar>
          </PressableFeedback>
          <View className="flex-1">
            <AppText className="text-muted text-[13px]">{t('home.greeting')}</AppText>
            <AppText className="text-lg font-bold text-foreground">
              {user?.name || t('home.you')}
            </AppText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => router.push("/search" as any)}
            className="w-10 h-10 rounded-full bg-surface border border-white/10"
          >
            <IconSymbol name="magnifyingglass" size={18} color={foreground} />
          </Button>
          <View className="relative">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => router.push("/notifications" as any)}
              className="w-10 h-10 rounded-full bg-surface border border-white/10"
            >
              <IconSymbol name="bell" size={18} color={foreground} />
            </Button>
            {unreadCount > 0 && (
              <View className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
            )}
          </View>
        </View>
      </View>
    </HeaderComponentWrapper>
  );
};
