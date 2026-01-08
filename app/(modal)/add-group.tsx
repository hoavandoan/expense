import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CURRENCIES, GROUP_TYPES } from '@/constants';
import { useCreateGroup } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { uploadImage } from '@/lib/utils/storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, PressableFeedback, Select, TextField, useThemeColor } from 'heroui-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';
import * as z from 'zod';

const groupSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên nhóm'),
  description: z.string().optional(),
  groupType: z.enum(['trip', 'home', 'couple', 'other']),
  currency: z.string().min(1, 'Vui lòng chọn tiền tệ'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function AddGroupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const createGroup = useCreateGroup();
  const accent = useThemeColor('accent');
  const muted = useThemeColor('muted');

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      groupType: 'trip',
      currency: 'VND',
    },
    mode: 'onChange',
  });


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (values: GroupFormValues) => {
    setIsUploading(true);
    try {
      let coverImageUrl = undefined;
      
      if (selectedImage && user?.id) {
        const fileName = `group-${Date.now()}`;
        coverImageUrl = await uploadImage(selectedImage, 'group-covers', `${user.id}/${fileName}`);
      }

      const newGroup = await createGroup.mutateAsync({
        name: values.name,
        description: values.description,
        groupType: values.groupType,
        currency: values.currency,
        coverImageUrl,
      });

      Alert.alert('Thành công', 'Đã tạo nhóm mới', [
        {
          text: 'OK',
          onPress: () => router.replace(`/group/${newGroup.id}` as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView>
        <View className="px-6 pb-10">
          {/* Image Upload */}
          <View className="items-center mb-10 pt-6">
            <PressableFeedback className='rounded-full' onPress={pickImage}>
              <View className="w-32 h-32 rounded-full border-2 border-dashed border-divider/20 items-center justify-center bg-surface-secondary overflow-hidden">
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View className="bg-accent/10 p-4 rounded-full">
                    <IconSymbol name="camera.fill" size={32} color={accent} />
                  </View>
                )}
              </View>
            </PressableFeedback>
            <PressableFeedback onPress={pickImage}>
              <AppText className="text-accent text-sm font-bold mt-4">
                {selectedImage ? 'Thay đổi ảnh nhóm' : 'Tải lên ảnh nhóm'}
              </AppText>
            </PressableFeedback>
          </View>

          {/* Group Info Input */}
          <View className="mb-10 gap-6">
            <View>
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">THÔNG TIN NHÓM</AppText>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextField isInvalid={!!errors.name}>
                    <TextField.Input
                      placeholder="Nhập tên nhóm (e.g. Ăn trưa Cty)"
                      value={value}
                      onChangeText={onChange}
                      className="bg-surface border border-divider/10 h-14 rounded-2xl px-4 text-base"
                    />
                    {errors.name && <TextField.ErrorMessage className="ml-1 mt-1">{errors.name.message}</TextField.ErrorMessage>}
                  </TextField>
                )}
              />
            </View>

            <View>
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">MÔ TẢ</AppText>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextField isInvalid={!!errors.description}>
                    <TextField.Input
                      placeholder="Mô tả ngắn gọn về nhóm..."
                      value={value}
                      onChangeText={onChange}
                      className="bg-surface border border-divider/10 h-14 rounded-2xl px-4 text-base"
                    />
                    {errors.description && <TextField.ErrorMessage className="ml-1 mt-1">{errors.description.message}</TextField.ErrorMessage>}
                  </TextField>
                )}
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">LOẠI NHÓM</AppText>
                <Controller
                  control={control}
                  name="groupType"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={GROUP_TYPES.find(t => t.value === value)!}
                      onValueChange={(opt) => opt && onChange(opt.value)}
                    >
                      <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <IconSymbol
                            name={GROUP_TYPES.find(t => t.value === value)?.icon as any}
                            size={20}
                            color={accent}
                          />
                          <Select.Value className="text-[15px] font-medium" placeholder="Loại nhóm" />
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={muted} className="rotate-90" />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Overlay className='bg-black/20' />
                        <Select.Content
                          placement="bottom"
                          className="rounded-2xl bg-surface border border-divider/10"
                          width={250}
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
                  )}
                />
              </View>

              <View className="flex-1">
                <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">TIỀN TỆ</AppText>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={CURRENCIES.find(c => c.value === value)!}
                      onValueChange={(opt) => opt && onChange(opt.value)}
                    >
                      <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <AppText className="font-bold text-accent text-lg">
                            {CURRENCIES.find(c => c.value === value)?.symbol}
                          </AppText>
                          <Select.Value className="text-[15px] font-medium" placeholder="Tiền tệ" />
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={muted} className="rotate-90" />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Overlay className='bg-black/20' />
                        <Select.Content
                          placement="bottom"
                          className="rounded-2xl bg-surface border border-divider/10"
                          width={250}
                        >
                          {CURRENCIES.map(curr => (
                            <Select.Item key={curr.value} value={curr.value} label={curr.label} className="p-4">
                              <View className="flex-row items-center gap-3">
                                <AppText className="font-bold text-accent text-lg w-6">{curr.symbol}</AppText>
                                <Select.ItemLabel className="text-base" />
                              </View>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Portal>
                    </Select>
                  )}
                />
              </View>
            </View>
          </View>

          {/* Current User as Owner */}
          <View className="mb-12">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest">THÀNH VIÊN (1)</AppText>
            </View>

            <Card variant="default" className="rounded-2xl overflow-hidden border border-divider/10 bg-surface-secondary/50">
              <View className="flex-row items-center p-4">
                <Avatar size="sm" alt={user?.name || 'Bạn'} className="mr-3">
                  {user?.avatarUrl ? (
                    <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
                      <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    </Avatar.Image>
                  ) : (
                    <Avatar.Fallback className="bg-accent/10">
                      <AppText className="font-bold text-accent">{user?.name?.charAt(0).toUpperCase() || 'B'}</AppText>
                    </Avatar.Fallback>
                  )}
                </Avatar>
                <View className="flex-1">
                  <AppText className="font-bold text-base">{user?.name || 'Bạn'}</AppText>
                  <AppText className="text-accent text-[10px] font-bold uppercase tracking-tighter">Chủ sở hữu</AppText>
                </View>
              </View>
            </Card>
            <AppText className="text-muted text-[11px] mt-4 text-center italic">
              Bạn có thể mời thêm bạn bè bằng Mã mời sau khi tạo nhóm
            </AppText>
          </View>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20"
            onPress={handleSubmit(onSubmit)}
            isDisabled={createGroup.isPending || isUploading || !isValid}
          >
            <View className="flex-row items-center gap-2">
              {(createGroup.isPending || isUploading) ? (
                <View className="animate-spin">
                  <IconSymbol name="gearshape.fill" size={20} color="white" />
                </View>
              ) : (
                <IconSymbol name="plus" size={20} color="white" />
              )}
              <Button.Label className="text-white font-bold text-lg">
                {(createGroup.isPending || isUploading) ? 'Đang khởi tạo...' : 'Khởi tạo nhóm'}
              </Button.Label>
            </View>
          </Button>
        </View>
      </ScreenScrollView>
    </View>
  );
}

