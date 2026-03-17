import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ModalHeader } from "@/components/ui/modal-header";
import { EXPENSE_CATEGORIES } from "@/constants";
import {
  useExpense,
  useGroup,
  useTranslation,
  useUpdateExpense,
} from "@/lib/hooks";
import {
  formatCurrency,
  parseFormattedNumber,
  uploadImage,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  FieldError,
  Input,
  Label,
  PressableFeedback,
  Select,
  Skeleton,
  Spinner,
  TextField,
  useThemeColor,
  useToast,
} from "heroui-native";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import * as z from "zod";

const getExpenseSchema = (t: any) => z.object({
  title: z.string().min(1, t('expense_edit.validation_title', { defaultValue: "Vui lòng nhập mô tả chi tiêu" })),
  amount: z
    .string()
    .min(1, t('expense_edit.validation_amount', { defaultValue: "Vui lòng nhập số tiền" }))
    .refine(
      (val) => {
        const num = parseInt(val.replace(/\D/g, ""));
        return num > 0;
      },
      { message: t('expense_edit.validation_amount_positive', { defaultValue: "Số tiền phải lớn hơn 0" }) }
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
  paidById: z.string().min(1, t('expense_edit.validation_payer', { defaultValue: "Vui lòng chọn người trả tiền" })),
  participantIds: z
    .array(z.string())
    .min(1, t('expense_edit.validation_participants', { defaultValue: "Vui lòng chọn ít nhất một người tham gia" })),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<ReturnType<typeof getExpenseSchema>>;

export default function EditExpenseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const muted = useThemeColor("muted");
  const accent = useThemeColor("accent");
  const success = useThemeColor("success");
  const danger = useThemeColor("danger");
  const { user } = useAuth();

  const { data: expense, isLoading } = useExpense(id as string);
  const expenseData = expense as any;
  const groupId = expenseData?.group_id || expenseData?.groupId;
  const { data: group } = useGroup(groupId);
  const updateExpense = useUpdateExpense();
  const { toast } = useToast();

  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const schema = useMemo(() => getExpenseSchema(t), [t]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      participantIds: [],
    },
    mode: "onChange",
  });

  const amountValue = watch("amount");
  const categoryValue = watch("category");
  const participantIds = watch("participantIds") || [];
  const paidById = watch("paidById");

  const members = useMemo(() => {
    if (!group?.group_members) return [];
    return group.group_members.map((m: any) => ({
      id: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatar_url,
    }));
  }, [group]);

  // Initialize form with expense data
  useEffect(() => {
    if (expense) {
      setValue("title", expense.title);
      setValue("amount", expense.amount.toString());
      setValue("paidById", expense.paidBy || (expense as any).paid_by);
      
      const currentParticipants = (expense as any).expense_splits?.map((s: any) => s.user_id) || [];
      setValue("participantIds", currentParticipants);

      const category = expense.category === "accommodation" ? "other" : expense.category;
      setValue(
        "category",
        category as
          | "food"
          | "transport"
          | "shopping"
          | "entertainment"
          | "utilities"
          | "gift"
          | "other"
      );
      setValue("notes", expense.description || "");
      if (expense.receiptUrl) {
        setSelectedReceipt(expense.receiptUrl);
      }
    }
  }, [expense, setValue]);

  const splitAmount = useMemo(() => {
    const totalAmount = parseFormattedNumber(amountValue || "0");
    const count = participantIds.length || 1;
    return Math.floor(totalAmount / count);
  }, [amountValue, participantIds]);

  const toggleParticipant = (memberId: string) => {
    const isSelected = participantIds.includes(memberId);
    const newIds = isSelected
      ? participantIds.filter((id) => id !== memberId)
      : [...participantIds, memberId];
    setValue("participantIds", newIds, { shouldValidate: true });
  };

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

  const onSubmit = async (values: ExpenseFormValues) => {
    if (!expense) return;

    try {
      setIsUploadingReceipt(true);
      let receiptUrl: string | undefined = undefined;

      // Upload receipt if a new one is selected and it's a local URI
      if (
        selectedReceipt &&
        selectedReceipt.startsWith("file://") &&
        user?.id
      ) {
        const fileName = `receipt-${Date.now()}`;
        receiptUrl = await uploadImage(
          selectedReceipt,
          "receipts",
          `${user.id}/${fileName}`
        );
      } else if (selectedReceipt && !selectedReceipt.startsWith("file://")) {
        // Keep existing receipt URL
        receiptUrl = selectedReceipt;
      } else if (!selectedReceipt) {
        // Remove receipt
        receiptUrl = undefined;
      }

      const amount = parseFormattedNumber(values.amount);
      const uniqueParticipantIds = Array.from(new Set(values.participantIds));
      const participantCount = uniqueParticipantIds.length;
      const splitBase = Math.floor(amount / participantCount);
      const remainder = amount % participantCount;

      const splits = uniqueParticipantIds.map((userId, index) => ({
        userId,
        amount: index === 0 ? splitBase + remainder : splitBase,
      }));

      await updateExpense.mutateAsync({
        expenseId: expense.id,
        groupId: expenseData.group_id || expense.groupId,
        title: values.title,
        amount,
        paidById: values.paidById,
        category: values.category as
          | "food"
          | "transport"
          | "shopping"
          | "entertainment"
          | "utilities"
          | "other"
          | "gift",
        description: values.notes || undefined,
        receiptUrl,
        splits,
      });

      toast.show({
        label: t('expense_edit.update_success_title', { defaultValue: "Đã cập nhật" }),
        description: t('expense_edit.update_success_desc', { defaultValue: "Thông tin chi tiêu đã được lưu thành công" }),
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: t('expense_edit.ok', { defaultValue: "OK" }),
        onActionPress: ({ hide }) => hide(),
      });
      router.back();
    } catch (error: any) {
      toast.show({
        label: t('expense_edit.update_error_title', { defaultValue: "Lỗi cập nhật" }),
        description: error.message || t('expense_edit.update_error_desc', { defaultValue: "Đã có lỗi xảy ra khi lưu thay đổi" }),
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: t('expense_edit.retry', { defaultValue: "Thử lại" }),
        onActionPress: ({ hide }) => hide(),
      });
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-6">
        <Skeleton className="w-full h-14 rounded-2xl mb-6" />
        <Skeleton className="w-2/3 h-16 rounded-2xl mb-4 self-center" />
        <Skeleton className="w-full h-32 rounded-2xl mb-6" />
      </View>
    );
  }

  if (!expense) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <AppText className="text-lg font-bold">
          {t('expense_edit.not_found', { defaultValue: "Không tìm thấy khoản chi" })}
        </AppText>
      </View>
    );
  }

  const currency = expenseData.group?.currency || "VND";

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title={t('expense_edit.title', { defaultValue: "Chỉnh sửa chi tiêu" })} variant="back" />

      <ScreenScrollView withKeyboardAvoidingView>
        <View className="p-6 gap-6">
          {/* Category Selection */}
          <TextField isRequired isInvalid={!!errors.category}>
            <Label className="mb-3 ml-1">{t('expense_edit.category', { defaultValue: "DANH MỤC" })}</Label>
            <View className="flex-row flex-wrap gap-3">
              {EXPENSE_CATEGORIES.map((category) => {
                const isSelected = categoryValue === category.value;
                return (
                  <PressableFeedback
                    key={category.value}
                    onPress={() => setValue("category", category.value, { shouldValidate: true })}
                  >
                    <Card
                      variant="default"
                      className={`p-4 rounded-2xl border ${
                        isSelected
                          ? "border-accent bg-accent/5"
                          : "border-border/10 bg-surface"
                      }`}
                    >
                      <View className="items-center gap-2">
                        <View
                          className={`w-12 h-12 rounded-xl items-center justify-center ${
                            isSelected ? category.bg : "bg-surface-secondary"
                          }`}
                        >
                          <IconSymbol
                            name={category.icon as any}
                            size={24}
                            color={isSelected ? category.color : muted}
                          />
                        </View>
                        <AppText
                          className={`text-xs font-semibold ${
                            isSelected ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {category.label}
                        </AppText>
                      </View>
                    </Card>
                  </PressableFeedback>
                );
              })}
            </View>
            {errors.category && (
              <FieldError className="ml-1 mt-1">
                {errors.category.message}
              </FieldError>
            )}
          </TextField>

          {/* Title */}
          <View>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextField isRequired isInvalid={!!errors.title}>
                  <Label className="mb-3 ml-1">{t('expense_edit.description_label', { defaultValue: "MÔ TẢ" })}</Label>
                  <Input
                    placeholder={t('expense_edit.description_placeholder', { defaultValue: "Nhập mô tả chi tiêu" })}
                    value={value}
                    onChangeText={onChange}
                    className="bg-surface border border-border/10 h-14 rounded-2xl px-4"
                    style={{ fontSize: 16 }}
                  />
                  {errors.title && (
                    <FieldError className="ml-1 mt-1">
                        {errors.title.message}
                    </FieldError>
                  )}
                </TextField>
              )}
            />
          </View>

          {/* Amount */}
          <View>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextField isRequired isInvalid={!!errors.amount}>
                  <Label className="mb-3 ml-1">{t('expense_edit.amount_label', { defaultValue: "SỐ TIỀN" })}</Label>
                  <View className="justify-center">
                    <Input
                      placeholder="0"
                      value={value}
                      onChangeText={(text: string) => {
                        const formatted = text.replace(/\D/g, "");
                        onChange(formatted);
                      }}
                      keyboardType="numeric"
                      className="bg-surface border border-border/10 h-14 rounded-2xl px-4 pr-16"
                      style={{ fontSize: 16 }}
                    />
                    <View className="absolute right-4 top-0 bottom-0 justify-center">
                      <AppText className="text-muted font-semibold">
                        {currency}
                      </AppText>
                    </View>
                  </View>
                  {errors.amount && (
                    <FieldError className="ml-1 mt-1">
                        {errors.amount.message}
                    </FieldError>
                  )}
                </TextField>
              )}
            />
            {amountValue && participantIds.length > 0 && (
              <AppText className="text-muted text-xs mt-1 ml-1">
                {t('expense_edit.split_equally', { amount: formatCurrency(splitAmount, currency), defaultValue: `Chia đều: ${formatCurrency(splitAmount, currency)} mỗi người` })}
              </AppText>
            )}
          </View>

          {/* Payer Selection */}
          <TextField isRequired isInvalid={!!errors.paidById}>
            <Label className="mb-3 ml-1">{t('expense_edit.payer_label', { defaultValue: "NGƯỜI TRẢ TIỀN" })}</Label>
            <Controller
              control={control}
              name="paidById"
              render={({ field: { onChange, value } }) => {
                const selectedPayer = members.find((m) => m.id === value);
                const payerOptions = members.map((m) => ({
                  value: m.id,
                  label: m.id === user?.id ? t('expense_edit.you', { defaultValue: "Bạn" }) : m.name,
                  initial: m.name.charAt(0),
                }));
                const currentPayerOption = payerOptions.find(
                  (p: { value: string }) => p.value === value
                );
                return (
                  <Select
                    value={currentPayerOption as any}
                    onValueChange={(opt: any) => opt && onChange(opt.value)}
                  >
                    <Select.Trigger className="h-14 border border-border/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
                          <AppText className="font-bold text-accent text-sm">
                            {selectedPayer?.name?.charAt(0) || "?"}
                          </AppText>
                        </View>
                        <Select.Value
                          className="text-base font-medium"
                          placeholder={t('expense_edit.select_payer', { defaultValue: "Chọn người trả" })}
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
                        placement="bottom"
                        className="rounded-2xl bg-surface border border-border/10"
                        width={300}
                      >
                        {payerOptions.map((option: { value: string; label: string; initial: string }) => (
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
          </TextField>

          {/* Participants Selection */}
          <TextField isRequired isInvalid={!!errors.participantIds}>
            <Label className="mb-3 ml-1">
              {t('expense_edit.participants_label', { count: participantIds.length, defaultValue: `NGƯỜI THAM GIA (${participantIds.length})` })}
            </Label>
            <Card className="rounded-2xl border border-border/10 bg-surface overflow-hidden">
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
                          {member.id === user?.id ? t('expense_edit.you', { defaultValue: "Bạn" }) : member.name}
                        </AppText>
                      </View>
                      {isSelected && amountValue && (
                        <AppText className="font-bold text-accent mr-1">
                          {formatCurrency(splitAmount, currency)}
                        </AppText>
                      )}
                    </PressableFeedback>
                    {index < members.length - 1 && (
                      <View className="h-[1px] bg-border/10 mx-4" />
                    )}
                  </View>
                );
              })}
            </Card>
            {errors.participantIds && (
              <FieldError className="ml-1 mt-1">
                {errors.participantIds.message}
              </FieldError>
            )}
          </TextField>

          {/* Notes */}
          <View>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextField>
                  <Label className="mb-3 ml-1">{t('expense_edit.notes_label', { defaultValue: "GHI CHÚ (TÙY CHỌN)" })}</Label>
                  <Input
                    placeholder={t('expense_edit.notes_placeholder', { defaultValue: "Thêm ghi chú..." })}
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    className="min-h-[100px] py-4 bg-surface border border-border/10 rounded-2xl px-4"
                    style={{ fontSize: 16 }}
                  />
                </TextField>
              )}
            />
          </View>

          {/* Receipt Upload */}
          <View>
            <AppText className="text-[12px] font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              {t('expense_edit.receipt_label', { defaultValue: "ẢNH HÓA ĐƠN (TÙY CHỌN)" })}
            </AppText>
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
                    {t('expense_edit.change_image', { defaultValue: "Thay đổi ảnh" })}
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
                    {t('expense_edit.upload_image', { defaultValue: "Tải lên ảnh hóa đơn" })}
                  </AppText>
                  <AppText className="text-muted text-xs mt-1">
                    {t('expense_edit.upload_desc', { defaultValue: "Chụp hoặc chọn từ thư viện" })}
                  </AppText>
                </Card>
              </PressableFeedback>
            )}
          </View>



          {/* Submit Button */}
          <Button
            size="lg"
            className="h-16 rounded-2xl bg-accent shadow-xl shadow-accent/20 mt-4"
            onPress={handleSubmit(onSubmit)}
            isDisabled={
              !isValid || updateExpense.isPending || isUploadingReceipt
            }
          >
            {updateExpense.isPending || isUploadingReceipt ? (
              <Spinner size="sm" color="white" />
            ) : (
              <Button.Label className="text-lg font-bold text-white">
                {t('expense_edit.save', { defaultValue: "Lưu thay đổi" })}
              </Button.Label>
            )}
          </Button>
        </View>
      </ScreenScrollView>
    </View>
  );
}
