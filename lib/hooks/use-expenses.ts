import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as expensesService from "../services/expenses-service";
import { useAuthStore } from "../stores/auth-store";
import type { Expense, ExpenseCategory, ExpenseSplit } from "../types";
import { groupQueryOptions, groupsQueryOptions } from "./use-groups";

// ---------------------------------------------------------------------------
// Types (re-export from service for backward compat)
// ---------------------------------------------------------------------------

export type { ExpensesFilterParams, ExpensesPage } from "../services/expenses-service";

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export const recentExpensesQueryOptions = (limit = 5) =>
  queryOptions({
    queryKey: ["recent-expenses", limit],
    queryFn: () => expensesService.fetchRecentExpenses(limit),
  });

/**
 * @deprecated Use infiniteExpensesQueryOptions for the group expenses list.
 * Kept for backward-compat with mutation invalidation.
 */
export const expensesQueryOptions = (groupId: string | null) =>
  queryOptions({
    queryKey: ["expenses", groupId],
    queryFn: () => expensesService.fetchExpensesByGroup(groupId!),
    enabled: !!groupId,
  });

export const expenseQueryOptions = (expenseId: string | null) =>
  queryOptions({
    queryKey: ["expense", expenseId],
    queryFn: () => expensesService.fetchExpenseDetail(expenseId!),
    enabled: !!expenseId,
  });

export const infiniteExpensesQueryOptions = (params: expensesService.ExpensesFilterParams) =>
  infiniteQueryOptions({
    queryKey: [
      "expenses-infinite",
      params.groupId,
      params.search,
      params.category,
      params.memberId,
      params.sortBy,
    ],
    queryFn: ({ pageParam }) =>
      expensesService.fetchGroupExpenses(
        params,
        (pageParam as { cursor: string; cursorId: string } | undefined)?.cursor,
        (pageParam as { cursor: string; cursorId: string } | undefined)?.cursorId
      ),
    initialPageParam: undefined as
      | { cursor: string; cursorId: string }
      | undefined,
    getNextPageParam: (lastPage: expensesService.ExpensesPage) => {
      if (!lastPage.nextCursor || !lastPage.nextCursorId) return undefined;
      return { cursor: lastPage.nextCursor, cursorId: lastPage.nextCursorId };
    },
    enabled: !!params.groupId,
  });

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch recent expenses across all user's groups
 */
export const useRecentExpenses = (limit = 5) => {
  const session = useAuthStore((state) => state.session);
  return useQuery({
    ...recentExpensesQueryOptions(limit),
    enabled: !!session,
  });
};

/**
 * @deprecated Use useInfiniteExpenses for the group expenses list screen.
 */
export const useExpenses = (groupId: string | null) => {
  return useQuery(expensesQueryOptions(groupId));
};

/**
 * Fetch expenses for a group with infinite scroll, server-side search/filter/sort.
 */
export const useInfiniteExpenses = (params: expensesService.ExpensesFilterParams) => {
  return useInfiniteQuery(infiniteExpensesQueryOptions(params));
};

/**
 * Fetch a single expense by ID
 */
