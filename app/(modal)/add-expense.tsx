import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EXPENSE_CATEGORIES } from "@/constants";
import { useAuth } from '@/contexts/auth-context';
import { useCreateExpense, useGroup, useGroups, useTranslation } from "@/lib/hooks";
import { formatCurrency, formatNumber, uploadImage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  ControlField,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  PressableFeedback,
  Select,
  Skeleton,
  TextArea,
  TextField,
  useThemeColor,
  useToast
} from "heroui-native";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import * as z from "zod";

const AMOUNT_MAX = 1_000_000_000;
const AMOUNT_MIN_VND = 1_000;
const AMOUNT_MIN_OTHER = 1;

const getExpenseSchema = (t: any, currency: string) => z.object({
  groupId: z.string().min(1, t("modal.add_expense.errors.group_required")),
  paidById: z.string().min(1, t("modal.add_expense.errors.payer_required")),
  participantIds: z
    .array(z.string())
    .min(1, t("modal.add_expense.errors.participants_required")),
  title: z.string().min(1, t("modal.add_expense.errors.title_required")),
  amount: z
    .string()
    .min(1, t("modal.add_expense.errors.amount_required"))
    .refine(
      (val) => {
        const num = parseInt(val.replace(/\D/g, ""));
        return num > 0;
      },
      { message: t("modal.add_expense.errors.amount_min") }
    )
    .refine(
      (val) => {
        const num = parseInt(val.replace(/\D/g, ""));
        const minAmount = currency === "VND" ? AMOUNT_MIN_VND : AMOUNT_MIN_OTHER;
        return num >= minAmount;
      },
      {
        message: t("modal.add_expense.errors.amount_min_value", {
          amount: formatCurrency(
            currency === "VND" ? AMOUNT_MIN_VND : AMOUNT_MIN_OTHER,
            currency
          ),
        }),
      }
    )
    .refine(
      (val) => {
        const num = parseInt(val.replace(/\D/g, ""));
        return num <= AMOUNT_MAX;
      },
      {
        message: t("modal.add_expense.errors.amount_max", {
          amount: formatCurrency(AMOUNT_MAX, currency),
        }),
      }
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

type ExpenseFormValues = z.infer<ReturnType<typeof getExpenseSchema>>;

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

  const { t } = useTranslation();
  const { user } = useAuth();
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

  const currencyRef = React.useRef("VND");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ExpenseFormValues>({
    resolver: (values, context, options) => {
      const schema = getExpenseSchema(t, currencyRef.current);
      return zodResolver(schema)(values, context, options);
    },
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

  // Reset form when group changes
  const hasInitializedParticipants = React.useRef(false);
  const previousGroupIdRef = React.useRef(selectedGroupId);
  useEffect(() => {
    if (previousGroupIdRef.current && previousGroupIdRef.current !== selectedGroupId) {
      reset({
        groupId: selectedGroupId,
        paidById: user?.id || "",
        participantIds: [],
        title: "",
        amount: "",
        category: "food",
        notes: "",
      });
      hasInitializedParticipants.current = false;
    }
    previousGroupIdRef.current = selectedGroupId;
  }, [selectedGroupId, reset, user?.id]);

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

  // Keep currencyRef in sync for the dynamic resolver
  currencyRef.current = currency;

  // Get members
  const members: MemberOption[] = useMemo(() => {
    const groupData = currentGroupDetail as any;
    if (!groupData?.group_members) return [];
    return groupData.group_members.map((m: any) => ({
      id: m.user_id,
      name: m.user?.name || t("activity.someone"),
      avatarUrl: m.user?.avatar_url,
    }));
  }, [currentGroupDetail, t]);

  // Set default participantIds when members load
  useEffect(() => {
    if (members.length > 0 && !hasInitializedParticipants.current) {
      hasInitializedParticipants.current = true;
      setValue(
        "participantIds",
        members.map((m) => m.id)
      );
    }
  }, [members, setValue]);

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
      let receiptUrl: string | undefined = undefined;

      // Upload receipt if selected
      if (selectedReceipt && user?.id) {
        setIsUploadingReceipt(true);
        const fileName = `receipt-${Date.now()}`;
        receiptUrl = await uploadImage(
          selectedReceipt,
          "receipts",
          `${user.id}/${fileName}`
        );
        setIsUploadingReceipt(false);
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
        label: t("modal.add_expense.success_title"),
        description: t("modal.add_expense.success_desc"),
        variant: "success",
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: "OK",
        onActionPress: ({ hide }) => hide(),
      });
      router.back();
    } catch (error: any) {
      toast.show({
        label: t("modal.add_expense.error_title"),
        description: error.message || t("modal.add_expense.error_desc"),
        variant: "danger",
        icon: <IconSymbol name="xmark.circle.fill" size={20} color={danger} />,
        actionLabel: t("common.retry"),
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
        <AppText className="text-xl font-bold mb-2">{t("modal.add_expense.no_group_title")}</AppText>
        <AppText className="text-muted text-center mb-8">
          {t("modal.add_expense.no_group_desc")}
        </AppText>
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1 h-12 rounded-2xl"
            onPress={() => router.replace("/(modal)/join-group")}
          >
            <Button.Label className="font-bold">{t("modal.add_expense.btn_join_group")}</Button.Label>
          </Button>
          <Button
            variant="primary"
            className="flex-1 h-12 rounded-2xl bg-accent"
            onPress={() => router.replace("/(modal)/add-group")}
          >
            <Button.Label className="font-bold text-white">
              {t("modal.add_expense.btn_create_group")}
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
          <View className="mb-6 p-2 bg-surface rounded-2xl border border-border/10 shadow-sm">
            <View className="flex-row items-center">
              <View className="size-10 rounded-xl bg-accent/10 items-center justify-center mr-4">
                <IconSymbol name="person.3.fill" size={24} color={accent} />
              </View>
              <View className="flex-1">
                <AppText className="font-bold text-base">
                  {currentGroup.name}
                </AppText>
              </View>
            </View>
          </View>
        )}

        <View className="gap-4">
          <TextField
            isRequired
            isInvalid={!!errors.groupId}
            className={hasPreselectedGroup ? "hidden" : "mt-4"}
          >
            <Label>{t("modal.add_expense.group_label")}</Label>
            <Controller
              control={control}
              name="groupId"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={groupOptions.find((g) => g.value === value) as any}
                  onValueChange={(opt: any) => opt && onChange(opt.value)}
                >
                  <Select.Trigger>
                    <View className="flex-row items-center gap-3">
                      <IconSymbol
                        name="person.3.fill"
                        size={20}
                        color={accent}
                      />
                      <Select.Value
                        className="text-base font-medium"
                        placeholder={t("modal.add_expense.group_placeholder")}
                      />
                      <Select.TriggerIndicator />
                    </View>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Overlay className="bg-black/20" />
                    <Select.Content
                      presentation="popover"
                      placement="bottom"
                      width={300}
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
                            <Select.ItemIndicator />
                          </View>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Portal>
                </Select>
              )}
            />
            <FieldError>{errors.groupId?.message}</FieldError>
          </TextField>

          <TextField
            isRequired
            isInvalid={!!errors.amount}
          >
            <Label>{t("modal.add_expense.amount_label")}</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => {
                const handleAmountChange = (text: string) => {
                  const digits = text.replace(/\D/g, "");
                  if (!digits) {
                    onChange("");
                    return;
                  }
                  const numericValue = parseInt(digits, 10);
                  if (numericValue > AMOUNT_MAX) return;
                  onChange(formatNumber(numericValue));
                }

                return (
                  <InputGroup>
                    <InputGroup.Input
                      placeholder="0"
                      value={value}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                      className="bg-surface h-16 rounded-2xl px-4 text-2xl font-bold text-center"
                      style={{ fontSize: 24 }}
                    />
                    <InputGroup.Suffix isDecorative className="mr-4">
                      <AppText className="text-muted text-xl font-bold">
                        {currency === "VND"
                          ? "₫"
                          : currency === "USD"
                            ? "$"
                            : "€"}
                      </AppText>
                    </InputGroup.Suffix>
                  </InputGroup>
                );
              }}
            />
            <FieldError>{errors.amount?.message}</FieldError>
          </TextField>

          <TextField
            isRequired
            isInvalid={!!errors.title}
          >
            <Label>{t("modal.add_expense.desc_label")}</Label>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t("modal.add_expense.desc_placeholder")}
                  value={value}
                  onChangeText={onChange}
                  style={{ fontSize: 16 }}
                />
              )}
            />
            <FieldError>{errors.title?.message}</FieldError>
          </TextField>

          <TextField
            isRequired
            isInvalid={!!errors.category}
          >
            <Label>{t("modal.add_expense.category_label")}</Label>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={EXPENSE_CATEGORIES.find((c) => c.value === value) as any}
                  onValueChange={(opt: any) => opt && onChange(opt.value || opt)}
                >
                  <Select.Trigger >
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
                        placeholder={t("modal.add_expense.category_placeholder")}
                      />
                      <Select.TriggerIndicator />

                    </View>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Overlay className="bg-black/20" />
                    <Select.Content
                      presentation="popover"
                      placement="bottom"
                      width={300}
                    >
                      {EXPENSE_CATEGORIES.map((category) => (
                        <Select.Item
                          key={category.value}
                          value={category.value}
                          label={category.label}
                        >
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
                          <Select.ItemLabel />
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Portal>
                </Select>
              )}
            />
            <FieldError>{errors.category?.message}</FieldError>
          </TextField>

          <TextField
            isRequired
            isInvalid={!!errors.paidById}
          >
            <Label>{t("modal.add_expense.payer_label")}</Label>
            <Controller
              control={control}
              name="paidById"
              render={({ field: { onChange, value } }) => {
                const selectedPayer = members.find((m) => m.id === value);
                const payerOptions = members.map((m) => ({
                  value: m.id,
                  label: m.id === user?.id ? t("activity.you") : m.name,
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
                    <Select.Trigger>
                      <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
                          <AppText className="font-bold text-accent text-sm">
                            {selectedPayer?.name?.charAt(0) || "?"}
                          </AppText>
                        </View>
                        <Select.Value
                          className="text-base font-medium"
                          placeholder={t("modal.add_expense.payer_placeholder")}
                        />
                        <Select.TriggerIndicator />
                      </View>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Overlay className="bg-black/20" />
                      <Select.Content
                        presentation="popover"
                        placement="bottom"
                        width={300}
                      >
                        {payerOptions.map((option) => (
                          <Select.Item
                            key={option.value}
                            value={option.value}
                            label={option.label}
                            className="p-2"
                          >
                            <View className="flex-row items-center gap-2">
                              <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
                                <AppText className="font-bold text-accent text-sm">
                                  {option.initial}
                                </AppText>
                              </View>
                              <Select.ItemLabel className="text-base" />
                              <Select.ItemIndicator />

                            </View>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Portal>
                  </Select>
                );
              }}
            />
            <FieldError>{errors.paidById?.message}</FieldError>
          </TextField>

          <TextField
            isRequired
            isInvalid={!!errors.participantIds}
          >
            <Label>{t("modal.add_expense.split_label")}</Label>
            <Card className="rounded-2xl border border-border/10 overflow-hidden bg-surface">
              {members.map((member, index) => {
                const isSelected = participantIds.includes(member.id);
                return (
                  <View key={member.id}>
                    <ControlField
                      isSelected={isSelected}
                      onSelectedChange={() => toggleParticipant(member.id)}
                      className="flex-row items-center p-2"
                    >
                      <Avatar size="sm" alt={member.name} className="ml-2 mr-2 size-8">
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
                        <Label
                          className={`font-bold text-base ${!isSelected ? "text-muted opacity-50" : ""
                            }`}
                        >
                          {member.id === user?.id ? t("activity.you") : member.name}
                        </Label>
                      </View>
                      {isSelected && totalAmount > 0 && (
                        <AppText className="font-bold text-accent mr-1">
                          {formatCurrency(splitAmount, currency)}
                        </AppText>
                      )}
                      <ControlField.Indicator variant="checkbox" />
                    </ControlField>
                    {index < members.length - 1 && (
                      <View className="h-[1px] bg-border/10 mx-4" />
                    )}
                  </View>
                );
              })}
            </Card>
            <FieldError>{errors.participantIds?.message}</FieldError>
          </TextField>

          <TextField
            isInvalid={!!errors.notes}
          >
            <Label>{t("modal.add_expense.notes_label")}</Label>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextArea
                  placeholder={t("modal.add_expense.notes_placeholder")}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <FieldError>{errors.notes?.message}</FieldError>
          </TextField>

          <TextField className="mb-6">
            <Label>{t("modal.add_expense.receipt_label")}</Label>
            <View>
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
                      {t("modal.add_expense.receipt_change")}
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
                      {t("modal.add_expense.receipt_upload")}
                    </AppText>
                    <Description className="text-center mt-1">
                      {t("modal.add_expense.receipt_hint")}
                    </Description>
                  </Card>
                </PressableFeedback>
              )}
            </View>
          </TextField>
        </View>

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
                  ? t("modal.add_expense.uploading")
                  : t("modal.add_expense.saving")
                : t("modal.add_expense.submit")}
            </Button.Label>
          </View>
        </Button>
      </ScreenScrollView>
    </View>
  );
}
