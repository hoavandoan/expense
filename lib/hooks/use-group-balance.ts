import { useMemo } from 'react';
import type { Group, GroupWithDetails } from '../types';

interface BalanceStats {
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

interface MemberBalance {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  balance: number;
}

/**
 * Calculate balance for a specific user in a group
 */
export const useUserBalanceInGroup = (
  group: GroupWithDetails | null | undefined,
  userId: string | null | undefined
): BalanceStats => {
  return useMemo(() => {
    if (!group || !userId) {
      return { totalPaid: 0, totalOwed: 0, balance: 0 };
    }

    const groupData = group as any;
    let totalPaid = 0;
    let totalOwed = 0;

    groupData.expenses?.forEach((expense: any) => {
      // Money user has paid
      if (expense.paid_by === userId) {
        totalPaid += expense.amount;
      }

      // Money user owes from splits
      expense.expense_splits?.forEach((split: any) => {
        if (split.user_id === userId) {
          totalOwed += split.amount;
        }
      });
    });

    return {
      totalPaid,
      totalOwed,
      balance: totalPaid - totalOwed,
    };
  }, [group, userId]);
};

/**
 * Calculate balances for all members in a group
 */
export const useMembersBalance = (
  group: GroupWithDetails | null | undefined
): MemberBalance[] => {
  return useMemo(() => {
    const groupData = group as any;
    if (!groupData?.group_members) {
      return [];
    }

    return groupData.group_members.map((member: any) => {
      let balance = 0;

      groupData.expenses?.forEach((expense: any) => {
        // Money this member has paid
        if (expense.paid_by === member.user_id) {
          balance += expense.amount;
        }

        // Money this member owes from splits
        expense.expense_splits?.forEach((split: any) => {
          if (split.user_id === member.user_id) {
            balance -= split.amount;
          }
        });
      });

      return {
        userId: member.user_id,
        name: member.user?.name || 'Thành viên',
        avatarUrl: member.user?.avatar_url,
        role: member.role,
        balance,
      };
    });
  }, [group]);
};

/**
 * Calculate total balance across all groups for a user
 */
export const useTotalBalanceAcrossGroups = (
  groups: Group[] | null | undefined,
  userId: string | null | undefined
): BalanceStats => {
  return useMemo(() => {
    if (!groups || !userId) {
      return { totalOwed: 0, totalOwing: 0, balance: 0 };
    }

    let totalOwed = 0; // Others owe to user
    let totalOwing = 0; // User owes to others

    groups.forEach((group: any) => {
      group.expenses?.forEach((expense: any) => {
        if (expense.paid_by === userId) {
          // User paid, others owe to user
          expense.expense_splits?.forEach((split: any) => {
            if (split.user_id !== userId) {
              totalOwed += split.amount;
            }
          });
        } else {
          // Someone else paid, check if user owes
          expense.expense_splits?.forEach((split: any) => {
            if (split.user_id === userId) {
              totalOwing += split.amount;
            }
          });
        }
      });
    });

    return {
      totalPaid: totalOwed,
      totalOwed,
      totalOwing,
      balance: totalOwed - totalOwing,
    };
  }, [groups, userId]);
};
