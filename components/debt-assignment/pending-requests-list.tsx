import { AppText } from '@/components/app-text';
import React from 'react';
import { View } from 'react-native';
import { usePendingAssignmentRequests } from '../../lib/hooks/use-debt-assignment-requests';
import { AssignmentRequestCard } from './assignment-request-card';

interface PendingRequestsListProps {
  groupId: string;
  isAdminOrOwner: boolean;
}

export const PendingRequestsList: React.FC<PendingRequestsListProps> = ({
  groupId,
  isAdminOrOwner,
}) => {
  const { data: requests, isLoading } = usePendingAssignmentRequests(groupId);

  if (isLoading) return null;

  if (!requests || requests.length === 0) return null;

  return (
    <View className="w-full mt-2 mb-4">
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <AppText className="text-[10px] font-bold text-muted uppercase tracking-widest">
            ĐỀ XUẤT GÁN NỢ ({requests.length})
            </AppText>
        </View>
      </View>
      
      {requests.map((request) => (
        <AssignmentRequestCard
          key={request.id}
          request={request}
          canReview={isAdminOrOwner}
        />
      ))}
    </View>
  );
};

