import { AppText } from '@/components/app-text';
import {
  AnimatedScrollView,
  HeaderComponentWrapper,
  HeaderNavBar,
} from '@/components/parallax-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SettingsItem } from '@/components/ui/settings-item';
import { useAppTheme } from '@/contexts/app-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Avatar,
  Button,
  Card,
  Divider,
  PressableFeedback,
  Switch,
  useThemeColor,
} from 'heroui-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const { isLoggedIn, user, logout, setLoginSheetOpen } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const foreground = useThemeColor('foreground');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const SETTINGS_HEADER_HEIGHT = 360;

  const renderTopNavBarComponent = () => (
    <HeaderNavBar useBlur={true} className="border-b border-divider/5">
      <View className="flex-row items-center justify-between px-6 h-full">
        <PressableFeedback
          onPress={() => router.back()}
          className="w-8 h-8 rounded-full items-center justify-center"
        >
          <IconSymbol name="chevron.left" size={24} color={foreground} />
        </PressableFeedback>
        <AppText className="text-lg font-bold text-foreground">Cài đặt</AppText>
        <View className="w-8" />
      </View>
    </HeaderNavBar>
  );

  const renderHeaderComponent = () => (
    <HeaderComponentWrapper className="bg-background" useGradient={false}>
      {/* Initial Header Bar (Scrolls away) */}
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="px-6 pb-4 flex-row items-center justify-between"
      >
        <PressableFeedback
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center shadow-sm"
        >
          <IconSymbol name="chevron.left" size={20} color={foreground} />
        </PressableFeedback>
        <AppText className="text-lg font-bold">Cài đặt</AppText>
        <View className="w-10" />
      </View>

      {/* Profile Info */}
      <View className="items-center py-4">
        <View className="relative">
          <Avatar
            size="lg"
            alt={isLoggedIn ? user?.name || '' : 'Guest'}
            className="w-28 h-28 border-4 border-surface shadow-xl"
          >
            {isLoggedIn && user?.avatarUrl ? (
              <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                />
              </Avatar.Image>
            ) : (
              <Avatar.Fallback className="bg-accent/10">
                <IconSymbol name="person" size={40} color={useThemeColor('accent')} />
              </Avatar.Fallback>
            )}
          </Avatar>
          {isLoggedIn && (
            <PressableFeedback className="absolute bottom-0 right-0 bg-accent p-2 rounded-full border-2 border-surface shadow-md">
              <IconSymbol name="pencil" size={16} color="white" />
            </PressableFeedback>
          )}
        </View>
        <AppText className="text-xl font-bold mt-4">
          {isLoggedIn ? user?.name : 'Chưa đăng nhập'}
        </AppText>
        {isLoggedIn ? (
          <View className="bg-surface px-4 py-1 rounded-full mt-2 border border-divider/10">
            <AppText className="text-muted text-sm font-medium">{user?.email}</AppText>
          </View>
        ) : (
          <PressableFeedback onPress={() => setLoginSheetOpen(true)} className="mt-2">
            <AppText className="text-accent font-medium">Đăng nhập ngay để trải nghiệm</AppText>
          </PressableFeedback>
        )}
      </View>
    </HeaderComponentWrapper>
  );

  return (
    <View className="flex-1 bg-background">
      <AnimatedScrollView
        headerMaxHeight={SETTINGS_HEADER_HEIGHT}
        disableScale={true}
        renderTopNavBarComponent={renderTopNavBarComponent}
        renderHeaderComponent={renderHeaderComponent}
      >
        <View className="px-6 gap-8 pb-10 mt-6">
          {/* Pro Upgrade Card */}
          <PressableFeedback>
            <Card variant="default" className="bg-accent rounded-3xl p-5 border-0 shadow-xl shadow-accent/30 flex-row items-center overflow-hidden">
              <View className="flex-1">
                <View className="bg-white/20 px-2 py-0.5 rounded-full self-start mb-2">
                  <AppText className="text-white text-[10px] font-bold">PREMIUM</AppText>
                </View>
                <AppText className="text-white text-lg font-bold">Nâng cấp lên Pro</AppText>
                <AppText className="text-white/80 text-xs mt-1">Sử dụng không giới hạn nhóm và tính năng cao cấp</AppText>
              </View>
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                <IconSymbol name="chart.line.uptrend.xyv" size={24} color="white" />
              </View>
              <View className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
            </Card>
          </PressableFeedback>

          {/* Account Section */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              TÀI KHOẢN
            </AppText>
            <Card variant="default" className="overflow-hidden border border-divider/5">
              <SettingsItem
                icon="creditcard"
                iconBgColor="#17C964"
                label="Phương thức thanh toán"
              />
              <Divider className="my-3" />
              <SettingsItem icon="lock" iconBgColor="#F5A623" label="Đổi mật khẩu" />
              <Divider className="my-3" />
              <SettingsItem icon="shield" iconBgColor="#0070F3" label="Quyền riêng tư" />
            </Card>
          </View>

          {/* General Settings Section */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              CÀI ĐẶT CHUNG
            </AppText>
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
                rightElement={
                  <AppText className="text-muted text-sm font-medium">Tiếng Việt</AppText>
                }
              />
              <Divider className="my-3" />
              <SettingsItem
                icon="dongsign"
                iconBgColor="#F5A623"
                label="Tiền tệ"
                rightElement={
                  <AppText className="text-muted text-sm font-medium">VNĐ (₫)</AppText>
                }
              />
            </Card>
          </View>

          {/* Support Section */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              HỖ TRỢ & KHÁC
            </AppText>
            <Card variant="default" className="overflow-hidden border border-divider/5">
              <SettingsItem icon="heart" iconBgColor="#F31260" label="Mời bạn bè" />
              <Divider className="my-3" />
              <SettingsItem icon="questionmark.circle" iconBgColor="#0070F3" label="Trợ giúp" />
              <Divider className="my-3" />
              <SettingsItem icon="info.circle" iconBgColor="#06B6D4" label="Về chúng tôi" />
            </Card>
          </View>

          {/* Profile Edit Card */}
          {isLoggedIn && (
            <PressableFeedback onPress={() => router.push('/profile/edit')}>
              <Card className="flex-row items-center p-4 bg-surface rounded-3xl border border-divider/5">
                <Avatar size="lg" alt="User Profile">
                  <Avatar.Image source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=1' }} />
                </Avatar>
                <View className="flex-1 ml-4">
                  <AppText className="text-xl font-bold">{user?.name || 'Người dùng'}</AppText>
                  <AppText className="text-muted text-sm">{user?.email || 'user@example.com'}</AppText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="gray" />
              </Card>
            </PressableFeedback>
          )}

          {/* Auth Section */}
          <View className="mt-4 gap-4 items-center">
            {!isLoggedIn ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-[24px]"
                onPress={() => setLoginSheetOpen(true)}
              >
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="person" size={20} color="white" />
                  <Button.Label className="font-bold">Đăng nhập</Button.Label>
                </View>
              </Button>
            ) : (
              <Button
                variant="danger-soft"
                size="lg"
                className="w-full rounded-[24px]"
                onPress={logout}
              >
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="logout" size={20} color="#F31260" />
                  <Button.Label className="font-bold">Đăng xuất</Button.Label>
                </View>
              </Button>
            )}
            <AppText className="text-muted text-xs font-medium opacity-60">
              Phiên bản 1.0.2 (Build 2024)
            </AppText>
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}
