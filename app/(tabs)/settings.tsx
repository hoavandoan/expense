import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SettingsItem } from '@/components/ui/settings-item';
import { useAppTheme } from '@/contexts/app-theme-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Divider, PressableFeedback, Switch, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const { isDark, toggleTheme } = useAppTheme();
  const foreground = useThemeColor('foreground');
  const router = useRouter()

  return (
    <ScreenScrollView className="android:my-4">
      {/* Header (Image 1) */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <PressableFeedback
          onPress={router.back}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center shadow-sm"
        >
          <IconSymbol name="chevron.left" size={20} color={foreground} />
        </PressableFeedback>
        <AppText className="text-lg font-bold">Cài đặt</AppText>
        <View className="w-10" />
      </View>

      {/* Profile Section (Image 1) */}
      <View className="items-center py-8">
        <View className="relative">
          <Avatar size="lg" alt="Nguyễn Văn A" className="w-32 h-32 border-4 border-surface shadow-xl">
            <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=a' }} asChild>
              <Image source={{ uri: 'https://i.pravatar.cc/150?u=a' }} style={{ width: '100%', height: '100%' }} />
            </Avatar.Image>
            <Avatar.Fallback>A</Avatar.Fallback>
          </Avatar>
          <PressableFeedback className="absolute bottom-1 right-1 bg-accent p-2.5 rounded-full border-2 border-surface shadow-md">
            <IconSymbol name="pencil" size={18} color="white" />
          </PressableFeedback>
        </View>
        <AppText className="text-xl font-bold mt-4">Nguyễn Văn A</AppText>
        <View className="bg-surface px-4 py-1 rounded-full mt-2 border border-divider/10">
          <AppText className="text-muted text-sm font-medium">nguyenvana@email.com</AppText>
        </View>
      </View>

      <View className="px-6 gap-8 pb-10">
        {/* Account Section */}
        <View>
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">TÀI KHOẢN</AppText>
          <Card variant="default" className="overflow-hidden border border-divider/5">
            <SettingsItem icon="creditcard" iconBgColor="#17C964" label="Phương thức thanh toán" />
            <Divider className="my-3" />
            <SettingsItem icon="lock" iconBgColor="#F5A623" label="Đổi mật khẩu" />
            <Divider className="my-3" />
            <SettingsItem icon="shield" iconBgColor="#0070F3" label="Quyền riêng tư" />
          </Card>
        </View>

        {/* General Settings Section */}
        <View>
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">CÀI ĐẶT CHUNG</AppText>
          <Card variant="default" className="overflow-hidden border border-divider/5">
            <SettingsItem
              icon="moon.fill"
              iconBgColor="#3F3F46"
              label="Chế độ tối"
              showChevron={false}
              onPress={toggleTheme}
              rightElement={
                <Switch
                  isSelected={isDark}
                  className="w-[56px] h-[32px]"
                  animation={{
                    backgroundColor: {
                      value: ['#172554', '#eab308'],
                    },
                  }}
                >
                  <Switch.Thumb
                    className="size-[22px]"
                    animation={{
                      left: {
                        value: 4,
                        springConfig: {
                          damping: 30,
                          stiffness: 300,
                          mass: 1,
                        },
                      },
                    }}
                  />
                  <Switch.StartContent className="left-2">
                    {isDark && (
                      <Animated.View key="sun" entering={ZoomIn.springify()}>
                        <IconSymbol name="sunny" size={16} color="white" />
                      </Animated.View>
                    )}
                  </Switch.StartContent>
                  <Switch.EndContent className="right-2">
                    {!isDark && (
                      <Animated.View key="moon" entering={ZoomIn.springify()}>
                        <IconSymbol name="moon.fill" size={16} color="white" />
                      </Animated.View>
                    )}
                  </Switch.EndContent>
                </Switch>
              }
            />
            <Divider className="my-3" />
            <SettingsItem
              icon="bell"
              iconBgColor="#9455D3"
              label="Thông báo"
              showChevron={false}
              rightElement={
                <Switch isSelected={notifications} onSelectedChange={setNotifications}>
                  <Switch.Thumb />
                </Switch>
              }
            />
            <Divider className="my-3" />
            <SettingsItem
              icon="globe"
              iconBgColor="#17C964"
              label="Ngôn ngữ"
              rightElement={<AppText className="text-muted text-sm font-medium">Tiếng Việt</AppText>}
            />
          </Card>
        </View>

        {/* Support Section */}
        <View>
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">HỖ TRỢ & KHÁC</AppText>
          <Card variant="default" className="overflow-hidden border border-divider/5">
            <SettingsItem icon="heart" iconBgColor="#F31260" label="Mời bạn bè" />
            <Divider className="my-3" />
            <SettingsItem icon="questionmark.circle" iconBgColor="#0070F3" label="Trợ giúp" />
            <Divider className="my-3" />
            <SettingsItem icon="info.circle" iconBgColor="#06B6D4" label="Về chúng tôi" />
          </Card>
        </View>

        {/* Logout Button (Image 1) */}
        <View className="mt-4 gap-4 items-center">
          <Button variant="danger-soft" size="lg" className="w-full rounded-[24px]">
            <View className="flex-row items-center gap-2">
              <IconSymbol name="logout" size={20} color="#F31260" />
              <Button.Label className="font-bold">Đăng xuất</Button.Label>
            </View>
          </Button>
          <AppText className="text-muted text-xs font-medium opacity-60">Phiên bản 1.0.2 (Build 2024)</AppText>
        </View>
      </View>
    </ScreenScrollView>
  );
}
