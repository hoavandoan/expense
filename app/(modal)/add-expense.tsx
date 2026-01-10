import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EXPENSE_CATEGORIES } from "@/constants";
import { useCreateExpense, useGroup, useGroups } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  PressableFeedback,
  Select,
  Skeleton,
  TextField,
  useThemeColor,
  useToast,
} from "heroui-native";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";
import * as z from "zod";

const expenseSchema = z.object({
  groupId: z.string().min(1, "Vui lòng chọn nhóm"),
  paidById: z.string().min(1, "Vui lòng chọn người trả tiền"),
  participantIds: z
    .array(z.string())
    .min(1, "Vui lòng chọn ít nhất một người tham gia"),
  title: z.string().min(1, "Vui lòng nhập mô tả chi tiêu"),
  amount: z
    .string()
    .min(1, "Vui lòng nhập số tiền")
    .refine(
      (val) => {
        const num = parseInt(val.replace(/\D/g, ""));
        return num > 0;
      },
      { message: "Số tiền phải lớn hơn 0" }
    ),
  category: z.enum([
    "food",
    "transport",
    "shopping",
    "entertainment",
    "utilities",
    "other",
  ]),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface GroupOption {
  id: string;
  name: string;
  currency: string;
}

interface MemberOption {
  id: string;
  name: string;
  avatarUrl?: string;
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");
  const { toast } = useToast();

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
      currency: g.currency || "VND",
    }));
  }, [groups]);

  // Get initial groupId
  const initialGroupId =
    params.groupId || (groupOptions.length > 0 ? groupOptions[0].id : "");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      groupId: initialGroupId,
      paidById: user?.id || "",
      participantIds: [],
      title: "",
      amount: "",
      category: "food",
      notes: "",
    },
    mode: "onChange",
  });

  const selectedGroupId = watch("groupId");
  const amountValue = watch("amount");
  const participantIds = watch("participantIds");
  const paidById = watch("paidById");

  // Update groupId when groups load
  useEffect(() => {
    if (!params.groupId && groupOptions.length > 0 && !selectedGroupId) {
      setValue("groupId", groupOptions[0].id);
    }
  }, [groupOptions, params.groupId, selectedGroupId, setValue]);

  // Fetch group details for members
  const { data: currentGroupDetail } = useGroup(selectedGroupId || null);

  const currentGroup = useMemo(() => {
    if (currentGroupDetail) return currentGroupDetail as any;
    return groupOptions.find((g) => g.id === selectedGroupId);
  }, [groupOptions, selectedGroupId, currentGroupDetail]);

  const currency = currentGroup?.currency || "VND";

  // Get members
  const members: MemberOption[] = useMemo(() => {
    const groupData = currentGroupDetail as any;
    if (!groupData?.group_members) return [];
    return groupData.group_members.map((m: any) => ({
      id: m.user_id,
      name: m.user?.name || "Thành viên",
      avatarUrl: m.user?.avatar_url,
    }));
  }, [currentGroupDetail]);

  // Set default participantIds when members load
  useEffect(() => {
    if (members.length > 0 && participantIds.length === 0) {
      setValue(
        "participantIds",
        members.map((m) => m.id)
      );
    }
  }, [members, setValue, participantIds.length]);

  // Ensure paidById is valid when members change
  useEffect(() => {
    if (members.length > 0 && !members.find((m) => m.id === paidById)) {
      if (user && members.find((m) => m.id === user.id)) {
        setValue("paidById", user.id);
      } else {
        setValue("paidById", members[0].id);
      }
    }
  }, [members, paidById, setValue, user]);

  const totalAmount = parseInt(amountValue?.replace(/\D/g, "") || "0");
  const splitAmount =
    participantIds.length > 0
      ? Math.floor(totalAmount / participantIds.length)
      : 0;

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      const amount = parseInt(values.amount.replace(/\D/g, ""));
      const splitPerPerson = Math.floor(amount / values.participantIds.length);

      await createExpense.mutateAsync({
        groupId: values.groupId,
        paidById: values.paidById,
        title: values.title,
        amount,
        category: values.category,
        description: values.notes || undefined,
        splits: values.participantIds.map((userId) => ({
          userId,
          amount: splitPerPerson,
        })),
      });

      Alert.alert("Thành công", "Đã tạo khoản chi");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã có lỗi xảy ra");
    }
  };

  if (isLoadingGroups) {
    return (
      <View className="flex-1 bg-background p-6">
        <Skeleton className="w-full h-14 rounded-2xl mb-6" />
        <Skeleton className="w-2/3 h-16 rounded-2xl mb-4 self-center" />
        <Skeleton className="w-full h-32 rounded-2xl mb-6" />
      </View>
    );
  }

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
            onPress={() => router.replace("/(modal)/join-group")}
          >
            <Button.Label className="font-bold">Tham gia nhóm</Button.Label>
          </Button>
          <Button
            variant="primary"
            className="flex-1 h-14 rounded-2xl bg-accent"
            onPress={() => router.replace("/(modal)/add-group")}
          >
            <Button.Label className="font-bold text-white">
              Tạo nhóm mới
            </Button.Label>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView>
        {hasPreselectedGroup && currentGroup && (
          <View className="mb-6 p-4 bg-surface rounded-2xl border border-divider/10 mt-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center mr-4">
                <IconSymbol name="person.3.fill" size={24} color={accent} />
              </View>
              <View className="flex-1">
                <AppText className="font-bold text-base">
                  {currentGroup.name}
                </AppText>
                <AppText className="text-muted text-sm">
                  Thêm khoản chi mới
                </AppText>
              </View>
            </View>
          </View>
        )}

        {!hasPreselectedGroup && (
          <View className="mb-6 mt-4">
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              NHÓM
            </AppText>
            <Controller
              control={control}
              name="groupId"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={groupOptions.find((g) => g.id === value) || null}
                  onValueChange={(opt: any) => opt && onChange(opt.id || opt)}
                >
                  <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <IconSymbol
                        name="person.3.fill"
                        size={20}
                        color={accent}
                      />
                      <Select.Value
                        className="text-base font-medium"
                        placeholder="Chọn nhóm"
                      />
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={16}
                      color={muted}
                      className="rotate-90"
                    />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Overlay className="bg-black/20" />
                    <Select.Content
                      placement="bottom"
                      className="rounded-2xl bg-surface border border-divider/10"
                      width={300}
                    >
                      {groupOptions.map((group) => (
                        <Select.Item
                          key={group.id}
                          value={group.id}
                          label={group.name}
                          className="p-4"
                        >
                          <View className="flex-row items-center gap-3">
                            <IconSymbol
                              name="person.3.fill"
                              size={18}
                              color={accent}
                            />
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
              <AppText className="text-danger text-sm mt-1 ml-1">
                {errors.groupId.message}
              </AppText>
            )}
          </View>
        )}

        <View className="mb-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
            SỐ TIỀN
          </AppText>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!errors.amount}>
                <View className="justify-center">
                  <TextField.Input
                    placeholder="0"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    className="bg-surface border border-divider/10 h-16 rounded-2xl px-4 text-2xl font-bold text-center"
                  />
                  <View className="absolute right-4" pointerEvents="none">
                    <AppText className="text-muted text-xl font-bold">
                      {currency === "VND"
                        ? "₫"
                        : currency === "USD"
                        ? "$"
                        : "€"}
                    </AppText>
                  </View>
                </View>
                {errors.amount && (
                  <TextField.ErrorMessage className="ml-1 mt-1">
                    {errors.amount.message}
                  </TextField.ErrorMessage>
                )}
              </TextField>
            )}
          />
        </View>

        <View className="mb-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
            MÔ TẢ
          </AppText>
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
                {errors.title && (
                  <TextField.ErrorMessage className="ml-1 mt-1">
                    {errors.title.message}
                  </TextField.ErrorMessage>
                )}
              </TextField>
            )}
          />
        </View>

        <View className="mb-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
            PHÂN LOẠI
          </AppText>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Select
                value={EXPENSE_CATEGORIES.find((c) => c.value === value)!}
                onValueChange={(opt: any) => opt && onChange(opt.value || opt)}
              >
                <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center"
                      style={{
                        backgroundColor: EXPENSE_CATEGORIES.find(
                          (c) => c.value === value
                        )?.bg,
                      }}
                    >
                      <IconSymbol
                        name={
                          EXPENSE_CATEGORIES.find((c) => c.value === value)
                            ?.icon as any
                        }
                        size={18}
                        color={
                          EXPENSE_CATEGORIES.find((c) => c.value === value)
                            ?.color
                        }
                      />
                    </View>
                    <Select.Value
                      className="text-base font-medium"
                      placeholder="Chọn phân loại"
                    />
                  </View>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={muted}
                    className="rotate-90"
                  />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay className="bg-black/20" />
                  <Select.Content
                    placement="bottom"
                    className="rounded-2xl bg-surface border border-divider/10"
                    width={300}
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <Select.Item
                        key={category.value}
                        value={category.value}
                        label={category.label}
                        className="p-4"
                      >
                        <View className="flex-row items-center gap-3">
                          <View
                            className="w-8 h-8 rounded-lg items-center justify-center"
                            style={{ backgroundColor: category.bg }}
                          >
                            <IconSymbol
                              name={category.icon as any}
                              size={18}
                              color={category.color}
                            />
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

        <View className="mb-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
            NGƯỜI TRẢ TIỀN
          </AppText>
          <Controller
            control={control}
            name="paidById"
            render={({ field: { onChange, value } }) => {
              const selectedPayer = members.find((m) => m.id === value);
              const payerOptions = members.map((m) => ({
                value: m.id,
                label: m.id === user?.id ? "Bạn" : m.name,
                initial: m.name.charAt(0),
              }));
              const currentPayerOption = payerOptions.find(
                (p) => p.value === value
              );
              return (
                <Select
                  value={currentPayerOption}
                  onValueChange={(opt: any) => opt && onChange(opt.value)}
                >
                  <Select.Trigger className="h-14 border border-divider/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
                        <AppText className="font-bold text-accent text-sm">
                          {selectedPayer?.name?.charAt(0) || "?"}
                        </AppText>
                      </View>
                      <Select.Value
                        className="text-base font-medium"
                        placeholder="Chọn người trả"
                      />
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={16}
                      color={muted}
                      className="rotate-90"
                    />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Overlay className="bg-black/20" />
                    <Select.Content
                      placement="bottom"
                      className="rounded-2xl bg-surface border border-divider/10"
                      width={300}
                    >
                      {payerOptions.map((option) => (
                        <Select.Item
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          className="p-4"
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
                              <AppText className="font-bold text-accent text-sm">
                                {option.initial}
                              </AppText>
                            </View>
                            <Select.ItemLabel className="text-base" />
                          </View>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Portal>
                </Select>
              );
            }}
          />
        </View>

        <View className="mb-8">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
            CHIA CHO
          </AppText>
          <Card
            variant="default"
            className="rounded-2xl border border-divider/10 overflow-hidden bg-surface"
          >
            {members.map((member, index) => {
              const isSelected = participantIds.includes(member.id);
              return (
                <View key={member.id}>
                  <PressableFeedback
                    onPress={() => {
                      const newIds = isSelected
                        ? participantIds.filter((id) => id !== member.id)
                        : [...participantIds, member.id];
                      setValue("participantIds", newIds, {
                        shouldValidate: true,
                      });
                    }}
                    className="flex-row items-center p-4"
                  >
                    <Checkbox isSelected={isSelected} />
                    <Avatar size="sm" alt={member.name} className="ml-3 mr-3">
                      {member.avatarUrl ? (
                        <Avatar.Image
                          source={{ uri: member.avatarUrl }}
                          asChild
                        >
                          <Image
                            source={{ uri: member.avatarUrl }}
                            style={{ width: "100%", height: "100%" }}
                          />
                        </Avatar.Image>
                      ) : (
                        <Avatar.Fallback className="bg-accent/10">
                          <AppText className="font-bold text-accent">
                            {member.name.charAt(0)}
                          </AppText>
                        </Avatar.Fallback>
                      )}
                    </Avatar>
                    <View className="flex-1">
                      <AppText
                        className={`font-bold text-base ${
                          !isSelected ? "text-muted opacity-50" : ""
                        }`}
                      >
                        {member.id === user?.id ? "Bạn" : member.name}
                      </AppText>
                    </View>
                    {isSelected && totalAmount > 0 && (
                      <AppText className="font-bold text-accent mr-1">
                        {formatCurrency(splitAmount, currency)}
                      </AppText>
                    )}
                  </PressableFeedback>
                  {index < members.length - 1 && (
                    <View className="h-[1px] bg-divider/10 mx-4" />
                  )}
                </View>
              );
            })}
          </Card>
          {errors.participantIds && (
            <AppText className="text-danger text-sm mt-2 ml-1">
              {errors.participantIds.message}
            </AppText>
          )}
        </View>

        <View className="mb-6">
          <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
            GHI CHÚ (TÙY CHỌN)
          </AppText>
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

        <Button
          variant="primary"
          size="lg"
          className="rounded-2xl shadow-xl shadow-accent/20"
          onPress={handleSubmit(onSubmit)}
          isDisabled={
            createExpense.isPending || !isValid || participantIds.length === 0
          }
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
              {createExpense.isPending ? "Đang lưu..." : "Lưu khoản chi"}
            </Button.Label>
          </View>
        </Button>
      </ScreenScrollView>
    </View>
  );
}
