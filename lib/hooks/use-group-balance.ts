import { queryOptions, useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { GroupWithDetails } from '../types';

export interface BalanceStats {
  totalPaid: number; // Total amount user has spent
  totalOwed: number; // Amount others owe to user
  totalOwing: number; // Amount user owes to others
  balance: number; // Net balance
}

export interface MemberBalance {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  balance: number;
}

export const membersBalanceQueryOptions = (groupId: string | null | undefined) => queryOptions({
  queryKey: ['group-balances', groupId],
  queryFn: async () => {
    if (!groupId) return [];

    const { data, error } = await supabase.rpc('get_group_member_balances', {
      p_group_id: groupId
    });

    if (error) throw error;

    return data.map((m: any) => ({
      userId: m.user_id,
      name: m.name,
      avatarUrl: m.avatar_url,
      role: m.role,
      balance: m.balance,
      totalPaid: m.total_paid,
      totalShare: m.total_share
    }));
  },
  enabled: !!groupId,
});

export const userGlobalStatsQueryOptions = (userId: string | null | undefined) => queryOptions({
  queryKey: ['user-stats', userId],
  queryFn: async () => {
    if (!userId) return { totalPaid: 0, totalOwed: 0, totalOwing: 0, balance: 0 };

    const { data, error } = await supabase.rpc('get_user_stats', {
      p_user_id: userId
    });

    if (error) throw error;
    return data as BalanceStats;
  },
  enabled: !!userId,
});

/**
 * Calculate balance for a specific user in a group
 */
export const useUserBalanceInGroup = (
  group: GroupWithDetails | null | undefined,
  userId: string | null | undefined
): BalanceStats => {
  // We can derive this from useMembersBalance
  const { data: members } = useQuery(membersBalanceQueryOptions(group?.id));

  if (!userId || !members) {
    return { totalPaid: 0, totalOwed: 0, totalOwing: 0, balance: 0 };
  }

  const member = members.find((m: any) => m.userId === userId);
  if (!member) return { totalPaid: 0, totalOwed: 0, totalOwing: 0, balance: 0 };

  const bal = member.balance;
  return {
    totalPaid: (member as any).totalPaid || 0,
    totalOwed: bal > 0 ? bal : 0,
    totalOwing: bal < 0 ? -bal : 0,
    balance: bal
  };
};

/**
 * Calculate balances for all members in a group using Supabase RPC
 */
export const useMembersBalance = (
  groupOrId: GroupWithDetails | string | null | undefined
) => {
  const groupId = typeof groupOrId === 'string' ? groupOrId : groupOrId?.id;
  return useQuery(membersBalanceQueryOptions(groupId));
};


/**
 * Calculate total balance across all groups for a user using Supabase RPC
 */
export const useTotalBalanceAcrossGroups = (
  groups: GroupWithDetails[] | null | undefined, // Keeping signature for compatibility but ignoring 'groups'
  userId: string | null | undefined
) => {
  const { data } = useQuery(userGlobalStatsQueryOptions(userId));
  return data || { totalPaid: 0, totalOwed: 0, totalOwing: 0, balance: 0 };
};

export interface CategoryStat {
  category: string;
  amount: number;
}


export interface GroupSpendingStats {
  totalAmount: number;
  memberCount: number;
  categoryStats: CategoryStat[];
}

export const groupSpendingStatsQueryOptions = (groupId: string | null | undefined) => queryOptions({
  queryKey: ['group-stats', groupId],
  queryFn: async () => {
    if (!groupId) return { totalAmount: 0, memberCount: 0, categoryStats: [] };

    const { data, error } = await supabase.rpc('get_group_spending_stats', {
      p_group_id: groupId
    });

    if (error) throw error;
    return data as GroupSpendingStats;
  },
  enabled: !!groupId,
});

/**
 * Calculate spending stats for a group (Total, Category breakdown)
 */
export const useGroupSpendingStats = (groupId: string | null | undefined) => {
  const { data } = useQuery(groupSpendingStatsQueryOptions(groupId));

  // Ensure default values if data is loading or null
  return data || {
    totalAmount: 0,
    memberCount: 0,
    categoryStats: []
  };
};

