import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Expense, ExpenseSplit } from '../types';

/**
 * Fetch recent expenses across all user's groups
 */
export const useRecentExpenses = (limit: number = 5) => {
    return useQuery({
        queryKey: ['recent-expenses', limit],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // Get all group IDs the user is a member of
            const { data: memberships, error: membershipError } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', user.id);

            if (membershipError) throw membershipError;
            if (!memberships || memberships.length === 0) return [];

            const groupIds = memberships.map(m => m.group_id);

            // Fetch recent expenses from those groups
            const { data, error } = await supabase
                .from('expenses')
                .select(`
                    *,
                    paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
                    group:groups(id, name, currency)
                `)
                .in('group_id', groupIds)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        },
    });
};

/**
 * Fetch expenses for a group
 */
export const useExpenses = (groupId: string | null) => {
    return useQuery({
        queryKey: ['expenses', groupId],
        queryFn: async () => {
            if (!groupId) return [];

            const { data, error } = await supabase
                .from('expenses')
                .select(`
          *,
          paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
          expense_splits(id, user_id, amount, is_paid, user:users(id, name, avatar_url))
        `)
                .eq('group_id', groupId)
                .order('expense_date', { ascending: false });

            if (error) throw error;
            return data as (Expense & { expense_splits: ExpenseSplit[] })[];
        },
        enabled: !!groupId,
    });
};


/**
 * Create a new expense with splits
 */
export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            groupId: string;
            title: string;
            amount: number;
            paidById?: string;
            category?: string;
            description?: string;
            expenseDate?: string;
            splits: { userId: string; amount: number }[];
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Create expense
            const { data: expense, error: expenseError } = await supabase
                .from('expenses')
                .insert({
                    group_id: input.groupId,
                    paid_by: input.paidById || user.id,
                    title: input.title,
                    amount: input.amount,
                    category: input.category || 'other',
                    description: input.description || null,
                    expense_date: input.expenseDate || new Date().toISOString().split('T')[0],
                })
                .select()
                .single();

            if (expenseError) throw expenseError;

            // Create splits
            if (input.splits.length > 0) {
                const { error: splitsError } = await supabase
                    .from('expense_splits')
                    .insert(
                        input.splits.map((split) => ({
                            expense_id: expense.id,
                            user_id: split.userId,
                            amount: split.amount,
                        }))
                    );

                if (splitsError) throw splitsError;
            }

            return expense as Expense;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
};

/**
 * Update an expense
 */
export const useUpdateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            expenseId,
            groupId,
            ...updates
        }: {
            expenseId: string;
            groupId: string;
            title?: string;
            amount?: number;
            category?: string;
            description?: string;
        }) => {
            const { data, error } = await supabase
                .from('expenses')
                .update(updates)
                .eq('id', expenseId)
                .select()
                .single();

            if (error) throw error;
            return data as Expense;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
        },
    });
};

/**
 * Delete an expense
 */
export const useDeleteExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ expenseId, groupId }: { expenseId: string; groupId: string }) => {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId);

            if (error) throw error;
        },
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
};
