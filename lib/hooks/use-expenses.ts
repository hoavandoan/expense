import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { useAuthStore } from "../stores/auth-store";
import type { Expense, ExpenseSplit } from "../types";
import { groupQueryOptions, groupsQueryOptions } from "./use-groups";

export const recentExpensesQueryOptions = (limit = 5) => queryOptions({
  queryKey: ["recent-expenses", limit],
  queryFn: () => apiClient<Expense[]>(`/expenses?limit=${limit}`),
});

export const expensesQueryOptions = (groupId: string | null) => queryOptions({
  queryKey: ["expenses", groupId],
  queryFn: () => apiClient<(Expense & { expense_splits: ExpenseSplit[] })[]>(`/expenses?groupId=${groupId}`),
  enabled: !!groupId,
});

export const expenseQueryOptions = (expenseId: string | null) => queryOptions({
  queryKey: ["expense", expenseId],
  queryFn: () => apiClient<Expense & {
    expense_splits: ExpenseSplit[];
    group?: { id: string; name: string; currency: string };
  }>(`/expenses/${expenseId}`),
  enabled: !!expenseId,
});

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
 * Fetch expenses for a group
 */
export const useExpenses = (groupId: string | null) => {
  return useQuery(expensesQueryOptions(groupId));
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
      return apiClient<Expense>("/expenses", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    onSuccess: (_, { groupId }) => {
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
      category?: string;
      description?: string;
      receiptUrl?: string;
      paidById?: string;
      splits?: { userId: string; amount: number }[];
    }) => {
      return apiClient<Expense>(`/expenses/${expenseId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (_, { groupId }) => {
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
      groupId,
    }: {
      expenseId: string;
      groupId: string;
    }) => {
      return apiClient(`/expenses/${expenseId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: expensesQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupQueryOptions(groupId).queryKey });
      queryClient.invalidateQueries({ queryKey: groupsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: recentExpensesQueryOptions().queryKey });
    },
  });
};

