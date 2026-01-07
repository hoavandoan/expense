import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useJoinGroup } from '@/lib/hooks';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Button, Divider, PressableFeedback, TextField } from 'heroui-native';
import React, { useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JoinGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [inviteCode, setInviteCode] = useState('');
  const joinGroup = useJoinGroup();

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      // Extract invite code from URL if pasted
      const codeMatch = text.match(/invite\/([A-Z0-9]+)/i);
      setInviteCode(codeMatch ? codeMatch[1].toUpperCase() : text.toUpperCase());
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã mời hoặc liên kết');
      return;
    }

    try {
      const groupId = await joinGroup.mutateAsync(inviteCode.trim());
      Alert.alert('Thành công', 'Đã tham gia nhóm', [
        {
          text: 'OK',
          onPress: () => router.replace(`/group/${groupId}` as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Mã mời không hợp lệ');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-10">
          <AppText className="text-3xl font-bold mb-3">Quét mã QR</AppText>
          <AppText className="text-muted text-center leading-relaxed text-base">
            Di chuyển camera đến mã QR của nhóm để{"\n"}tham gia ngay lập tức.
          </AppText>
        </View>

        {/* QR Scanner Mock */}
        <View className="aspect-square w-full rounded-2xl overflow-hidden bg-black/95 relative shadow-2xl mb-12">
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-64 h-64 border-2 border-accent rounded-3xl" style={{ borderStyle: 'dashed' }} />
            <View className="absolute w-full h-1 bg-accent/50" style={{ top: '50%' }} />
          </View>

          {/* Corner Markers */}
          <View className="absolute top-12 left-12 w-10 h-10 border-t-4 border-l-4 border-accent rounded-tl-2xl" />
          <View className="absolute top-12 right-12 w-10 h-10 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
          <View className="absolute bottom-12 left-12 w-10 h-10 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
          <View className="absolute bottom-12 right-12 w-10 h-10 border-b-4 border-r-4 border-accent rounded-br-2xl" />

          <View className="absolute bottom-12 w-full flex-row justify-center gap-8">
            <View className="items-center">
              <PressableFeedback>
                <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20">
                  <IconSymbol name="photo.on.rectangle" size={24} color="white" />
                </View>
              </PressableFeedback>
              <AppText className="text-white text-[10px] text-center mt-2 font-bold uppercase">Thư viện</AppText>
            </View>
            <View className="items-center">
              <PressableFeedback>
                <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center border border-white/20">
                  <IconSymbol name="flashlight.on.fill" size={24} color="white" />
                </View>
              </PressableFeedback>
              <AppText className="text-white text-[10px] text-center mt-2 font-bold uppercase">Đèn flash</AppText>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-4 mb-8">
          <Divider className="flex-1 bg-divider/10" />
          <AppText className="text-muted font-bold text-xs tracking-widest uppercase">HOẶC</AppText>
          <Divider className="flex-1 bg-divider/10" />
        </View>

        <View className="mb-8">
          <AppText className="text-xl font-bold mb-2">Nhập mã hoặc liên kết</AppText>
          <AppText className="text-sm text-muted mb-6">
            Sử dụng mã nhóm hoặc dán liên kết mời
          </AppText>

          <View className="flex-row gap-2">
            <TextField className="flex-1 h-16 bg-surface border border-divider/10 rounded-2xl px-4">
              <TextField.InputStartContent>
                <IconSymbol name="link" size={18} color="gray" />
              </TextField.InputStartContent>
              <TextInput
                placeholder="Mã hoặc liên kết mời"
                className="flex-1 ml-2 text-foreground"
                placeholderTextColor="gray"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                autoCapitalize="characters"
              />
              <TextField.InputEndContent>
                <PressableFeedback
                  className="bg-surface-secondary px-4 py-2 rounded-xl border border-divider/10 shadow-sm"
                  onPress={handlePaste}
                >
                  <View className="flex-row items-center gap-1.5">
                    <IconSymbol name="doc.on.clipboard" size={14} color="gray" />
                    <AppText className="text-xs font-bold">Dán</AppText>
                  </View>
                </PressableFeedback>
              </TextField.InputEndContent>
            </TextField>
          </View>
        </View>

        <Button
          size="lg"
          className="h-16 rounded-2xl bg-accent shadow-lg"
          onPress={handleJoinGroup}
          isDisabled={joinGroup.isPending || !inviteCode.trim()}
        >
          <View className="flex-row items-center gap-2">
            <AppText className="font-bold text-lg text-white">
              {joinGroup.isPending ? 'Đang tham gia...' : 'Tham gia nhóm'}
            </AppText>
            <IconSymbol name="arrow.right.to.line" size={20} color="white" />
          </View>
        </Button>

        <PressableFeedback className="mt-8 self-center">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="questionmark.circle" size={18} color="gray" />
            <AppText className="text-muted font-medium">Làm thế nào để tìm mã QR?</AppText>
          </View>
        </PressableFeedback>
      </ScrollView>
    </View>
  );
}

