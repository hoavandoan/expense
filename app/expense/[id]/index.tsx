import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Button, Card, Divider, useThemeColor } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor('accent');

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Chi tiết chi tiêu" />

      <ScreenScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-6 items-center bg-surface border-b border-divider/5">
          <View className="w-16 h-16 rounded-2xl bg-accent-soft items-center justify-center mb-4">
            <IconSymbol name="fork.knife" size={32} color={accent} />
          </View>
          <AppText className="text-muted text-xs uppercase font-bold tracking-widest mb-1">Ăn uống</AppText>
          <AppText className="text-3xl font-bold mb-2">Ăn tối Gà nướng</AppText>
          <AppText className="text-2xl font-bold text-danger">450.000 đ</AppText>

          <View className="mt-6 flex-row items-center gap-2 bg-surface-secondary px-4 py-2 rounded-full">
            <Avatar size="sm" alt="Duy">
              <Avatar.Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} />
            </Avatar>
            <AppText className="text-xs font-medium">Trả bởi <AppText className="font-bold">Duy</AppText> • 10:30, Hôm nay</AppText>
          </View>
        </View>

        <View className="p-6">
          <View className="mb-8">
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4">MÔ TẢ</AppText>
            <AppText className="text-base text-foreground/80 leading-relaxed">
              Ăn tối tại quán Gà nướng Tam Nguyên. Bao gồm gà nướng, cơm lam và nước ngọt cho cả nhóm.
            </AppText>
          </View>

          <View className="mb-8">
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4">CHIA ĐỀU CHO 3 NGƯỜI</AppText>
            <Card className="rounded-3xl border border-divider/5 overflow-hidden">
              {[
                { name: 'Duy', amount: '150.000đ', status: 'Đã trả' },
                { name: 'Hương', amount: '150.000đ', status: 'Nợ 150k' },
                { name: 'Minh', amount: '150.000đ', status: 'Nợ 150k' },
              ].map((person, idx) => (
                <View key={idx}>
                  <View className="p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Avatar size="sm" alt={person.name} className="bg-surface-tertiary">
                        <AppText className="text-[10px] font-bold">{person.name[0]}</AppText>
                      </Avatar>
                      <AppText className="font-bold">{person.name}</AppText>
                    </View>
                    <View className="items-end">
                      <AppText className="font-bold">{person.amount}</AppText>
                      <AppText className="text-[10px] text-muted">{person.status}</AppText>
                    </View>
                  </View>
                  {idx < 2 && <Divider className="mx-4 opacity-10" />}
                </View>
              ))}
            </Card>
          </View>

          <View className="mb-8">
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-4">ẢNH HÓA ĐƠN</AppText>
            <Card className="h-60 rounded-3xl overflow-hidden bg-surface-secondary border border-divider/5">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1556742049-13da7339b7b7?q=80&w=400' }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </Card>
          </View>

          <View className="flex-row gap-3">
            <Button variant="secondary" className="flex-1 h-14 rounded-2xl bg-accent/10">
              <Button.Label className="text-accent font-bold">Chỉnh sửa</Button.Label>
            </Button>
            <Button variant="secondary" className="flex-1 h-14 rounded-2xl bg-danger/10">
              <Button.Label className="text-danger font-bold">Xóa</Button.Label>
            </Button>
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
}
