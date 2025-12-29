import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Card, cn, PressableFeedback, useThemeColor } from 'heroui-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const MOCK_MEMBERS = [
  { id: '1', name: 'Minh Anh', balance: -50000, avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Bình', balance: 150000, avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Chi', balance: -200000, avatarUrl: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Dũng', balance: 100000, avatarUrl: 'https://i.pravatar.cc/150?u=4' },
];

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor('accent');

  return (
    <ScreenScrollView className="bg-background">
      {/* Cover Image Header (Image 4) */}
      <View className="h-64 bg-surface-quaternary sticky">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View className="absolute inset-0 bg-black/30" />
        <View className="absolute top-12 left-6 right-6 flex-row items-center justify-between">
          <PressableFeedback
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30"
          >
            <IconSymbol name="chevron.left" size={24} color="white" />
          </PressableFeedback>
          <AppText className="text-white text-lg font-bold">Trip Đà Lạt</AppText>
          <PressableFeedback className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30">
            <IconSymbol name="settings" size={20} color="white" />
          </PressableFeedback>
        </View>
      </View>

      <View className="-mt-12 bg-background rounded-t-3xl px-6 pt-8">
        {/* Info Badges (Image 4) */}
        <View className="flex-row gap-3 mb-8">
          <View className="bg-surface-secondary px-4 py-2 rounded-full border border-divider/10">
            <AppText className="text-muted text-[10px] font-bold uppercase tracking-widest">THÀNH VIÊN: 4</AppText>
          </View>
          <View className="bg-success/10 px-4 py-2 rounded-full border border-success/20">
            <AppText className="text-success text-[10px] font-bold uppercase tracking-widest">BẠN NHẬN LẠI: 150K</AppText>
          </View>
        </View>

        {/* Stats Card (Image 4) */}
        <View className="mb-10">
          <Card variant="default"
            className="p-8 rounded-3xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: accent }}
          >
            <View className="flex-row gap-4">
              <View className="flex-1">
                <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">BẠN CHI</AppText>
                <AppText className="text-white text-2xl font-bold">1.250.000 đ</AppText>
              </View>
              <View className="w-px bg-white/20" />
              <View className="flex-1">
                <AppText className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">BẠN NHẬN LẠI</AppText>
                <AppText className="text-white text-2xl font-bold">150.000 đ</AppText>
              </View>
            </View>

            <View className="mt-8 flex-row gap-2">
              <PressableFeedback className="flex-1">
                <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                  <IconSymbol name="plus" size={20} color="white" />
                  <AppText className="text-white text-[10px] font-bold mt-1">CHI TIÊU</AppText>
                </View>
              </PressableFeedback>
              <PressableFeedback className="flex-1">
                <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                  <IconSymbol name="qrcode" size={20} color="white" />
                  <AppText className="text-white text-[10px] font-bold mt-1">THANH TOÁN</AppText>
                </View>
              </PressableFeedback>
              <PressableFeedback className="flex-1">
                <View className="bg-white/10 p-4 rounded-2xl items-center justify-center border border-white/10">
                  <IconSymbol name="chart.bar" size={20} color="white" />
                  <AppText className="text-white text-[10px] font-bold mt-1">BÁO CÁO</AppText>
                </View>
              </PressableFeedback>
            </View>
          </Card>
        </View>

        {/* Members List (Image 4) */}
        <View className="pb-10">
          <View className="flex-row items-center justify-between mb-6">
            <AppText className="text-xl font-bold">Thành viên nợ/trả</AppText>
            <PressableFeedback>
              <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={accent} />
            </PressableFeedback>
          </View>

          <View className="gap-3">
            {MOCK_MEMBERS.map((member) => (
              <Card key={member.id} variant="default" className="p-4 rounded-2xl border border-divider/5">
                <View className="flex-row items-center">
                  <Avatar size="md" alt={member.name} className="mr-4">
                    <Avatar.Image source={{ uri: member.avatarUrl }} />
                    <Avatar.Fallback>{member.name.charAt(0)}</Avatar.Fallback>
                  </Avatar>
                  <View className="flex-1">
                    <AppText className="font-bold text-base">{member.name}</AppText>
                    <AppText className="text-muted text-xs">Phần chia: 25%</AppText>
                  </View>
                  <View className="items-end">
                    <AppText className={cn(
                      'font-bold text-base',
                      member.balance >= 0 ? 'text-success' : 'text-danger'
                    )}>
                      {member.balance >= 0 ? `+${member.balance / 1000}k` : `-${Math.abs(member.balance) / 1000}k`}
                    </AppText>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </View>
    </ScreenScrollView>
  );
}
