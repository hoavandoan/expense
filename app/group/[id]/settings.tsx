import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StickyHeader } from '@/components/ui/sticky-header';
import { useGroup, useLeaveGroup, useUpdateGroup } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Button, Card, PressableFeedback, Spinner, TextField, useThemeColor } from 'heroui-native';
import React, { useEffect, useState } from 'react';
import { Alert, Switch, View } from 'react-native';

export default function GroupSettingsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accent = useThemeColor('accent');
  const { user } = useAuthStore();

  const { data: group, isLoading } = useGroup(id as string);
  const updateGroup = useUpdateGroup();
  const leaveGroup = useLeaveGroup();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [simplifyDebts, setSimplifyDebts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if current user is owner
  const isOwner = (group as any)?.created_by === user?.id;

  useEffect(() => {
    if (group) {
      setGroupName(group.name || '');
      setDescription((group as any).description || '');
    }
  }, [group]);

  const handleSaveChanges = async () => {
    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Tên nhóm không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      await updateGroup.mutateAsync({
        groupId: id as string,
        name: groupName.trim(),
        description: description.trim() || undefined,
      });
      Alert.alert('Thành công', 'Đã cập nhật thông tin nhóm');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Rời khỏi nhóm',
      'Bạn có chắc chắn muốn rời khỏi nhóm này? Các khoản nợ của bạn sẽ vẫn được giữ lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời nhóm',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup.mutateAsync(id as string);
              router.replace('/(tabs)');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Xóa nhóm',
      'Bạn có chắc chắn muốn xóa nhóm này? Tất cả dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa nhóm',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('groups')
                .delete()
                .eq('id', id as string);

              if (error) throw error;
              router.replace('/(tabs)');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Spinner size="lg" color={accent} />
      </View>
    );
  }

  const coverImageUrl = (group as any)?.cover_image_url;

  return (
    <View className="flex-1 bg-background">
      <StickyHeader title="Cài đặt nhóm" />

      <ScreenScrollView>
        {/* Group Image */}
        <View className="items-center mb-8">
          <Avatar size="lg" alt="Group Image" className="mb-4 w-24 h-24">
            {coverImageUrl ? (
              <Avatar.Image source={{ uri: coverImageUrl }} asChild>
                <Image source={{ uri: coverImageUrl }} style={{ width: '100%', height: '100%' }} />
              </Avatar.Image>
            ) : (
              <Avatar.Fallback className="bg-accent/10">
                <IconSymbol name="person.3.fill" size={40} color={accent} />
              </Avatar.Fallback>
            )}
          </Avatar>
          <PressableFeedback>
            <AppText className="text-accent font-bold">Thay đổi ảnh nhóm</AppText>
          </PressableFeedback>
        </View>

        {/* Group Info */}
        <View className="mb-8">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">THÔNG TIN CHUNG</AppText>
          <Card className="p-4 rounded-2xl border border-divider/10 gap-4">
            <TextField className="bg-surface-secondary rounded-xl">
              <TextField.Label>Tên nhóm</TextField.Label>
              <TextField.Input
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Nhập tên nhóm"
              />
            </TextField>
            <TextField className="bg-surface-secondary rounded-xl">
              <TextField.Label>Mô tả</TextField.Label>
              <TextField.Input
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả về nhóm..."
              />
            </TextField>

            <Button
              variant="primary"
              className="h-12 rounded-xl bg-accent mt-2"
              onPress={handleSaveChanges}
              isDisabled={isSaving || !groupName.trim()}
            >
              <Button.Label className="font-bold text-white">
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button.Label>
            </Button>
          </Card>
        </View>

        {/* Options */}
        <View className="mb-8">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4 ml-1">TÙY CHỌN</AppText>
          <Card className="rounded-2xl border border-divider/10 overflow-hidden">
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <AppText className="font-bold text-base">Tối ưu hóa nợ</AppText>
                <AppText className="text-muted text-xs">Tự động đơn giản hóa các khoản nợ chéo trong nhóm</AppText>
              </View>
              <Switch
                value={simplifyDebts}
                onValueChange={setSimplifyDebts}
                trackColor={{ false: '#767577', true: accent }}
              />
            </View>
            <View className="h-px bg-divider/10 mx-4" />
            <PressableFeedback>
              <View className="p-4 flex-row items-center justify-between">
                <View>
                  <AppText className="font-bold text-base">Tiền tệ</AppText>
                  <AppText className="text-muted text-xs">VNĐ (đ)</AppText>
                </View>
                <IconSymbol name="chevron.right" size={20} color="gray" />
              </View>
            </PressableFeedback>
          </Card>
        </View>

        {/* Danger Zone */}
        <View className="gap-3 mb-10">
          {!isOwner && (
            <Button
              variant="secondary"
              size="lg"
              className="h-14 rounded-2xl bg-danger/10"
              onPress={handleLeaveGroup}
              isDisabled={leaveGroup.isPending}
            >
              <View className="flex-row items-center gap-2">
                <IconSymbol name="logout" size={20} color="#F31260" />
                <Button.Label className="text-danger font-bold">
                  {leaveGroup.isPending ? 'Đang xử lý...' : 'Rời khỏi nhóm'}
                </Button.Label>
              </View>
            </Button>
          )}

          {isOwner && (
            <Button
              variant="secondary"
              size="lg"
              className="h-14 rounded-2xl bg-danger/10"
              onPress={handleDeleteGroup}
            >
              <View className="flex-row items-center gap-2">
                <IconSymbol name="xmark.circle.fill" size={20} color="#F31260" />
                <Button.Label className="text-danger font-bold">Xóa nhóm</Button.Label>
              </View>
            </Button>
          )}
        </View>
      </ScreenScrollView>
    </View>
  );
}
