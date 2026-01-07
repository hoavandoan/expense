import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ModalHeader } from '@/components/ui/modal-header';
import { useCreateGroup } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, PressableFeedback, Select, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function AddGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('trip');

  const { user } = useAuthStore();
  const createGroup = useCreateGroup();

  const accent = useThemeColor('accent');
  const muted = useThemeColor('muted');

  const GROUP_TYPES = [
    { value: 'trip', label: 'Chuyến đi', icon: 'airplane' },
    { value: 'home', label: 'Nhà cửa', icon: 'house.fill' },
    { value: 'couple', label: 'Cặp đôi', icon: 'heart.fill' },
    { value: 'other', label: 'Khác', icon: 'ellipsis.circle.fill' },
  ];

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm');
      return;
    }

    try {
      const newGroup = await createGroup.mutateAsync({
        name: groupName.trim(),
        description: description.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã tạo nhóm mới', [
        {
          text: 'OK',
          onPress: () => router.replace(`/group/${newGroup.id}` as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ModalHeader 
        title="Tạo nhóm mới"
        variant="close"
      />

      <ScreenScrollView>
        <View className="px-6 pt-6 pb-10">
          {/* Image Upload */}
          <View className="items-center mb-10">
            <PressableFeedback className='rounded-full'>
              <View className="w-32 h-32 rounded-full border-2 border-dashed border-divider/20 items-center justify-center bg-surface-secondary">
                <View className="bg-accent/10 p-4 rounded-full">
                  <IconSymbol name="camera.fill" size={32} color={accent} />
                </View>
              </View>
            </PressableFeedback>
            <AppText className="text-accent text-sm font-bold mt-4">Tải lên ảnh nhóm</AppText>
          </View>

          {/* Group Info Input */}
          <View className="mb-10 gap-6">
            <View>
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">THÔNG TIN NHÓM</AppText>
              <TextField>
                <TextField.Input
                  placeholder="Nhập tên nhóm (e.g. Ăn trưa Cty)"
                  value={groupName}
                  onChangeText={setGroupName}
                  className="bg-surface border border-divider/10 h-14 rounded-2xl px-4"
                />
              </TextField>
            </View>

            <View>
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">MÔ TẢ</AppText>
              <TextField>
                <TextField.Input
                  placeholder="Mô tả ngắn gọn về nhóm..."
                  value={description}
                  onChangeText={setDescription}
                  className="bg-surface border border-divider/10 h-14 rounded-2xl px-4"
                />
              </TextField>
            </View>

            <View>
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">LOẠI NHÓM</AppText>
              <Select
                value={GROUP_TYPES.find(t => t.value === groupType)!}
                onValueChange={(opt) => opt && setGroupType(opt.value)}
              >
                <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <IconSymbol
                      name={GROUP_TYPES.find(t => t.value === groupType)?.icon as any}
                      size={20}
                      color={accent}
                    />
                    <Select.Value className="text-base font-medium" placeholder="Chọn loại nhóm" />
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={muted} className="rotate-90" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay className='bg-black/20' />
                  <Select.Content
                    placement="bottom"
                    className="rounded-2xl bg-surface border border-divider/10"
                    width={300}
                  >
                    {GROUP_TYPES.map(type => (
                      <Select.Item key={type.value} value={type.value} label={type.label} className="p-4">
                        <View className="flex-row items-center gap-3">
                          <IconSymbol name={type.icon as any} size={18} color={accent} />
                          <Select.ItemLabel className="text-base" />
                        </View>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Portal>
              </Select>
            </View>
          </View>

          {/* Current User as Owner */}
          <View className="mb-12">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest">THÀNH VIÊN (1)</AppText>
            </View>

            <Card variant="default" className="rounded-2xl overflow-hidden border border-divider/10">
              <View className="flex-row items-center p-4">
                <Avatar size="sm" alt={user?.name || 'Bạn'} className="mr-3">
                  {user?.avatarUrl ? (
                    <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                      <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    </Avatar.Image>
                  ) : (
                    <Avatar.Fallback className="bg-accent/10">
                      <AppText className="font-bold text-accent">{user?.name?.charAt(0) || 'B'}</AppText>
                    </Avatar.Fallback>
                  )}
                </Avatar>
                <View className="flex-1">
                  <AppText className="font-bold text-base">{user?.name || 'Bạn'}</AppText>
                  <AppText className="text-accent text-[10px] font-bold">Trưởng nhóm</AppText>
                </View>
              </View>
            </Card>
            <AppText className="text-muted text-xs mt-3 text-center">
              Bạn có thể mời thêm thành viên sau khi tạo nhóm
            </AppText>
          </View>

          {/* Submit Button */}
          <Button 
            variant="primary" 
            size="lg" 
            className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20"
            onPress={handleCreateGroup}
            isDisabled={createGroup.isPending || !groupName.trim()}
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol name="plus" size={20} color="white" />
              <Button.Label className="text-white font-bold text-lg">
                {createGroup.isPending ? 'Đang tạo...' : 'Tạo nhóm'}
              </Button.Label>
            </View>
          </Button>
        </View>
      </ScreenScrollView>
    </View>
  );
}

