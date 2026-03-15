import { AppText } from "@/components/app-text";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useJoinGroup, useTranslation } from "@/lib/hooks";
import { CameraView, scanFromURLAsync, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Button,
  cn,
  InputGroup,
  Spinner,
  Tabs,
  TextField,
  useThemeColor,
  useToast
} from "heroui-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

export default function JoinGroupScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [activeTab, setActiveTab] = useState<'code' | 'qr'>('code');
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [torch, setTorch] = useState(false);
  const joinGroup = useJoinGroup();
  const { t } = useTranslation();
  const { toast } = useToast();
  const accent = useThemeColor("accent");
  const success = useThemeColor("success");
  const danger = useThemeColor("danger");
  const muted = useThemeColor("muted");

  const scanLineValue = useSharedValue(0);

  useEffect(() => {
    if (activeTab !== 'qr') return;

    scanLineValue.value = withRepeat(
      withTiming(1, { duration: 2500 }),
      -1,
      true
    );
  }, [activeTab]);

  const animatedLineStyle = useAnimatedStyle(() => ({
    top: `${scanLineValue.value * 100}%`,
  }));

  const parseCode = (data: string) => {
    // Support deep link expense://join-group/{code} or raw code
    const codeMatch = data.match(/join-group\/([A-Z0-9]+)/i);
    return codeMatch ? codeMatch[1].toUpperCase() : data.toUpperCase();
  };

  const onBarCodeScanned = ({ data }: { data: string }) => {
    if (!isScanning) return;
    setIsScanning(false);

    const code = parseCode(data);
    setInviteCode(code);

    handleJoinGroup(code);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets[0].uri) return;

      const scannedResults = await scanFromURLAsync(result.assets[0].uri, ["qr"]);

      if (scannedResults.length > 0) {
        const code = parseCode(scannedResults[0].data);
        setInviteCode(code);
        handleJoinGroup(code);
      } else {
        toast.show({
          label: t('modal.join_group.errors.no_code_title'),
          description: t('modal.join_group.errors.no_code_desc'),
          variant: "warning",
        });
      }
    } catch (error) {
      toast.show({
        label: t('modal.join_group.errors.scan_error_title'),
        description: t('modal.join_group.errors.scan_error_desc'),
        variant: "danger",
      });
    }
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      // Extract invite code from URL if pasted
      const codeMatch = text.match(/invite\/([A-Z0-9]+)/i);
      setInviteCode(codeMatch ? codeMatch[1].toUpperCase() : text.toUpperCase());
    }
  };

  const handleJoinGroup = async (codeToJoin?: string) => {
    const finalCode = (codeToJoin || inviteCode).trim();

    if (!finalCode) {
      toast.show({
        label: t('modal.join_group.errors.empty_input_title'),
        description: t('modal.join_group.errors.empty_input_desc'),
        variant: 'danger',
        icon: <IconSymbol name="exclamationmark.triangle.fill" size={20} color={danger} />,
        actionLabel: t('common.close'),
        onActionPress: ({ hide }) => hide(),
      });
      return;
    }

    try {
      const groupId = await joinGroup.mutateAsync(finalCode);
      toast.show({
        label: t('modal.join_group.success.title'),
        description: t('modal.join_group.success.desc'),
        variant: 'success',
        icon: <IconSymbol name="checkmark.circle.fill" size={20} color={success} />,
        actionLabel: 'OK',
        onActionPress: ({ hide }) => hide(),
      });
      router.replace(`/group/${groupId}` as any);
    } catch (error: any) {
      toast.show({
        label: t('modal.join_group.errors.join_error_title'),
        description: error.message || t('modal.join_group.errors.join_error_desc'),
        variant: "danger",
        icon: (
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={20}
            color={danger}
          />
        ),
        actionLabel: t('common.retry'),
        onActionPress: ({ hide }) => {
          hide();
          setIsScanning(true);
        },
      });
    }
  };

  const renderCodeTab = () => (
    <View className="mb-8">
      <View className="flex-row gap-2">
        <TextField isRequired className="flex-1">
          <AppText className="mb-3 ml-1 text-sm font-medium">
            {t('modal.join_group.enter_code_label')}
          </AppText>
          <AppText className="mb-3 ml-1 text-xs text-muted">
            {t('modal.join_group.enter_code_desc')}
          </AppText>
          <InputGroup>
            <InputGroup.Prefix>
              <IconSymbol name="link" size={18} color="gray" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder={t('modal.join_group.code_placeholder')}
              className="px-4 text-foreground"
              placeholderTextColor="gray"
              value={inviteCode}
              onChangeText={(text: string) => setInviteCode(text.toUpperCase())}
              autoCapitalize="characters"
              style={{ fontSize: 16 }}
            />
            <InputGroup.Suffix>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl"
                onPress={handlePaste}
              >
                <View className="flex-row items-center gap-1.5">
                  <IconSymbol name="doc.on.clipboard" size={16} color="gray" />
                  <AppText className="text-xs font-bold">{t('modal_layout.paste', { defaultValue: 'Dán' })}</AppText>
                </View>
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
      </View>
    </View>
  );

  const renderQrTab = () => {
    if (!permission) {
      return (
        <View className="aspect-square w-full rounded-3xl bg-surface items-center justify-center mb-8">
          <Spinner size="lg" color={accent} />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="w-full rounded-3xl bg-surface border border-border/10 items-center p-8 mb-8">
          <View className="w-20 h-20 bg-accent/10 rounded-full items-center justify-center mb-6">
            <IconSymbol name="camera.fill" size={40} color={accent} />
          </View>
          <AppText className="text-2xl font-bold mb-3 text-center">
            {t('modal.join_group.camera_permission_title')}
          </AppText>
          <AppText className="text-muted text-center mb-8 leading-relaxed">
            {t('modal.join_group.camera_permission_desc')}
          </AppText>
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl bg-accent"
            onPress={requestPermission}
          >
            <Button.Label className="font-bold">{t('modal.join_group.grant_permission')}</Button.Label>
          </Button>
        </View>
      );
    }

    return (
      <View className="aspect-square w-full rounded-3xl overflow-hidden bg-black relative shadow-2xl mb-8">
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={onBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          enableTorch={torch}
        />

        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View className="w-64 h-64 border-2 border-accent/50 rounded-3xl overflow-hidden relative" style={{ borderStyle: "dashed" }}>
            <Animated.View
              className="absolute w-full h-0.5 bg-accent/60"
              style={animatedLineStyle}
            />
          </View>
        </View>

        {/* Corner Markers */}
        <View className="absolute top-12 left-12 w-10 h-10 border-t-4 border-l-4 border-accent rounded-tl-2xl" />
        <View className="absolute top-12 right-12 w-10 h-10 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
        <View className="absolute bottom-12 left-12 w-10 h-10 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
        <View className="absolute bottom-12 right-12 w-10 h-10 border-b-4 border-r-4 border-accent rounded-br-2xl" />

        <View className="absolute bottom-20 w-full flex-row justify-center gap-8">
          <View className="items-center">
            <TouchableOpacity
              onPress={handlePickImage}
              className="w-14 h-14 rounded-full bg-black/40 items-center justify-center border border-white/20"
            >
              <IconSymbol name="photo.on.rectangle" size={24} color="white" />
            </TouchableOpacity>
            {/* <AppText className="text-white text-[10px] text-center mt-2 font-bold uppercase">
              {t('modal.join_group.gallery')}
            </AppText> */}
          </View>
          <View className="items-center">
            <TouchableOpacity
              onPress={() => setTorch(!torch)}
              className={`w-14 h-14 rounded-full ${torch ? "bg-accent" : "bg-black/40"
                } items-center justify-center border border-white/20`}
            >
              <IconSymbol
                name="flashlight.on.fill"
                size={24}
                color="white"
              />
            </TouchableOpacity>
            {/* <AppText className="text-white text-[10px] text-center mt-2 font-bold uppercase">
              {t('modal.join_group.flash')}
            </AppText> */}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView withKeyboardAvoidingView>
        <View className="items-center mb-6 mt-6">
          <AppText className="text-3xl font-bold mb-3">{t('modal.join_group.title')}</AppText>
          <AppText className="text-muted text-center leading-relaxed text-base">
            {t('modal.join_group.subtitle')}
          </AppText>
        </View>

        {/* Tab Selector */}
        <View className="flex-row justify-center mb-8">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'code' | 'qr')}
            variant="primary"
            className="bg-surface-secondary rounded-full p-1"
          >
            <Tabs.List>
              <Tabs.Indicator className="bg-accent shadow-none" />
              <Tabs.Trigger value="code" className="px-6 py-2 rounded-full">
                {({ isSelected }) => (
                  <View className="flex-row items-center gap-1.5">
                    <IconSymbol name="link" size={14} color={isSelected ? 'white' : muted} />
                    <Tabs.Label className={cn("font-bold text-[13px]", isSelected ? "text-white" : "text-foreground")}>
                      {t('modal.join_group.tab_code')}
                    </Tabs.Label>
                  </View>
                )}
              </Tabs.Trigger>
              <Tabs.Trigger value="qr" className="px-6 py-2 rounded-full">
                {({ isSelected }) => (
                  <View className="flex-row items-center gap-1.5">
                    <IconSymbol name="qrcode" size={14} color={isSelected ? 'white' : muted} />
                    <Tabs.Label className={cn("font-bold text-[13px]", isSelected ? "text-white" : "text-foreground")}>
                      {t('modal.join_group.tab_qr')}
                    </Tabs.Label>
                  </View>
                )}
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </View>

        {/* Tab Content */}
        {activeTab === 'code' ? renderCodeTab() : renderQrTab()}

        <Button
          size="lg"
          className="h-16 rounded-2xl bg-accent shadow-lg"
          onPress={() => handleJoinGroup()}
          isDisabled={joinGroup.isPending || !inviteCode.trim()}
        >
          <View className="flex-row items-center gap-2">
            <AppText className="font-bold text-lg text-white">
              {joinGroup.isPending ? t('modal.join_group.joining') : t('modal.join_group.join_btn')}
            </AppText>
            <IconSymbol name="arrow.right.to.line" size={20} color="white" />
          </View>
        </Button>

        {/* <PressableFeedback className="mt-8 self-center">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="questionmark.circle" size={18} color="gray" />
            <AppText className="text-muted font-medium">{t('modal.join_group.how_to_find')}</AppText>
          </View>
        </PressableFeedback> */}
      </ScreenScrollView>
    </View>
  );
}
