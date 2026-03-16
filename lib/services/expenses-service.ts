import { supabase } from '../supabase';
import type { Expense, ExpenseSplit } from '../types';

const DEFAULT_PAGE_SIZE = 20;

export interface ExpensesFilterParams {
    groupId: string;
    search?: string;
    category?: string;
    memberId?: string;
    sortBy?: 'date' | 'amount';
}

export interface ExpensesPage {
    data: (Expense & { expense_splits: ExpenseSplit[] })[];
    nextCursor: string | null;
    nextCursorId: string | null;
}

const EXPENSE_SELECT = `
    *,
    paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
    created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
    group:groups(id, name, currency),
    expense_splits(id, user_id, amount, is_paid, user:users(id, name, avatar_url))
`;

// Transform snake_case DB row → camelCase Expense
const transformExpenses = (data: any[]) =>
    data.map((e) => ({
        ...e,
        groupId: e.group_id,
        paidBy: e.paid_by,
        createdBy: e.created_by,
        expenseDate: e.expense_date,
        paidByUser: e.paid_by_user
            ? { ...e.paid_by_user, avatarUrl: e.paid_by_user.avatar_url }
            : undefined,
        createdByUser: e.created_by_user
            ? { ...e.created_by_user, avatarUrl: e.created_by_user.avatar_url }
            : undefined,
        expense_splits: e.expense_splits?.map((s: any) => ({
            ...s,
            userId: s.user_id,
            user: s.user ? { ...s.user, avatarUrl: s.user.avatar_url } : undefined,
        })),
    }));

/**
 * Fetch recent expenses across all groups the user belongs to
 */
export const fetchRecentExpenses = async (limit = 5): Promise<Expense[]> => {
    const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id');

    const groupIds = memberships?.map((m) => m.group_id) || [];
    if (groupIds.length === 0) return [];

    const recentLimit = Math.min(limit, 50);
    const { data, error } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(recentLimit);

    if (error) throw error;
    return transformExpenses(data || []);
};

/**
 * Fetch paginated expenses for a group with filters (cursor-based pagination)
 */
export const fetchGroupExpenses = async (
    params: ExpensesFilterParams,
    cursor?: string,
    cursorId?: string
): Promise<ExpensesPage> => {
    const limit = DEFAULT_PAGE_SIZE;

    let query = supabase
        .from('expenses')
        .select(EXPENSE_SELECT)
        .eq('group_id', params.groupId);

    // Server-side search
    if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // Category filter
    if (params.category) {
        query = query.eq('category', params.category);
    }

    // Member filter: paid_by OR has a split for this user
    if (params.memberId) {
        const { data: splitExpenseIds } = await supabase
            .from('expense_splits')
            .select('expense_id')
            .eq('user_id', params.memberId);

        const splitIds = splitExpenseIds?.map((s) => s.expense_id) || [];

        if (splitIds.length > 0) {
            query = query.or(`paid_by.eq.${params.memberId},id.in.(${splitIds.join(',')})`);
        } else {
            query = query.eq('paid_by', params.memberId);
        }
    }

    // Cursor-based pagination
    const sortBy = params.sortBy ?? 'date';
    if (sortBy === 'amount') {
        if (cursor && cursorId) {
            const cursorAmount = parseFloat(cursor);
            query = query.or(
                `amount.lt.${cursorAmount},and(amount.eq.${cursorAmount},id.gt.${cursorId})`
            );
        }
        query = query.order('amount', { ascending: false }).order('id', { ascending: true });
    } else {
        if (cursor && cursorId) {
            query = query.or(
                `expense_date.lt.${cursor},and(expense_date.eq.${cursor},id.gt.${cursorId})`
            );
        }
        query = query.order('expense_date', { ascending: false }).order('id', { ascending: true });
    }

    const { data, error } = await query.limit(limit + 1);

    if (error) throw error;

    const hasNextPage = (data || []).length > limit;
    const pageData = hasNextPage ? data!.slice(0, limit) : (data || []);
    const lastItem = pageData.length > 0 ? pageData[pageData.length - 1] : null;

    const nextCursor = hasNextPage && lastItem
        ? sortBy === 'amount'
            ? String(lastItem.amount)
            : (lastItem.expense_date ?? lastItem.created_at)
        : null;
    const nextCursorId = hasNextPage && lastItem ? lastItem.id : null;

    return {
        data: transformExpenses(pageData),
        nextCursor,
        nextCursorId,
    };
};

