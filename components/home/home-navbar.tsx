import { HeaderNavBar } from "@/components/parallax-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Avatar, Button, PressableFeedback, useThemeColor } from "heroui-native";
import { View } from "react-native";

interface HomeNavbarProps {
  user: any;
  isAuthenticated: boolean;
  unreadCount?: number;
}

export const HomeNavbar = ({ user, isAuthenticated, unreadCount = 0 }: HomeNavbarProps) => {
  const router = useRouter();
  const accent = useThemeColor("accent");
  const foreground = useThemeColor("foreground");

  return (
    <HeaderNavBar useBlur tint="light" intensity={80} className="border-b border-divider/10">
      <View className="flex-row items-center h-full w-full">
        <View className="flex-1 items-start">
          <PressableFeedback
            onPress={() => router.push("/settings")}
            className="rounded-full"
          >
            <Avatar size="sm" alt="User profile" className="bg-surface size-8">
              {isAuthenticated && user?.avatarUrl ? (
                <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <IconSymbol name="person" size={14} color={accent} />
                </Avatar.Fallback>
              )}
            </Avatar>
          </PressableFeedback>
        </View>

        <View className="flex-2 items-center" />

        <View className="flex-1 flex-row justify-end gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => router.push("/search" as any)}
            className="w-10 h-10 bg-black/20 border border-white/10"
          >
            <IconSymbol name="magnifyingglass" size={18} color={foreground} />
          </Button>
          <View className="relative">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => router.push("/notifications" as any)}
              className="w-10 h-10 bg-black/20 border border-white/10"
            >
              <IconSymbol name="bell" size={18} color={foreground} />
            </Button>
            {unreadCount > 0 && (
              <View className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full border border-white" />
            )}
          </View>
        </View>
      </View>
    </HeaderNavBar>
  );
};
