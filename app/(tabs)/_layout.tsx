import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs, useRouter } from 'expo-router';
import { PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  const accent = useThemeColor('accent');
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: accent,
          headerShown: false,
          tabBarStyle: {
            height: 72,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            paddingBottom: 10,
            paddingTop: 10,
            position: 'absolute',
            bottom: 30,
            left: 20,
            right: 20,
            borderRadius: 36,
            shadowColor: '#000',
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
          name="plus"
          options={{
            title: '',
            tabBarButton: () => (
              <View className="flex-1 items-center justify-center">
                <PressableFeedback
                  onPress={() => router.push('/add-expense')}
                  className="w-16 h-16 rounded-full bg-accent items-center justify-center -mt-10 shadow-lg shadow-accent/40 border-4 border-background"
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
