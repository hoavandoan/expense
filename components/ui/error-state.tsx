import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button, useThemeColor } from "heroui-native";
import React from "react";
import { View } from "react-native";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Đã xảy ra lỗi",
  message = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
  retryLabel = "Thử lại",
  className,
}) => {
  const accent = useThemeColor("accent");
  const danger = useThemeColor("danger");

  return (
    <View className={`items-center justify-center p-8 ${className || ""}`}>
      <View className="w-20 h-20 rounded-full bg-danger/10 items-center justify-center mb-4">
        <IconSymbol name="exclamationmark.triangle.fill" size={40} color={danger} />
      </View>
      <AppText className="text-lg font-bold text-foreground text-center mb-2">
        {title}
      </AppText>
      {message && (
        <AppText className="text-muted text-sm text-center mb-6 max-w-xs">
          {message}
        </AppText>
      )}
      {onRetry && (
        <Button
          variant="primary"
          size="md"
          className="rounded-xl"
          onPress={onRetry}
        >
          <Button.Label className="font-semibold">{retryLabel}</Button.Label>
        </Button>
      )}
    </View>
  );
};
