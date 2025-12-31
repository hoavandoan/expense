import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs, useRouter } from 'expo-router';
import { PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const accent = useThemeColor('accent');
  const accentSoft = useThemeColor('accent-soft');
  const backgroundSecondary = useThemeColor('background-secondary');
  const foreground = useThemeColor('surface-foreground');
  const surface = useThemeColor('surface');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isIOS = Platform.OS === 'ios';

  return (
    <View className="flex-1 bg-background relative">
      {/* <NativeTabs
        backgroundColor={backgroundSecondary}
        indicatorColor={accentSoft}
        iconColor={foreground}
        shadowColor={accent}
        labelVisibilityMode='unlabeled'
        minimizeBehavior="onScrollDown"
      >
        <NativeTabs.Trigger name="index">
          {
            isIOS ? (
              <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="home_drawable" selectedColor={accent} />
            ) : (
              <Icon src={<VectorIcon family={MaterialIcons} name="home" />} selectedColor={accent} />
            )
          }
          <Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="plus" disableScrollToTop disablePopToTop role='more'>
          {
            isIOS ? (
              <Icon sf={{ default: 'plus', selected: 'plus' }} drawable="add_drawable" />
            ) : (
              <Icon src={<VectorIcon family={MaterialIcons} name="add" />} />
            )
          }
          <Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          {
            isIOS ? (
              <Icon sf={{ default: 'gear', selected: 'gear' }} drawable="settings_drawable" selectedColor={accent} />
            ) : (
              <Icon src={<VectorIcon family={MaterialIcons} name="settings" />} selectedColor={accent} />
            )
          }
          <Label hidden />
        </NativeTabs.Trigger>
      </NativeTabs> */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: accent,
          headerShown: false,
          tabBarStyle: {
            height: 72,
            backgroundColor: surface,
            borderTopWidth: 0,
            paddingBottom: 10,
            paddingTop: 10,
            position: 'absolute',
            bottom: insets.bottom,
            left: 20,
            right: 20,
            marginHorizontal: 20,
            borderRadius: 36,
            shadowColor: foreground,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="activity"
          options={{
            title: 'Hoạt động',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="plus"
          options={{
            title: '',
            tabBarButton: () => (
              <View className="flex-1 items-center justify-center">
                <PressableFeedback
                  onPress={() => router.push('/add-expense')}
                  className="w-16 h-16 rounded-full bg-accent items-center justify-center -mt-10 shadow-lg shadow-accent/60"
                >
                  <IconSymbol name="plus" size={32} color="white" />
                </PressableFeedback>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Cài đặt',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
