import { AppText } from '@/components/app-text';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EXPENSE_CATEGORIES } from '@/constants';
import { useCreateExpense, useGroup, useGroups } from '@/lib/hooks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatCurrency } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, Button, Card, Select, Skeleton, TextField, useThemeColor } from 'heroui-native';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';
import * as z from 'zod';

const expenseSchema = z.object({
  groupId: z.string().min(1, 'Vui lòng chọn nhóm'),
  title: z.string().min(1, 'Vui lòng nhập mô tả chi tiêu'),
  amount: z.string().min(1, 'Vui lòng nhập số tiền').refine(
    (val) => {
      const num = parseInt(val.replace(/\D/g, ''));
      return num > 0;
    },
    { message: 'Số tiền phải lớn hơn 0' }
  ),
  category: z.enum(['food', 'transport', 'shopping', 'entertainment', 'utilities', 'other']),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface GroupOption {
  id: string;
  name: string;
  currency: string;
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const accent = useThemeColor('accent');
  const muted = useThemeColor('muted');

  const { user } = useAuthStore();
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const createExpense = useCreateExpense();

  const hasPreselectedGroup = !!params.groupId;

  // Transform groups for select
  const groupOptions: GroupOption[] = useMemo(() => {
    if (!groups) return [];
    return groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      currency: g.currency || 'VND',
    }));
  }, [groups]);

  // Get initial groupId
  const initialGroupId = params.groupId || (groupOptions.length > 0 ? groupOptions[0].id : '');

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      groupId: initialGroupId,
      title: '',
      amount: '',
      category: 'food',
      notes: '',
    },
    mode: 'onChange',
  });

  const selectedGroupId = watch('groupId');
  const amountValue = watch('amount');

  // Update groupId when groups load
  useEffect(() => {
    if (!params.groupId && groupOptions.length > 0 && !selectedGroupId) {
      setValue('groupId', groupOptions[0].id);
    }
  }, [groupOptions, params.groupId, selectedGroupId, setValue]);

  // Fetch group details for members
  const { data: currentGroupDetail } = useGroup(selectedGroupId || null);

  const currentGroup = useMemo(() => {
    if (currentGroupDetail) return currentGroupDetail as any;
    return groupOptions.find(g => g.id === selectedGroupId);
  }, [groupOptions, selectedGroupId, currentGroupDetail]);

  const currency = currentGroup?.currency || 'VND';

  // Get members for equal split
  const members = useMemo(() => {
    const groupData = currentGroupDetail as any;
    if (!groupData?.group_members) return [];
    return groupData.group_members.map((m: any) => ({
      id: m.user_id,
      name: m.user?.name || 'Thành viên',
    }));
  }, [currentGroupDetail]);

  const totalAmount = parseInt(amountValue?.replace(/\D/g, '') || '0');
  const splitAmount = members.length > 0 ? Math.floor(totalAmount / members.length) : 0;

  const onSubmit = async (values: ExpenseFormValues) => {
    if (members.length === 0) {
      Alert.alert('Lỗi', 'Không có thành viên trong nhóm');
      return;
    }

    try {
      const amount = parseInt(values.amount.replace(/\D/g, ''));
      const splitPerPerson = Math.floor(amount / members.length);

      await createExpense.mutateAsync({
        groupId: values.groupId,
        title: values.title,
        amount,
        category: values.category,
        description: values.notes || undefined,
        splits: members.map((m: { id: string }) => ({
          userId: m.id,
          amount: splitPerPerson,
        })),
      });

      Alert.alert('Thành công', 'Đã tạo khoản chi', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra');
    }
  };

  // Loading state
  if (isLoadingGroups) {
    return (
      <View className="flex-1 bg-background p-6">
        <Skeleton className="w-full h-14 rounded-2xl mb-6" />
        <Skeleton className="w-2/3 h-16 rounded-2xl mb-4 self-center" />
        <Skeleton className="w-full h-32 rounded-2xl mb-6" />
      </View>
    );
  }

  // Empty state - No groups
  if (!groups || groups.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <View className="bg-accent/10 p-6 rounded-full mb-6">
          <IconSymbol name="person.3.fill" size={48} color={accent} />
        </View>
        <AppText className="text-xl font-bold mb-2">Chưa có nhóm nào</AppText>
        <AppText className="text-muted text-center mb-8">
          Bạn cần tham gia hoặc tạo một nhóm trước khi thêm khoản chi tiêu
        </AppText>
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1 h-14 rounded-2xl"
            onPress={() => router.replace('/(modal)/join-group')}
          >
            <Button.Label className="font-bold">Tham gia nhóm</Button.Label>
          </Button>
          <Button
            variant="primary"
            className="flex-1 h-14 rounded-2xl bg-accent"
            onPress={() => router.replace('/(modal)/add-group')}
          >
            <Button.Label className="font-bold text-white">Tạo nhóm mới</Button.Label>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView>
        <View className="px-6 pb-10">
          {/* Group Header (when preselected) */}
          {hasPreselectedGroup && currentGroup && (
            <View className="mb-6 p-4 bg-surface rounded-2xl border border-divider/10 mt-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center mr-4">
                  <IconSymbol name="person.3.fill" size={24} color={accent} />
                </View>
                <View className="flex-1">
                  <AppText className="font-bold text-base">{currentGroup.name}</AppText>
                  <AppText className="text-muted text-sm">Thêm khoản chi mới</AppText>
                </View>
              </View>
            </View>
          )}

          {/* Group Selector (when NOT preselected) */}
          {!hasPreselectedGroup && (
            <View className="mb-6 mt-4">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">NHÓM</AppText>
              <Controller
                control={control}
                name="groupId"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={groupOptions.find(g => g.id === value) || null}
                    onValueChange={(opt: any) => opt && onChange(opt.id)}
                  >
                    <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <IconSymbol name="person.3.fill" size={20} color={accent} />
                        <Select.Value className="text-base font-medium" placeholder="Chọn nhóm" />
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
                        {groupOptions.map(group => (
                          <Select.Item key={group.id} value={group.id} label={group.name} className="p-4">
                            <View className="flex-row items-center gap-3">
                              <IconSymbol name="person.3.fill" size={18} color={accent} />
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
              {errors.groupId && (
                <AppText className="text-danger text-sm mt-1 ml-1">{errors.groupId.message}</AppText>
              )}
            </View>
          )}

          {/* Amount Input */}
          <View className="mb-6">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">SỐ TIỀN</AppText>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextField isInvalid={!!errors.amount}>
                  <TextField.Input
                    placeholder="0"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    className="bg-surface border border-divider/10 h-16 rounded-2xl px-4 text-2xl font-bold text-center"
                  >
                    <TextField.InputEndContent>
                      <AppText className="text-muted text-xl font-bold mr-2">
                        {currency === 'VND' ? '₫' : currency === 'USD' ? '$' : '€'}
                      </AppText>
                    </TextField.InputEndContent>
                  </TextField.Input>
                  {errors.amount && <TextField.ErrorMessage className="ml-1 mt-1">{errors.amount.message}</TextField.ErrorMessage>}
                </TextField>
              )}
            />
          </View>

          {/* Title Input */}
          <View className="mb-6">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">MÔ TẢ</AppText>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextField isInvalid={!!errors.title}>
                  <TextField.Input
                    placeholder="Bạn đã chi cho việc gì? (e.g. Ăn trưa)"
                    value={value}
                    onChangeText={onChange}
                    className="bg-surface border border-divider/10 h-14 rounded-2xl px-4 text-base"
                  />
                  {errors.title && <TextField.ErrorMessage className="ml-1 mt-1">{errors.title.message}</TextField.ErrorMessage>}
                </TextField>
              )}
            />
          </View>

          {/* Category Selector */}
          <View className="mb-6">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">PHÂN LOẠI</AppText>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={EXPENSE_CATEGORIES.find(c => c.value === value)!}
                  onValueChange={(opt) => opt && onChange(opt.value)}
                >
                  <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: EXPENSE_CATEGORIES.find(c => c.value === value)?.bg }}
                      >
                        <IconSymbol
                          name={EXPENSE_CATEGORIES.find(c => c.value === value)?.icon as any}
                          size={18}
                          color={EXPENSE_CATEGORIES.find(c => c.value === value)?.color}
                        />
                      </View>
                      <Select.Value className="text-base font-medium" placeholder="Chọn phân loại" />
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
                      {EXPENSE_CATEGORIES.map(category => (
                        <Select.Item
                          key={category.value}
                          value={category.value}
                          label={category.label}
                          className='p-4'
                        >
                          <View className="flex-row items-center gap-3">
                            <View
                              className="w-8 h-8 rounded-lg items-center justify-center"
                              style={{ backgroundColor: category.bg }}
                            >
                              <IconSymbol name={category.icon as any} size={18} color={category.color} />
                            </View>
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

          {/* Notes Input */}
          <View className="mb-6">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">GHI CHÚ (TÙY CHỌN)</AppText>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextField>
                  <TextField.Input
                    placeholder="Ghi chú thêm về khoản chi này..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    className="bg-surface border border-divider/10 rounded-2xl px-4 py-3 text-base min-h-[80px]"
                  />
                </TextField>
              )}
            />
          </View>

          {/* Paid By Section */}
          <View className="mb-6">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">NGƯỜI TRẢ TIỀN</AppText>
            <Card variant="default" className="rounded-2xl overflow-hidden border border-divider/10 bg-surface-secondary/50">
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
                  <AppText className="text-muted text-xs">Trả cho tất cả</AppText>
                </View>
              </View>
            </Card>
          </View>

          {/* Split Preview */}
          {members.length > 0 && totalAmount > 0 && (
            <View className="mb-8">
              <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                CHIA ĐỀU CHO {members.length} NGƯỜI
              </AppText>
              <Card variant="default" className="rounded-2xl border border-divider/10 p-4">
                <View className="flex-row items-center justify-between">
                  <AppText className="text-muted">Mỗi người trả</AppText>
                  <AppText className="font-bold text-lg text-accent">
                    {formatCurrency(splitAmount, currency)}
                  </AppText>
                </View>
              </Card>
            </View>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20"
            onPress={handleSubmit(onSubmit)}
            isDisabled={createExpense.isPending || !isValid || members.length === 0}
          >
            <View className="flex-row items-center gap-2">
              {createExpense.isPending ? (
                <View className="animate-spin">
                  <IconSymbol name="gearshape.fill" size={20} color="white" />
                </View>
              ) : (
                <IconSymbol name="plus" size={20} color="white" />
              )}
              <Button.Label className="text-white font-bold text-lg">
                {createExpense.isPending ? 'Đang lưu...' : 'Lưu khoản chi'}
              </Button.Label>
            </View>
          </Button>
        </View>
      </ScreenScrollView>
    </View>
  );
}
