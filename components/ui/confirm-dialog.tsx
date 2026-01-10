import { Button, Dialog, Spinner } from "heroui-native";
import React from "react";
import { View } from "react-native";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "primary" | "danger";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="p-6">
          <View className="mb-6 gap-2">
            <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
            {description && (
              <Dialog.Description className="text-muted text-base leading-6">
                {description}
              </Dialog.Description>
            )}
          </View>
          <View className="flex-row justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="ghost">
                <Button.Label className="font-semibold text-muted">
                  {cancelLabel}
                </Button.Label>
              </Button>
            </Dialog.Close>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              onPress={handleConfirm}
              isDisabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Button.Label className="font-bold">
                  {confirmLabel}
                </Button.Label>
              )}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