export const useExpense = (expenseId: string | null) => {
  return useQuery(expenseQueryOptions(expenseId));
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
      receiptUrl?: string;
      splits: { userId: string; amount: number }[];
    }) => {
      return expensesService.createExpense(input);
    },
    onMutate: async (newExpenseInput) => {
      const { groupId } = newExpenseInput;
      const recentKey = recentExpensesQueryOptions().queryKey;
      const listKey = expensesQueryOptions(groupId).queryKey;
      const infiniteKeyPrefix = ["expenses-infinite", groupId];

      await queryClient.cancelQueries({ queryKey: recentKey });
      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: infiniteKeyPrefix });

      const prevRecent = queryClient.getQueryData<Expense[]>(recentKey);
      const prevList = queryClient.getQueryData<(Expense & { expense_splits: ExpenseSplit[] })[]>(listKey);

      const optimisticExpense: Expense = {
        id: Date.now().toString(),
        groupId,
        paidBy: newExpenseInput.paidById || '',
        createdBy: '', // Current user
        title: newExpenseInput.title,
        description: newExpenseInput.description || null,
        amount: newExpenseInput.amount,
        category: (newExpenseInput.category as ExpenseCategory) || 'other',
        receiptUrl: newExpenseInput.receiptUrl || null,
        expenseDate: newExpenseInput.expenseDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Update recent
      queryClient.setQueryData<Expense[]>(recentKey, (old) => [optimisticExpense, ...(old || [])].slice(0, 5));

      // Update list
      queryClient.setQueryData<(Expense & { expense_splits: ExpenseSplit[] })[]>(listKey, (old) => [{ ...optimisticExpense, expense_splits: [] }, ...(old || [])]);

      // Update infinite queries (all matching the prefix)
      queryClient.setQueriesData<{ pages: expensesService.ExpensesPage[]; pageParams: any[] }>(
        { queryKey: infiniteKeyPrefix },
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;

          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [{ ...optimisticExpense, expense_splits: [] }, ...firstPage.data],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      return { prevRecent, prevList };
    },
    onError: (err, { groupId }, context) => {
      if (context?.prevRecent) queryClient.setQueryData(recentExpensesQueryOptions().queryKey, context.prevRecent);
      if (context?.prevList) queryClient.setQueryData(expensesQueryOptions(groupId).queryKey, context.prevList);
    },
    onSettled: (_, __, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses-infinite", groupId] });
      queryClient.invalidateQueries({ queryKey: expensesQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: recentExpensesQueryOptions().queryKey });
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
      category?: ExpenseCategory;
      description?: string;
      receiptUrl?: string;
      paidById?: string;
      splits?: { userId: string; amount: number }[];
    }) => {
      return expensesService.updateExpense(expenseId, updates);
    },
    onMutate: async ({ expenseId, groupId, ...updates }) => {
      const recentKey = recentExpensesQueryOptions().queryKey;
      const listKey = expensesQueryOptions(groupId).queryKey;
      const detailKey = expenseQueryOptions(expenseId).queryKey;
      const infiniteKeyPrefix = ["expenses-infinite", groupId];

      await queryClient.cancelQueries({ queryKey: recentKey });
      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: infiniteKeyPrefix });

      const prevRecent = queryClient.getQueryData<Expense[]>(recentKey);
      const prevList = queryClient.getQueryData<(Expense & { expense_splits: ExpenseSplit[] })[]>(listKey);
      const prevDetail = queryClient.getQueryData<Expense & { expense_splits: ExpenseSplit[]; group?: { id: string; name: string; currency: string } }>(detailKey);

      const updateItem = (item: any) => item.id === expenseId ? { ...item, ...updates } : item;

      queryClient.setQueryData<Expense[]>(recentKey, (old) => old?.map(updateItem));
      queryClient.setQueryData<(Expense & { expense_splits: ExpenseSplit[] })[]>(listKey, (old) => old?.map(updateItem));
      if (prevDetail) queryClient.setQueryData(detailKey, { ...prevDetail, ...updates });

      queryClient.setQueriesData<{ pages: expensesService.ExpensesPage[]; pageParams: any[] }>(
        { queryKey: infiniteKeyPrefix },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.map(updateItem),
            })),
          };
        }
      );

      return { prevRecent, prevList, prevDetail };
    },
    onError: (err, { expenseId, groupId }, context) => {
      if (context?.prevRecent) queryClient.setQueryData(recentExpensesQueryOptions().queryKey, context.prevRecent);
      if (context?.prevList) queryClient.setQueryData(expensesQueryOptions(groupId).queryKey, context.prevList);
      if (context?.prevDetail) queryClient.setQueryData(expenseQueryOptions(expenseId).queryKey, context.prevDetail);
    },
    onSettled: (_, __, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses-infinite", groupId] });
      queryClient.invalidateQueries({ queryKey: expensesQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: recentExpensesQueryOptions().queryKey });
    },
  });
};

/**
 * Delete an expense
 */
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      expenseId,
    }: {
      expenseId: string;
      groupId: string;
    }) => {
      return expensesService.deleteExpense(expenseId);
    },
    onMutate: async ({ expenseId, groupId }) => {
      const recentKey = recentExpensesQueryOptions().queryKey;
      const listKey = expensesQueryOptions(groupId).queryKey;
      const infiniteKeyPrefix = ["expenses-infinite", groupId];

      await queryClient.cancelQueries({ queryKey: recentKey });
      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: infiniteKeyPrefix });

      const prevRecent = queryClient.getQueryData<Expense[]>(recentKey);
      const prevList = queryClient.getQueryData<(Expense & { expense_splits: ExpenseSplit[] })[]>(listKey);

      queryClient.setQueryData<Expense[]>(recentKey, (old) => old?.filter(e => e.id !== expenseId));
      queryClient.setQueryData<(Expense & { expense_splits: ExpenseSplit[] })[]>(listKey, (old) => old?.filter(e => e.id !== expenseId));

      queryClient.setQueriesData<{ pages: expensesService.ExpensesPage[]; pageParams: any[] }>(
        { queryKey: infiniteKeyPrefix },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.filter(e => e.id !== expenseId),
            })),
          };
        }
      );

      return { prevRecent, prevList };
    },
    onError: (err, { groupId }, context) => {
      if (context?.prevRecent) queryClient.setQueryData(recentExpensesQueryOptions().queryKey, context.prevRecent);
      if (context?.prevList) queryClient.setQueryData(expensesQueryOptions(groupId).queryKey, context.prevList);
    },
    onSettled: (_, __, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses-infinite", groupId] });
      queryClient.invalidateQueries({ queryKey: expensesQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: recentExpensesQueryOptions().queryKey });
    },
  });
};
