import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { FormSection } from "@/components/ui/form-section";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EXPENSE_CATEGORIES } from "@/constants";
import { useCreateExpense, useGroup, useGroups } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, uploadImage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Input,
  PressableFeedback,
  Select,
  Separator,
  Skeleton,
  TextField,
  useThemeColor,
  useToast
} from "heroui-native";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
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
    "gift",
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
  const success = useThemeColor("success");
  const danger = useThemeColor("danger");

  const { user } = useAuthStore();
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const createExpense = useCreateExpense();

  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const hasPreselectedGroup = !!params.groupId;

  // Transform groups for select
  const groupOptions = useMemo(() => {
    if (!groups) return [];
    return groups.map((g: any) => ({
      value: g.id,
      label: g.name,
      currency: g.currency || "VND",
    }));
  }, [groups]);

  // Get initial groupId
  const initialGroupId =
    params.groupId || (groupOptions.length > 0 ? groupOptions[0].value : "");

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
      setValue("groupId", groupOptions[0].value);
    }
  }, [groupOptions, params.groupId, selectedGroupId, setValue]);

  // Fetch group details for members
  const { data: currentGroupDetail } = useGroup(selectedGroupId || null);

  const currentGroup = useMemo(() => {
    if (currentGroupDetail) return currentGroupDetail as any;
    return groupOptions.find((g) => g.value === selectedGroupId);
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

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedReceipt(result.assets[0].uri);
    }
  };

  const removeReceipt = () => {
    setSelectedReceipt(null);
  };

  const toggleParticipant = (memberId: string) => {
    const isSelected = participantIds.includes(memberId);
    const newIds = isSelected
      ? participantIds.filter((id) => id !== memberId)
      : [...participantIds, memberId];
    setValue("participantIds", newIds, { shouldValidate: true });
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      setIsUploadingReceipt(true);
      let receiptUrl: string | undefined = undefined;

      // Upload receipt if selected
      if (selectedReceipt && user?.id) {
        const fileName = `receipt-${Date.now()}`;
        receiptUrl = await uploadImage(
          selectedReceipt,
          "receipts",
          `${user.id}/${fileName}`
        );
      }

      const amount = parseInt(values.amount.replace(/\D/g, ""));
      const participantCount = values.participantIds.length;
      const splitBase = Math.floor(amount / participantCount);
      const remainder = amount % participantCount;

      const splits = values.participantIds.map((userId, index) => ({
        userId,
        amount: index === 0 ? splitBase + remainder : splitBase,
      }));

      await createExpense.mutateAsync({
        groupId: values.groupId,
        paidById: values.paidById,
        title: values.title,
        amount,
        category: values.category,
        description: values.notes || undefined,
        receiptUrl,
        splits,
      });

      toast.show({
        label: "Thành công",
        description: "Khoản chi tiêu mới đã được thêm vào nhóm",
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: "OK",
        onActionPress: ({ hide }) => hide(),
      });
      router.back();
    } catch (error: any) {
      toast.show({
        label: "Lỗi tạo chi tiêu",
        description: error.message || "Đã có lỗi xảy ra khi lưu khoản chi mới",
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: "Thử lại",
        onActionPress: ({ hide }) => hide(),
      });
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  if (isLoadingGroups) {
    return (
      <View className="flex-1 bg-background p-6">
        <View className="animate-pulse">
          <Skeleton className="w-full h-12 rounded-2xl mb-6" />
          <Skeleton className="w-2/3 h-16 rounded-2xl mb-4 self-center" />
          <Skeleton className="w-full h-32 rounded-2xl mb-6" />
        </View>
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
            className="flex-1 h-12 rounded-2xl"
            onPress={() => router.replace("/(modal)/join-group")}
          >
            <Button.Label className="font-bold">Tham gia nhóm</Button.Label>
          </Button>
          <Button
            variant="primary"
            className="flex-1 h-12 rounded-2xl bg-accent"
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
      <ScreenScrollView withKeyboardAvoidingView>
        {hasPreselectedGroup && currentGroup && (
          <View className="mb-6 p-4 bg-surface rounded-2xl border border-border/10 mt-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center mr-4">
                <IconSymbol name="person.3.fill" size={24} color={accent} />
              </View>
              <View className="flex-1">
                <AppText className="font-bold text-base">
                  {currentGroup.label}
                </AppText>
                <AppText className="text-muted text-sm">
                  Thêm khoản chi mới
                </AppText>
              </View>
            </View>
          </View>
        )}

        <FormSection
          label="Nhóm"
          isRequired
          error={errors.groupId?.message}
          className={hasPreselectedGroup ? "hidden" : "mb-6 mt-4"}
        >
          <Controller
            control={control}
            name="groupId"
            render={({ field: { onChange, value } }) => (
              <Select
                value={groupOptions.find((g) => g.value === value) as any}
                onValueChange={(opt: any) => opt && onChange(opt.value)}
              >
                <Select.Trigger className="h-12 border border-border/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
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
                    presentation="popover"
                    className="rounded-2xl bg-surface border border-border/10"
                  >
                    {groupOptions.map((group) => (
                      <Select.Item
                        key={group.value}
                        value={group.value}
                        label={group.label}
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
        </FormSection>
        
        <FormSection
          label="Số tiền"
          isRequired
          error={errors.amount?.message}
        >
          <TextField isRequired isInvalid={!!errors.amount}>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <View className="justify-center">
                  <Input
                    placeholder="0"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    className="bg-surface h-16 rounded-2xl px-4 text-2xl font-bold text-center"
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
              )}
            />
          </TextField>
        </FormSection>

        <FormSection
          label="Mô tả"
          isRequired
          error={errors.title?.message}
        >
          <TextField isRequired isInvalid={!!errors.title}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Bạn đã chi cho việc gì? (e.g. Ăn trưa)"
                  value={value}
                  onChangeText={onChange}
                  className="bg-surface border border-border/10 h-12 rounded-2xl px-4 text-base"
                />
              )}
            />
          </TextField>
        </FormSection>

        <FormSection
          label="Phân loại"
          isRequired
          error={errors.category?.message}
        >
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Select
                value={EXPENSE_CATEGORIES.find((c) => c.value === value) as any}
                onValueChange={(opt: any) => opt && onChange(opt.value || opt)}
              >
                <Select.Trigger className="h-12 border border-border/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
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
                            ?.color as any
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
presentation="popover"
                    className="rounded-2xl bg-surface border border-border/10"
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
                              color={category.color as any}
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
        </FormSection>

        <FormSection
          label="Người trả"
          isRequired
          error={errors.paidById?.message}
        >
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
                  value={currentPayerOption as any}
                  onValueChange={(opt: any) => opt && onChange(opt.value)}
                >
                  <Select.Trigger className="h-12 border border-border/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
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
presentation="popover"                      className="rounded-2xl bg-surface border border-border/10"
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
        </FormSection>

        <FormSection
          label="Chia cho"
          isRequired
          error={errors.participantIds?.message}
          className="mb-8"
        >
          <Card className="rounded-2xl border border-border/10 overflow-hidden bg-surface">
            {members.map((member, index) => {
              const isSelected = participantIds.includes(member.id);
              return (
                <View key={member.id}>
                  <PressableFeedback
                    onPress={() => toggleParticipant(member.id)}
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
                    <Separator className="bg-border/10" />
                  )}
                </View>
              );
            })}
          </Card>
        </FormSection>

        <FormSection
          label="Ghi chú"
          error={errors.notes?.message}
        >
          <TextField isInvalid={!!errors.notes}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Ghi chú thêm về khoản chi này..."
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  className="bg-surface border border-border/10 rounded-2xl px-4 py-3 text-base min-h-[80px]"
                />
              )}
            />
          </TextField>
        </FormSection>

        <FormSection
          label="Ảnh hóa đơn"
        >
          {selectedReceipt ? (
            <Card className="rounded-2xl border border-border/10 overflow-hidden bg-surface">
              <View className="relative">
                <Image
                  source={{ uri: selectedReceipt }}
                  style={{ width: "100%", height: 200 }}
                  contentFit="cover"
                />
                <Button
                  onPress={removeReceipt}
                  variant="ghost"
                  isIconOnly
                  className="absolute top-2 right-2 bg-black/50 rounded-full size-8"
                >
                  <IconSymbol
                    name="xmark"
                    size={16}
                    color="white"
                  />
                </Button>
              </View>
              <PressableFeedback
                onPress={pickReceipt}
                className="p-4 border-t border-border/10"
              >
                <AppText className="text-accent text-center font-semibold">
                  Thay đổi ảnh
                </AppText>
              </PressableFeedback>
            </Card>
          ) : (
            <PressableFeedback onPress={pickReceipt}>
              <Card className="rounded-2xl border border-dashed border-border/20 bg-surface-secondary p-8 items-center justify-center">
                <View className="bg-accent/10 p-4 rounded-full mb-3">
                  <IconSymbol name="camera.fill" size={32} color={accent} />
                </View>
                <AppText className="text-accent font-semibold text-base">
                  Tải lên ảnh hóa đơn
                </AppText>
                <AppText className="text-muted text-xs mt-1">
                  Chụp hoặc chọn từ thư viện
                </AppText>
              </Card>
            </PressableFeedback>
          )}
        </FormSection>

        <Button
          variant="primary"
          size="lg"
          className="rounded-2xl shadow-xl shadow-accent/20"
          onPress={handleSubmit(onSubmit)}
          isDisabled={
            createExpense.isPending ||
            isUploadingReceipt ||
            !isValid ||
            participantIds.length === 0
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
              {createExpense.isPending || isUploadingReceipt
                ? isUploadingReceipt
                  ? "Đang tải ảnh..."
                  : "Đang lưu..."
                : "Lưu khoản chi"}
            </Button.Label>
          </View>
        </Button>
      </ScreenScrollView>
    </View>
  );
}