/**
 * Fetch expenses for a group without pagination (legacy)
 */
export const fetchExpensesByGroup = async (
    groupId: string
): Promise<(Expense & { expense_splits: ExpenseSplit[] })[]> => {
    const { data, error } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return transformExpenses(data || []);
};

/**
 * Fetch a single expense by ID
 */
export const fetchExpenseDetail = async (
    expenseId: string
): Promise<Expense & { expense_splits: ExpenseSplit[]; group?: { id: string; name: string; currency: string } }> => {
    const { data, error } = await supabase
        .from('expenses')
        .select(`
            *,
            paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
            created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
            expense_splits(id, user_id, amount, is_paid, user:users(id, name, avatar_url)),
            group:groups(id, name, currency)
        `)
        .eq('id', expenseId)
        .single();

    if (error) throw error;

    return {
        ...data,
        groupId: data.group_id,
        paidBy: data.paid_by,
        createdBy: data.created_by,
        expenseDate: data.expense_date,
        paidByUser: data.paid_by_user
            ? { ...data.paid_by_user, avatarUrl: data.paid_by_user.avatar_url }
            : undefined,
        createdByUser: data.created_by_user
            ? { ...data.created_by_user, avatarUrl: data.created_by_user.avatar_url }
            : undefined,
        expense_splits: data.expense_splits?.map((s: any) => ({
            ...s,
            userId: s.user_id,
            user: s.user ? { ...s.user, avatarUrl: s.user.avatar_url } : undefined,
        })),
    };
};

/**
 * Create a new expense with splits
 */
export const createExpense = async (input: {
    groupId: string;
    title: string;
    amount: number;
    paidById?: string;
    category?: string;
    description?: string;
    expenseDate?: string;
    receiptUrl?: string;
    splits: { userId: string; amount: number }[];
}): Promise<Expense> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Create expense
    const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
            group_id: input.groupId,
            paid_by: input.paidById || user.id,
            created_by: user.id,
            title: input.title,
            amount: input.amount,
            category: input.category || 'other',
            description: input.description || null,
            receipt_url: input.receiptUrl || null,
            expense_date: input.expenseDate || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

    if (expenseError) throw expenseError;

    // 2. Create splits
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

    return expense;
};

/**
 * Update an expense
 */
export const updateExpense = async (
    expenseId: string,
    updates: {
        title?: string;
        amount?: number;
        category?: string;
        description?: string;
        receiptUrl?: string;
        paidById?: string;
        splits?: { userId: string; amount: number }[];
    }
): Promise<Expense> => {
    // 1. Update expense details
    const { data, error } = await supabase
        .from('expenses')
        .update({
            title: updates.title,
            amount: updates.amount,
            category: updates.category,
            description: updates.description,
            receipt_url: updates.receiptUrl,
            paid_by: updates.paidById,
        })
        .eq('id', expenseId)
        .select()
        .single();

    if (error) throw error;

    // 2. Update splits if provided
    if (updates.splits) {
        // Delete existing splits
        const { error: deleteError } = await supabase
            .from('expense_splits')
            .delete()
            .eq('expense_id', expenseId);

        if (deleteError) throw deleteError;

        // Insert new splits
        const { error: insertError } = await supabase
            .from('expense_splits')
            .insert(
                updates.splits.map((split) => ({
                    expense_id: expenseId,
                    user_id: split.userId,
                    amount: split.amount,
                }))
            );

        if (insertError) throw insertError;
    }

    return data;
};

/**
 * Delete an expense
 */
export const deleteExpense = async (expenseId: string): Promise<void> => {
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

    if (error) throw error;
};
