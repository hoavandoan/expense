import { AppText } from '@/components/app-text';
import { Image } from 'expo-image';
import {
    Avatar,
    Button,
    Card,
    Separator,
} from 'heroui-native';
import React from 'react';
import { View } from 'react-native';
import { useApproveAssignmentRequest, useRejectAssignmentRequest } from '../../lib/hooks/use-debt-assignment-requests';
import { DebtAssignmentRequest } from '../../lib/types';

interface AssignmentRequestCardProps {
  request: DebtAssignmentRequest;
  canReview: boolean;
}

export const AssignmentRequestCard: React.FC<AssignmentRequestCardProps> = ({
  request,
  canReview,
}) => {
  const { mutate: approve, isPending: isApproving } = useApproveAssignmentRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectAssignmentRequest();

  const handleApprove = () => {
    approve({
      requestId: request.id,
      groupId: request.groupId,
      proposedAssigneeUserId: request.proposedAssigneeUserId,
      reason: request.reason,
    });
  };

  const handleReject = () => {
    reject({
      requestId: request.id,
      groupId: request.groupId,
    });
  };

  const renderUser = (user: any, role: string) => (
    <View className="flex-row items-center gap-2">
      <Avatar size="sm" alt={user?.name || 'User'}>
        {user?.avatarUrl ? (
          <Avatar.Image source={{ uri: user.avatarUrl }} asChild>
            <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
          </Avatar.Image>
        ) : (
          <Avatar.Fallback className="bg-default-100">
            <AppText className="font-bold text-xs">{user?.name?.charAt(0)}</AppText>
          </Avatar.Fallback>
        )}
      </Avatar>
      <View>
        <AppText className="font-bold text-xs">{user?.name || 'Unknown'}</AppText>
        <AppText className="text-[10px] text-muted">{role}</AppText>
      </View>
    </View>
  );

  return (
    <Card className="w-full mb-3 p-4 rounded-2xl bg-surface border border-border/10 shadow-none">
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <AppText className="text-[10px] font-bold text-muted uppercase tracking-widest">
            YÊU CẦU GÁN NỢ
          </AppText>
          <AppText className="text-[10px] text-muted">
            {new Date(request.createdAt).toLocaleDateString()}
          </AppText>
        </View>

        <View className="flex-row items-center justify-between bg-default-50 p-3 rounded-xl">
            {renderUser(request.requestedByUser, 'Người yêu cầu')}
            <AppText className="text-muted mx-1 text-xs">→</AppText>
            {renderUser(request.proposedAssigneeUser, 'Được đề xuất')}
        </View>

        {request.reason && (
          <View className="bg-surface-secondary p-3 rounded-xl">
            <AppText className="text-xs text-foreground italic">"{request.reason}"</AppText>
          </View>
        )}

        {canReview && (
          <>
            <Separator className="opacity-10" />
            <View className="flex-row gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onPress={handleReject}
                isDisabled={isApproving || isRejecting}
              >
                 <Button.Label className="text-danger font-semibold">Từ chối</Button.Label>
              </Button>
              <Button
                size="sm"
                variant="primary"
                onPress={handleApprove}
                isDisabled={isApproving || isRejecting}
              >
                 <Button.Label className="text-white font-bold">
                   {isApproving ? 'Đang duyệt...' : 'Duyệt'}
                 </Button.Label>
              </Button>
            </View>
          </>
        )}
      </View>
    </Card>
  );
};

