import { AppText } from '@/components/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import {
    Avatar,
    Button,
    cn,
    Dialog,
    TextField,
} from 'heroui-native';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useCreateAssignmentRequest } from '../../lib/hooks/use-debt-assignment-requests';

interface SelectableMember {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
}

interface CreateRequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  groupId: string;
  members: SelectableMember[];
  currentUserId: string;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isVisible,
  onClose,
  groupId,
  members,
  currentUserId,
}) => {
  const { mutate: createRequest, isPending } = useCreateAssignmentRequest();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!selectedUserId) return;
    createRequest(
      { groupId, proposedAssigneeUserId: selectedUserId, reason },
      {
        onSuccess: () => {
          onClose();
          setSelectedUserId(null);
          setReason('');
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
            <Dialog.Title className="text-xl font-bold">Đề Xuất Người Gán Nợ</Dialog.Title>
            <Dialog.Close asChild>
              <Button isIconOnly variant="ghost" size="sm">
                <IconSymbol name="xmark" size={24} color="gray" />
              </Button>
            </Dialog.Close>
          </View>
          
          <Dialog.Description className="text-muted mb-4">
            Đề xuất một thành viên để làm trung gian thanh toán. Chủ nhóm sẽ duyệt yêu cầu này.
          </Dialog.Description>
          
          <ScrollView className="max-h-60 mb-4" showsVerticalScrollIndicator={false}>
            <View className="gap-3">
              {members.map((member) => (
                <Button
                  key={member.userId}
                  variant="ghost"
                  className={cn(
                    "p-3 rounded-2xl border flex-row items-center justify-between h-auto",
                    selectedUserId === member.userId
                      ? "border-primary bg-primary/10"
                      : "border-divider/10"
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
                      <AppText className="font-bold">{member.name || 'Unknown'}</AppText>
                      <AppText className="text-xs text-muted capitalize">
                         {member.userId === currentUserId ? 'Bạn' : member.role}
                      </AppText>
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

          <View className="mb-6">
            <TextField>
              <TextField.Label>Lý do (Tùy chọn)</TextField.Label>
              <TextField.Input
                placeholder="Tại sao nên chọn người này?"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                className="min-h-[80px]"
              />
            </TextField>
          </View>

          <View className="flex-row gap-3">
            <Dialog.Close asChild>
              <Button variant="ghost" className="flex-1">
                <Button.Label>Hủy</Button.Label>
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              className="flex-1"
              onPress={handleConfirm}
              isDisabled={isPending || !selectedUserId}
            >
              <Button.Label className="text-white">Gửi đề xuất</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

