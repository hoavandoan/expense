import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { useLocalSearchParams } from 'expo-router';
import { Avatar, Button, Card, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

const MOCK_MEMBERS = [
  { id: '1', name: 'Bạn (Duy)', balance: 0, avatarUrl: 'https://i.pravatar.cc/150?u=1', status: 'Chủ nhóm' },
  { id: '2', name: 'Hương', balance: -50000, avatarUrl: 'https://i.pravatar.cc/150?u=2', status: 'Thành viên' },
  { id: '3', name: 'Minh', balance: 200000, avatarUrl: 'https://i.pravatar.cc/150?u=3', status: 'Thành viên' },
  { id: '4', name: 'Thành', balance: -150000, avatarUrl: 'https://i.pravatar.cc/150?u=4', status: 'Thành viên' },
  { id: '5', name: 'Lan', balance: 0, avatarUrl: 'https://i.pravatar.cc/150?u=5', status: 'Thành viên' },
];

export default function GroupMembersScreen() {
  const { id } = useLocalSearchParams();
  const accent = useThemeColor('accent');
  const foreground = useThemeColor('foreground');

  return (
    <View className="flex-1 bg-background">
      <StickyHeader
        title="Thành viên"
        rightContent={
          <PressableFeedback className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center">
            <IconSymbol name="person.badge.plus" size={20} color={accent} />
          </PressableFeedback>
        }
      />

      <ScreenScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mb-6">
          <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4 ml-1">DANH SÁCH THÀNH VIÊN (5)</AppText>
          <Card className="rounded-3xl border border-divider/5 overflow-hidden">
            {MOCK_MEMBERS.map((member, idx) => (
              <View key={member.id}>
                <View className="p-4 flex-row items-center">
                  <Avatar size="md" alt={member.name} className="mr-4">
                    <Avatar.Image source={{ uri: member.avatarUrl }} />
                  </Avatar>
                  <View className="flex-1">
                    <AppText className="font-bold text-base">{member.name}</AppText>
                    <AppText className="text-muted text-xs">{member.status}</AppText>
                  </View>
                  <View className="items-end">
                    <AppText className={`font-bold ${member.balance > 0 ? 'text-accent' : member.balance < 0 ? 'text-danger' : 'text-muted'}`}>
                      {member.balance === 0 ? 'Đã sòng phẳng' : `${member.balance > 0 ? '+' : ''}${member.balance.toLocaleString()}đ`}
                    </AppText>
                  </View>
                </View>
                {idx < MOCK_MEMBERS.length - 1 && <View className="h-px bg-divider/5 mx-4" />}
              </View>
            ))}
          </Card>
        </View>

        <Button
          variant="secondary"
          className="h-14 rounded-2xl border border-divider/10 bg-surface/5"
        >
          <View className="flex-row items-center gap-2">
            <IconSymbol name="link" size={18} color={foreground} />
            <Button.Label className="font-bold">Sao chép link mời</Button.Label>
          </View>
        </Button>
      </ScreenScrollView>
    </View>
  );
}
