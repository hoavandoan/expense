import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ModalHeader } from "@/components/ui/modal-header";
import { EXPENSE_CATEGORIES } from "@/constants";
import { useExpense, useUpdateExpense } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { formatCurrency, parseFormattedNumber, uploadImage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  PressableFeedback,
  Skeleton,
  Spinner,
  TextField,
  useThemeColor,
} from "heroui-native";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";
import * as z from "zod";

const expenseSchema = z.object({
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

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const muted = useThemeColor("muted");
  const accent = useThemeColor("accent");
  const { user } = useAuthStore();

  const { data: expense, isLoading } = useExpense(id as string);
  const updateExpense = useUpdateExpense();

  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    mode: "onChange",
  });

  const amountValue = watch("amount");
  const categoryValue = watch("category");

  // Initialize form with expense data
  useEffect(() => {
    if (expense) {
      setValue("title", expense.title);
      setValue("amount", expense.amount.toString());
      // Map accommodation to other if needed
      const category =
        expense.category === "accommodation" ? "other" : expense.category;
      setValue(
        "category",
        category as
          | "food"
          | "transport"
          | "shopping"
          | "entertainment"
          | "utilities"
          | "other"
      );
      setValue("notes", expense.description || "");
      // Set receipt if exists
      if (expense.receiptUrl) {
        setSelectedReceipt(expense.receiptUrl);
      }
    }
  }, [expense, setValue]);

  const splitAmount = useMemo(() => {
    if (!expense || !amountValue) return 0;
    const totalAmount = parseFormattedNumber(amountValue);
    const expenseData = expense as any;
    const participantCount = expenseData.expense_splits?.length || 1;
    return Math.floor(totalAmount / participantCount);
  }, [expense, amountValue]);

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
      const expenseData = expense as any;

      await updateExpense.mutateAsync({
        expenseId: expense.id,
        groupId: expenseData.group_id || expense.groupId,
        title: values.title,
        amount,
        category: values.category as
          | "food"
          | "transport"
          | "shopping"
          | "entertainment"
          | "utilities"
          | "other",
        description: values.notes || undefined,
        receiptUrl,
      });

      Alert.alert("Thành công", "Đã cập nhật khoản chi");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã có lỗi xảy ra");
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
          Không tìm thấy khoản chi
        </AppText>
      </View>
    );
  }

  const expenseData = expense as any;
  const currency = expenseData.group?.currency || "VND";

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Chỉnh sửa chi tiêu" variant="back" />

      <ScreenScrollView>
        <View className="p-6 gap-6">
          {/* Category Selection */}
          <View>
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              DANH MỤC
            </AppText>
            <View className="flex-row flex-wrap gap-3">
              {EXPENSE_CATEGORIES.map((category) => {
                const isSelected = categoryValue === category.value;
                return (
                  <PressableFeedback
                    key={category.value}
                    onPress={() => setValue("category", category.value)}
                  >
                    <Card
                      variant="default"
                      className={`p-4 rounded-2xl border ${
                        isSelected
                          ? "border-accent bg-accent/5"
                          : "border-divider/10 bg-surface"
                      }`}
                    >
                      <View className="items-center gap-2">
                        <View
                          className={`w-12 h-12 rounded-xl items-center justify-center ${
                            isSelected ? category.bg : "bg-surface-secondary"
                          }`}
                        >
                          <IconSymbol
                            name={category.icon}
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
              <AppText className="text-danger text-xs mt-1 ml-1">
                {errors.category.message}
              </AppText>
            )}
          </View>

          {/* Title */}
          <View>
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              MÔ TẢ
            </AppText>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextField className="bg-surface border border-divider/10 rounded-2xl">
                  <TextField.Input
                    placeholder="Nhập mô tả chi tiêu"
                    value={value}
                    onChangeText={onChange}
                    className="h-14"
                  />
                </TextField>
              )}
            />
            {errors.title && (
              <AppText className="text-danger text-xs mt-1 ml-1">
                {errors.title.message}
              </AppText>
            )}
          </View>

          {/* Amount */}
          <View>
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              SỐ TIỀN
            </AppText>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextField className="bg-surface border border-divider/10 rounded-2xl">
                  <TextField.Input
                    placeholder="0"
                    value={value}
                    onChangeText={(text: string) => {
                      const formatted = text.replace(/\D/g, "");
                      onChange(formatted);
                    }}
                    keyboardType="numeric"
                    className="h-14 pr-16"
                  />
                  <View className="absolute right-4 top-0 bottom-0 justify-center">
                    <AppText className="text-muted font-semibold">
                      {currency}
                    </AppText>
                  </View>
                </TextField>
              )}
            />
            {errors.amount && (
              <AppText className="text-danger text-xs mt-1 ml-1">
                {errors.amount.message}
              </AppText>
            )}
            {amountValue && (
              <AppText className="text-muted text-xs mt-1 ml-1">
                Chia đều: {formatCurrency(splitAmount, currency)} mỗi người
              </AppText>
            )}
          </View>

          {/* Notes */}
          <View>
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              GHI CHÚ (TÙY CHỌN)
            </AppText>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextField className="bg-surface border border-divider/10 rounded-2xl">
                  <TextField.Input
                    placeholder="Thêm ghi chú..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    className="min-h-[100px] py-4"
                  />
                </TextField>
              )}
            />
          </View>

          {/* Receipt Upload */}
          <View>
            <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-3 ml-1">
              ẢNH HÓA ĐƠN (TÙY CHỌN)
            </AppText>
            {selectedReceipt ? (
              <Card className="rounded-2xl border border-divider/10 overflow-hidden bg-surface">
                <View className="relative">
                  <Image
                    source={{ uri: selectedReceipt }}
                    style={{ width: "100%", height: 200 }}
                    contentFit="cover"
                  />
                  <PressableFeedback
                    onPress={removeReceipt}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={24}
                      color="white"
                    />
                  </PressableFeedback>
                </View>
                <PressableFeedback
                  onPress={pickReceipt}
                  className="p-4 border-t border-divider/10"
                >
                  <AppText className="text-accent text-center font-semibold">
                    Thay đổi ảnh
                  </AppText>
                </PressableFeedback>
              </Card>
            ) : (
              <PressableFeedback onPress={pickReceipt}>
                <Card className="rounded-2xl border border-dashed border-divider/20 bg-surface-secondary p-8 items-center justify-center">
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
          </View>

          {/* Participants Info (Read-only) */}
          {expenseData.expense_splits &&
            expenseData.expense_splits.length > 0 && (
              <View>
                <AppText className="text-sm font-bold text-muted uppercase tracking-widest mb-3 ml-1">
                  NGƯỜI THAM GIA ({expenseData.expense_splits.length})
                </AppText>
                <Card className="rounded-2xl border border-divider/10 bg-surface">
                  {expenseData.expense_splits.map((split: any, idx: number) => {
                    const splitUser = split.user || {};
                    return (
                      <View
                        key={split.id || idx}
                        className="p-3 flex-row items-center gap-3"
                      >
                        {splitUser.avatar_url ? (
                          <Avatar size="sm" alt={splitUser.name || ""}>
                            <Avatar.Image
                              source={{ uri: splitUser.avatar_url }}
                            />
                          </Avatar>
                        ) : (
                          <Avatar
                            size="sm"
                            alt={splitUser.name || ""}
                            className="bg-surface-tertiary"
                          >
                            <Avatar.Fallback>
                              <AppText className="text-[10px] font-bold">
                                {splitUser.name?.charAt(0) || "U"}
                              </AppText>
                            </Avatar.Fallback>
                          </Avatar>
                        )}
                        <AppText className="font-semibold flex-1">
                          {splitUser.name || "Thành viên"}
                        </AppText>
                        <AppText className="text-muted text-sm">
                          {formatCurrency(splitAmount, currency)}
                        </AppText>
                      </View>
                    );
                  })}
                </Card>
                <AppText className="text-muted text-xs mt-2 ml-1">
                  Lưu ý: Không thể thay đổi người tham gia. Tạo khoản chi mới
                  nếu cần thay đổi.
                </AppText>
              </View>
            )}

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
                Lưu thay đổi
              </Button.Label>
            )}
          </Button>
        </View>
      </ScreenScrollView>
    </View>
  );
}
