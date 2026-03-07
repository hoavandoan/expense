import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { FormSection } from "@/components/ui/form-section";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CURRENCIES, GROUP_TYPES } from "@/constants";
import { useCreateGroup, useTranslation } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
import { uploadImage } from "@/lib/utils/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Avatar,
  Button,
  Input,
  PressableFeedback,
  Select,
  TextField,
  useThemeColor
} from "heroui-native";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import * as z from "zod";

const getGroupSchema = (t: any) => z.object({
  name: z.string().min(1, t("modal.add_group.errors.name_required")),
  description: z.string().optional(),
  groupType: z.enum(["trip", "home", "couple", "other"]),
  currency: z.string().min(1, t("modal.add_group.errors.currency_required")),
  coverImageUrl: z.string().optional(),
});

type GroupFormValues = z.infer<ReturnType<typeof getGroupSchema>>;

export default function AddGroupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");
  const { user } = useAuthStore();
  const createGroup = useCreateGroup();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const groupSchema = useMemo(() => getGroupSchema(t), [t]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      groupType: "other",
      currency: "VND",
    },
    mode: "onChange",
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (values: GroupFormValues) => {
    try {
      setIsUploading(true);
      let coverImageUrl = values.coverImageUrl;

      if (selectedImage && user?.id) {
        const fileName = `group-${Date.now()}`;
        coverImageUrl = await uploadImage(
          selectedImage,
          "groups",
          `${user.id}/${fileName}`
        );
      }

      await createGroup.mutateAsync({
        ...values,
        coverImageUrl,
      });

      router.back();
    } catch (error: any) {
      // toast should be handled here but let's keep it simple for now
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView withKeyboardAvoidingView>
        <View className="items-center my-8">
          <PressableFeedback onPress={pickImage} className="relative">
            <Avatar size="lg" alt="Avatar" className="w-24 h-24 rounded-full bg-accent/5">
              {selectedImage ? (
                <Avatar.Image source={{ uri: selectedImage }} asChild>
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Avatar.Image>
              ) : (
                <Avatar.Fallback className="bg-accent/10">
                  <IconSymbol name="camera.fill" size={32} color={accent} />
                </Avatar.Fallback>
              )}
            </Avatar>
            <View className="absolute z-10 bottom-0 right-0 bg-accent w-8 h-8 rounded-full items-center justify-center border-2 border-background">
              <IconSymbol name="plus" size={16} color="white" />
            </View>
          </PressableFeedback>
          <AppText className="text-muted text-xs mt-3 font-bold tracking-widest">
            {t("modal.add_group.cover_image")}
          </AppText>
        </View>

        <View className="gap-2 px-4">
          <FormSection
            label={t("modal.add_group.name_label")}
            isRequired
            error={errors.name?.message}
          >
            <TextField isRequired isInvalid={!!errors.name}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t("modal.add_group.name_placeholder")}
                    value={value}
                    onChangeText={onChange}
                    className="bg-surface border border-border/10 h-12 rounded-2xl px-4 text-base"
                  />
                )}
              />
            </TextField>
          </FormSection>

          <FormSection
            label={t("modal.add_group.desc_label")}
            error={errors.description?.message}
          >
            <TextField isInvalid={!!errors.description}>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t("modal.add_group.desc_placeholder")}
                    value={value}
                    onChangeText={onChange}
                    className="bg-surface border border-border/10 h-12 rounded-2xl px-4 text-base"
                  />
                )}
              />
            </TextField>
          </FormSection>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <FormSection
                label={t("modal.add_group.type_label")}
                isRequired
                error={errors.groupType?.message}
              >
                <Controller
                  control={control}
                  name="groupType"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={GROUP_TYPES.find((t) => t.value === value) as any}
                      onValueChange={(opt: any) => opt && onChange(opt.value)}
                    >
                      <Select.Trigger className="h-12 border border-border/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <IconSymbol
                            name={
                              GROUP_TYPES.find((t) => t.value === value)
                                ?.icon as any
                            }
                            size={20}
                            color={accent}
                          />
                          <Select.Value
                            className="text-[15px] font-medium"
                            placeholder={t("modal.add_group.type_label")}
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
                          width={250}
                        >
                          {GROUP_TYPES.map((type) => (
                            <Select.Item
                              key={type.value}
                              value={type.value}
                              label={t(`group_types.${type.value}`)}
                              className="p-4"
                            >
                              <View className="flex-row items-center gap-3">
                                <IconSymbol
                                  name={type.icon as any}
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
            </View>

            <View className="flex-1">
              <FormSection
                label={t("modal.add_group.currency_label")}
                isRequired
                error={errors.currency?.message}
              >
                <Controller
                  control={control}
                  name="currency"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      value={CURRENCIES.find((c) => c.value === value) as any}
                      onValueChange={(opt: any) => opt && onChange(opt.value)}
                    >
                      <Select.Trigger className="h-12 border border-border/10 bg-surface rounded-2xl px-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <AppText className="font-bold text-accent text-lg">
                            {CURRENCIES.find((c) => c.value === value)?.symbol}
                          </AppText>
                          <Select.Value
                            className="text-[15px] font-medium"
                            placeholder={t("modal.add_group.currency_label")}
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
                          width={250}
                        >
                          {CURRENCIES.map((curr) => (
                            <Select.Item
                              key={curr.value}
                              value={curr.value}
                              label={curr.label}
                              className="p-4"
                            >
                              <View className="flex-row items-center gap-3">
                                <AppText className="font-bold text-accent text-lg w-6">
                                  {curr.symbol}
                                </AppText>
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
            </View>
          </View>
        </View>

        <View className="my-6 px-4">
          <Button
            size="lg"
            onPress={handleSubmit(onSubmit)}
            isDisabled={createGroup.isPending || isUploading || !isValid}
          >
            <View className="flex-row items-center justify-center gap-2">
              <IconSymbol name="plus" size={20} color="white" />
              <Button.Label className="text-white font-bold text-lg">
                {createGroup.isPending || isUploading
                  ? t("modal.add_group.creating")
                  : t("modal.add_group.submit")}
              </Button.Label>
            </View>
          </Button>
        </View>
      </ScreenScrollView>
    </View>
  );
}
