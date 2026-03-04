import { AppText } from "@/components/app-text";

import {
  AnimatedScrollView,
  HeaderComponentWrapper,
  HeaderNavBar,
} from "@/components/parallax-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SettingsItem } from "@/components/ui/settings-item";
import { SkiaOnboardingBackground } from "@/components/ui/skia-onboarding-background";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useAuth, useTranslation } from "@/lib/hooks";
import { useSettingsStore } from "@/lib/stores";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Divider,
  PressableFeedback,
  Switch,
  useThemeColor,
} from "heroui-native";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const { user, isAuthenticated, signOut, setLoginSheetOpen } = useAuth();
  const { t, locale } = useTranslation();
  const { language, setLanguage } = useSettingsStore();
  const { isDark, toggleTheme } = useAppTheme();
  const foreground = useThemeColor("foreground");
  const accent = useThemeColor("accent");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language'),
      '',
      [
        { text: t('settings.language_english'), onPress: () => setLanguage('en') },
        { text: t('settings.language_vietnamese'), onPress: () => setLanguage('vi') },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  const SETTINGS_HEADER_HEIGHT = 360;

  const renderTopNavBarComponent = () => (
    <HeaderNavBar useBlur={true} tint="light" intensity={80} className="border-b border-divider/10">
      <View className="flex-row items-center h-full w-full">
        <View className="flex-1 items-start">
          <Button
            isIconOnly
            variant="ghost"
            onPress={() => router.back()}
            className="w-10 h-10 bg-surface border border-white/10"
          >
            <IconSymbol name="chevron.left" size={24} color={foreground} />
          </Button>
        </View>
        <View className="flex-2 items-center">
          <AppText className="text-lg font-bold text-foreground">
            {t("settings.title")}
          </AppText>
        </View>
        <View className="flex-1 items-end" />
      </View>
    </HeaderNavBar>
  );

  const renderHeaderComponent = () => (
    <HeaderComponentWrapper className="bg-transparent" useGradient={false}>
      {/* Initial Header Bar (Scrolls away) */}
      <View
        style={{ paddingTop: insets.top + 16 }}
        className="px-6 pb-4 flex-row items-center justify-between"
      >
        <Button
          isIconOnly
          onPress={() => router.back()}
          className="w-10 h-10 bg-surface border border-white/10"
        >
          <IconSymbol name="chevron.left" size={20} color={foreground} />
        </Button>
        <AppText className="text-lg font-bold">{t("settings.title")}</AppText>
        <View className="w-10" />
      </View>

      {/* Profile Info */}
      <View className="items-center py-4">
        <View className="relative">
          <Avatar
            size="lg"
            alt={isAuthenticated ? user?.name || "" : "Guest"}
            className="w-28 h-28 border-4 border-surface shadow-xl"
          >
            {isAuthenticated && user?.avatarUrl ? (
              <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              </Avatar.Image>
            ) : (
              <Avatar.Fallback className="bg-accent/10">
                <IconSymbol name="person" size={40} color={accent} />
              </Avatar.Fallback>
            )}
          </Avatar>
          {isAuthenticated && (
            <PressableFeedback className="absolute bottom-0 right-0 bg-accent p-2 rounded-full border-2 border-surface shadow-md">
              <IconSymbol name="pencil" size={16} color="white" />
            </PressableFeedback>
          )}
        </View>
        <AppText className="text-xl font-bold mt-4">
          {isAuthenticated ? user?.name : t('settings.not_logged_in')}
        </AppText>
        {isAuthenticated ? (
          <View className="bg-surface px-4 py-1 rounded-full mt-2 border border-divider/10">
            <AppText className="text-muted text-sm font-medium">
              {user?.email}
            </AppText>
          </View>
        ) : (
          <PressableFeedback
            onPress={() => setLoginSheetOpen(true)}
            className="mt-2"
          >
            <AppText className="text-accent font-medium">
              {t('settings.login_prompt')}
            </AppText>
          </PressableFeedback>
        )}
      </View>
    </HeaderComponentWrapper>
  );

  return (
    <View className="flex-1 bg-background">
      <SkiaOnboardingBackground primaryColor="accent-soft" secondaryColor="background"/>
      <AnimatedScrollView
        headerMaxHeight={SETTINGS_HEADER_HEIGHT}
        disableScale={true}
        renderTopNavBarComponent={renderTopNavBarComponent}
        renderHeaderComponent={renderHeaderComponent}
      >
        <View className="px-6 gap-8 pb-10 mt-6">
          {/* Pro Upgrade Card */}
          <PressableFeedback>
            <Card
              variant="default"
              className="bg-accent rounded-2xl p-5 border-0 shadow-xl shadow-accent/30 flex-row items-center overflow-hidden"
            >
              <View className="flex-1">
                <View className="bg-white/20 px-2 py-0.5 rounded-full self-start mb-2">
                  <AppText className="text-white text-[10px] font-bold">
                    {t('settings.premium.badge')}
                  </AppText>
                </View>
                <AppText className="text-white text-lg font-bold">
                  {t('settings.premium.title')}
                </AppText>
                <AppText className="text-white/80 text-xs mt-1">
                  {t('settings.premium.description')}
                </AppText>
              </View>
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                <IconSymbol
                  name="chart.line.uptrend.xyv"
                  size={24}
                  color="white"
                />
              </View>
              <View className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
            </Card>
          </PressableFeedback>

          {/* Account Section */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              {t('settings.section.account')}
            </AppText>
            <Card
              variant="default"
              className="overflow-hidden border border-divider/10 rounded-2xl"
            >
              <SettingsItem
                icon="creditcard"
                iconBgColor="#17C964"
                label={t('settings.account.payment_method')}
              />
              <Divider className="my-3" />
              <SettingsItem
                icon="lock"
                iconBgColor="#F5A623"
                label={t('settings.account.change_password')}
              />
              <Divider className="my-3" />
              <SettingsItem
                icon="shield"
                iconBgColor="#0070F3"
                label={t('settings.account.privacy')}
              />
            </Card>
          </View>

          {/* General Settings Section */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              {t('settings.section.general')}
            </AppText>
            <Card
              variant="default"
              className="overflow-hidden border border-divider/10 rounded-2xl"
            >
              <SettingsItem
                icon="moon.fill"
                iconBgColor="#3F3F46"
                label={t('settings.general.dark_mode')}
                showChevron={false}
                onPress={toggleTheme}
                rightElement={
                  <Switch
                    isSelected={isDark}
                    className="w-[56px] h-8"
                    animation={{
                      backgroundColor: {
                        value: ["#172554", "#eab308"],
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
                          <IconSymbol
                            name="moon.fill"
                            size={16}
                            color="white"
                          />
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
                label={t('settings.general.notifications')}
                showChevron={false}
                rightElement={
                  <Switch
                    isSelected={notifications}
                    onSelectedChange={setNotifications}
                  >
                    <Switch.Thumb />
                  </Switch>
                }
              />
              <Divider className="my-3" />
              <SettingsItem
                icon="globe"
                iconBgColor="#17C964"
                label={t("settings.language")}
                onPress={handleLanguageChange}
                rightElement={
                  <AppText className="text-muted text-sm font-medium">
                    {locale.includes('vi') ? t('settings.language_vietnamese') : t('settings.language_english')}
                  </AppText>
                }
              />
              <Divider className="my-3" />
              <SettingsItem
                icon="dongsign"
                iconBgColor="#F5A623"
                label={t('settings.general.currency')}
                rightElement={
                  <AppText className="text-muted text-sm font-medium">
                    VNĐ (₫)
                  </AppText>
                }
              />
            </Card>
          </View>

          {/* Support Section */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              {t('settings.section.support')}
            </AppText>
            <Card
              variant="default"
              className="overflow-hidden border border-divider/10 rounded-2xl"
            >
              <SettingsItem
                icon="heart"
                iconBgColor="#F31260"
                label={t('settings.support.invite_friends')}
              />
              <Divider className="my-3" />
              <SettingsItem
                icon="questionmark.circle"
                iconBgColor="#0070F3"
                label={t('settings.support.help')}
              />
              <Divider className="my-3" />
              <SettingsItem
                icon="info.circle"
                iconBgColor="#06B6D4"
                label={t('settings.support.about_us')}
              />
            </Card>
          </View>

          {/* Auth Section */}
          <View className="mt-4 gap-4 items-center">
            {!isAuthenticated ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-2xl"
                onPress={() => setLoginSheetOpen(true)}
              >
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="person" size={20} color="white" />
                  <Button.Label className="font-bold">{t('settings.button.login')}</Button.Label>
                </View>
              </Button>
            ) : (
              <Button
                variant="danger-soft"
                size="lg"
                className="w-full rounded-2xl"
                onPress={signOut}
              >
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="logout" size={20} color="#F31260" />
                  <Button.Label className="font-bold">{t("settings.logout")}</Button.Label>
                </View>
              </Button>
            )}
            <AppText className="text-muted text-xs font-medium opacity-60">
              {t('settings.version')}
            </AppText>
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}
