import { useMemo } from 'react';
import type { Group, GroupWithDetails } from '../types';

interface BalanceStats {
  totalPaid: number; // Total amount user has spent
  totalOwed: number; // Amount others owe to user
  totalOwing: number; // Amount user owes to others
  balance: number; // Net balance
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
      return { totalPaid: 0, totalOwed: 0, totalOwing: 0, balance: 0 };
    }

    const groupData = group as any;
    let totalPaid = 0;
    let othersOweMe = 0;
    let iOweOthers = 0;

    groupData.expenses?.forEach((expense: any) => {
      if (expense.paid_by === userId) {
        totalPaid += expense.amount;
        // Calculate what others owe me from this expense
        expense.expense_splits?.forEach((split: any) => {
          if (split.user_id !== userId) {
            othersOweMe += split.amount;
          }
        });
      } else {
        // Someone else paid, calculate what I owe
        expense.expense_splits?.forEach((split: any) => {
          if (split.user_id === userId) {
            iOweOthers += split.amount;
          }
        });
      }
    });

    return {
      totalPaid,
      totalOwed: othersOweMe,
      totalOwing: iOweOthers,
      balance: othersOweMe - iOweOthers,
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
      return { totalPaid: 0, totalOwed: 0, totalOwing: 0, balance: 0 };
    }

    let totalPaidOverall = 0;
    let totalOwedOthersToMe = 0;
    let totalOwingMeToOthers = 0;

    groups.forEach((group: any) => {
      group.expenses?.forEach((expense: any) => {
        if (expense.paid_by === userId) {
          totalPaidOverall += expense.amount;
          // Others owe to user
          expense.expense_splits?.forEach((split: any) => {
            if (split.user_id !== userId) {
              totalOwedOthersToMe += split.amount;
            }
          });
        } else {
          // User owes to others
          expense.expense_splits?.forEach((split: any) => {
            if (split.user_id === userId) {
              totalOwingMeToOthers += split.amount;
            }
          });
        }
      });
    });

    return {
      totalPaid: totalPaidOverall,
      totalOwed: totalOwedOthersToMe,
      totalOwing: totalOwingMeToOthers,
      balance: totalOwedOthersToMe - totalOwingMeToOthers,
    };
  }, [groups, userId]);
};
