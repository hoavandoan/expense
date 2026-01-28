import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { decode } from "base64-arraybuffer";
import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import {
	BottomSheet,
	Button,
	Divider,
	useThemeColor,
	useToast,
} from "heroui-native";
import React, { useRef } from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetBlurOverlay } from "../bottom-sheet-blur-overlay";

interface ShareQRSheetProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	groupName: string;
	inviteCode: string;
}

export function ShareQRSheet({
	                             isOpen,
	                             onOpenChange,
	                             groupName,
	                             inviteCode,
                             }: ShareQRSheetProps) {
	const { toast } = useToast();
	const accent = useThemeColor("accent");
	const insets = useSafeAreaInsets();
	const qrRef = useRef<any>(null);

	// Format the share content
	const qrValue = `expense://join-group/${inviteCode}`;

	const handleWriteQR = async (data: string): Promise<string> => {
		// Strip prefix if exists: data:image/png;base64,
		const base64Data = data.includes(",") ? data.split(",")[1] : data;
		const binaryData = new Uint8Array(decode(base64Data));

		const file = new File(Paths.cache, `qr-${inviteCode}.png`);
		await file.write(binaryData);
		return file.uri;
	};

	const handleSaveQR = async () => {
		try {
			if (!qrRef.current) return;

			qrRef.current.toDataURL(async (data: string) => {
				try {
					const fileUri = await handleWriteQR(data);

					// Request write-only permissions as a safety measure
					const { status } = await MediaLibrary.requestPermissionsAsync(true);
					if (status !== "granted") {
						// If denied, fallback to Sharing
						handleShareQR();
						return;
					}

					await MediaLibrary.saveToLibraryAsync(fileUri);
					toast.show({
						label: "Đã lưu",
						description: "Mã QR đã được lưu vào thư viện ảnh",
						variant: "success",
					});
				} catch (innerError: any) {
					console.log("Save error:", innerError);
					handleShareQR();
				}
			});
		} catch (error: any) {
			toast.show({
				label: "Lỗi",
				description: "Không thể xử lý mã QR lúc này",
				variant: "danger",
			});
		}
	};

	const handleShareQR = async () => {
		try {
			if (!qrRef.current) return;

			qrRef.current.toDataURL(async (data: string) => {
				try {
					const fileUri = await handleWriteQR(data);

					await Sharing.shareAsync(fileUri, {
						mimeType: "image/png",
						dialogTitle: `Chia sẻ mã mời nhóm ${groupName}`,
					});
				} catch (innerError: any) {
					toast.show({
						label: "Lỗi",
						description: "Không thể chia sẻ mã QR lúc này",
						variant: "danger",
					});
				}
			});
		} catch (error: any) {
			toast.show({
				label: "Lỗi",
				description: "Không thể xử lý mã QR lúc này",
				variant: "danger",
			});
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal>
				<BottomSheetBlurOverlay />
				<BottomSheet.Content
					enableDynamicSizing={true}
					detached={true}
					className="mx-4"
					backgroundClassName="rounded-[32px]"
					bottomInset={insets.bottom + 12}
					contentContainerClassName="items-center pb-12 pt-4"
				>
					<View className="w-full px-6 items-center">
						<AppText className="text-xl font-bold mb-1 text-center">
							Mã QR tham gia nhóm
						</AppText>
						<AppText className="text-muted text-sm mb-8 text-center px-4">
							Người khác có thể quét mã này để tham gia nhóm "{groupName}"
						</AppText>

						<View className="bg-white p-6 rounded-3xl shadow-sm border border-divider/10 mb-8">
							<QRCode
								value={qrValue}
								size={220}
								getRef={(ref) => (qrRef.current = ref)}
								quietZone={10}
							/>
						</View>

						<View className="bg-surface-secondary px-6 py-3 rounded-2xl mb-8 flex-row items-center gap-3 border border-divider/5">
							<AppText className="text-muted font-bold text-xs tracking-widest uppercase">
								MÃ MỜI:
							</AppText>
							<AppText className="text-lg font-mono tracking-tighter">
								{inviteCode}
							</AppText>
						</View>

						<Divider className="mb-6 w-full opacity-10" />

						<View className="flex-row gap-4 w-full">
							<Button
								variant="secondary"
								className="flex-1 rounded-2xl h-14"
								onPress={handleSaveQR}
							>
								<IconSymbol
									name="camera.fill"
									size={20}
									color={useThemeColor("foreground")}
								/>
								<Button.Label className="font-bold">Lưu ảnh</Button.Label>
							</Button>
							<Button
								variant="primary"
								className="flex-1 rounded-2xl h-14"
								onPress={handleShareQR}
							>
								<IconSymbol name="square.and.arrow.up" size={20} color="white" />
								<Button.Label className="font-bold">Chia sẻ</Button.Label>
							</Button>
						</View>
					</View>
				</BottomSheet.Content>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
