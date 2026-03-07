import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from '@/lib/hooks';
import { Image } from 'expo-image';
import {
  Avatar,
  Button,
  cn,
  Dialog,
} from 'heroui-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSetDebtAssignment } from '../../lib/hooks/use-debt-assignments';

interface SelectableMember {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
}

interface AssigneeSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  groupId: string;
  members: SelectableMember[];
  currentAssigneeId?: string;
}

export const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  isVisible,
  onClose,
  groupId,
  members,
  currentAssigneeId,
}) => {
  const { mutate: setAssignment, isPending } = useSetDebtAssignment();
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(currentAssigneeId || null);
  const { t } = useTranslation();

  const handleConfirm = () => {
    if (!selectedUserId) return;
    setAssignment(
      { groupId, assigneeUserId: selectedUserId },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog isOpen={isVisible} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-w-md w-[90%] self-center">
          <View className="flex-row justify-between items-center mb-2">
            <Dialog.Title className="text-xl font-bold">{t('debt_assignment.assignee_selector.title')}</Dialog.Title>
            <Dialog.Close>
              <Button isIconOnly variant="ghost" size="sm">
                <IconSymbol name="xmark" size={24} color="gray" />
              </Button>
            </Dialog.Close>
          </View>
          
          <Dialog.Description className="text-muted mb-4">
            {t('debt_assignment.assignee_selector.description')}
          </Dialog.Description>

          <ScrollView className="max-h-80 mb-6" showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {members.map((member) => (
                <Button
                  key={member.userId}
                  variant="ghost"
                  className={cn(
                    "p-3 rounded-2xl border flex-row items-center justify-between h-auto",
                    selectedUserId === member.userId
                      ? "border-primary bg-primary/10"
                      : "border-border/10"
                  )}
                  onPress={() => setSelectedUserId(member.userId)}
                >
                  <View className="flex-row items-center flex-1">
                    <Avatar size="md" className="mr-3" alt={member.name || 'Member'}>
                      {member.avatarUrl ? (
                        <Avatar.Image source={{ uri: member.avatarUrl }} asChild>
                           <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                        </Avatar.Image>
                      ) : (
                        <Avatar.Fallback className="bg-default-100">
                           <AppText className="font-bold">{member.name?.charAt(0)}</AppText>
                        </Avatar.Fallback>
                      )}
                    </Avatar>
                    <View className="items-start">
                      <AppText className="font-bold">{member.name || t('debt_assignment.assignee_selector.unknown', { defaultValue: 'Unknown' })}</AppText>
                      <AppText className="text-xs text-muted capitalize">{member.role}</AppText>
                    </View>
                  </View>
                  {selectedUserId === member.userId && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <IconSymbol name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </Button>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-3">
            <Dialog.Close>
              <Button 
                variant="ghost" 
                className="flex-1"
              >
                <Button.Label>{t('common.cancel')}</Button.Label>
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              className="flex-1"
              onPress={handleConfirm}
              isDisabled={isPending || !selectedUserId || selectedUserId === currentAssigneeId}
            >
               <Button.Label className="text-white">
                 {isPending ? t('debt_assignment.assignee_selector.processing') : t('debt_assignment.assignee_selector.confirm')}
               </Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

