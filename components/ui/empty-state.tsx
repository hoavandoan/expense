import { AppText } from "@/components/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button, useThemeColor } from "heroui-native";
import React from "react";
import { View } from "react-native";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  const accent = useThemeColor("accent");
  const muted = useThemeColor("muted");

  return (
    <View className={`items-center justify-center p-8 ${className || ""}`}>
      <View className="w-20 h-20 rounded-full bg-surface-secondary items-center justify-center mb-4">
        <IconSymbol name={icon} size={40} color={muted} />
      </View>
      <AppText className="text-lg font-bold text-foreground text-center mb-2">
        {title}
      </AppText>
      {description && (
        <AppText className="text-muted text-sm text-center mb-6 max-w-xs">
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          className="rounded-xl"
          onPress={onAction}
        >
          <Button.Label className="font-semibold">{actionLabel}</Button.Label>
        </Button>
      )}
    </View>
  );
};
