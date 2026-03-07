import { FAB } from '@/components/ui/fab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BlurView } from 'expo-blur';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useThemeColor } from 'heroui-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuthStore();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');
  const surface = useThemeColor('surface');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const border = useThemeColor('border');

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  const isIOS = Platform.OS === 'ios';
  const iosVersion = isIOS ? parseInt(Platform.Version as string, 10) : 0;
  const isModernIOS = isIOS && iosVersion >= 18;

  const renderTabBar = () => {
    if (isModernIOS) {
      return (
        <NativeTabs
          backgroundColor={accent}
          indicatorColor={accent}
          shadowColor={border}
          minimizeBehavior="onScrollDown"
        >
          <NativeTabs.Trigger name="index">
            <Icon
              sf={{ default: 'house', selected: 'house.fill' }}
              drawable="home_drawable"
              selectedColor={accent}
            />
            <Label>{t('tabs.home')}</Label>
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="activity">
            <Icon
              sf={{ default: 'clock', selected: 'clock.fill' }}
              drawable="activity_drawable"
              selectedColor={accent}
            />
            <Label>{t('tabs.activity')}</Label>
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="settings">
            <Icon
              sf={{ default: 'gear', selected: 'gearshape.fill' }}
              drawable="settings_drawable"
              selectedColor={accent}
            />
            <Label>{t('tabs.settings')}</Label>
          </NativeTabs.Trigger>
        </NativeTabs>
      );
    }

    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: foreground,
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            marginHorizontal: 24,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'transparent',
            elevation: 0,
            overflow: 'hidden',
          },
          tabBarItemStyle: {
            paddingHorizontal: 10,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={80}
              tint="default"
              style={StyleSheet.absoluteFill}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: t('tabs.activity'),
            tabBarIcon: ({ color }) => <IconSymbol name="clock.fill" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('tabs.settings'),
            tabBarIcon: ({ color }) => <IconSymbol name="gearshape.fill" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="plus"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  };

  return (
    <View className="flex-1 bg-background relative">
      {renderTabBar()}
      <FAB onPress={() => router.push('/add-expense')} />
    </View>
  );
}
