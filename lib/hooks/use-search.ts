import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Expense, Group } from '../types';

const SEARCH_KEY = ['search'];

/**
 * Search expenses, groups, and users
 */
export const useSearch = (query: string, options?: { limit?: number }) => {
  return useQuery({
    queryKey: [...SEARCH_KEY, query, options],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return {
          expenses: [],
          groups: [],
          users: [],
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const searchQuery = query.trim();
      const limit = options?.limit || 10;

      // Get user's group IDs
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const groupIds = memberships?.map((m) => m.group_id) || [];

      // Search expenses in user's groups
      const expensesPromise = groupIds.length > 0
        ? supabase
            .from('expenses')
            .select(`
              id, title, description, amount, category, created_at,
              paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
              group:groups(id, name, currency)
            `)
            .in('group_id', groupIds)
            .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            .order('created_at', { ascending: false })
            .limit(limit)
        : Promise.resolve({ data: [], error: null });

      // Search groups user is member of
      const groupsPromise = supabase
        .from('groups')
        .select('id, name, description, cover_image_url, currency')
        .in('id', groupIds)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Search users in user's groups
      const usersPromise = groupIds.length > 0
        ? supabase
            .from('group_members')
            .select(`
              user:users(id, name, email, avatar_url)
            `)
            .in('group_id', groupIds)
            .neq('user_id', user.id)
            .limit(limit)
            .then((result) => {
              if (result.error) throw result.error;
              // Filter users by search query
              const users = (result.data || [])
                .map((m: any) => m.user)
                .filter((u: any) => 
                  u && (
                    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                );
              return { data: users, error: null };
            })
        : Promise.resolve({ data: [], error: null });

      const [expensesResult, groupsResult, usersResult] = await Promise.all([
        expensesPromise,
        groupsPromise,
        usersPromise,
      ]);

      if (expensesResult.error) throw expensesResult.error;
      if (groupsResult.error) throw groupsResult.error;
      if (usersResult.error) throw usersResult.error;

      return {
        expenses: (expensesResult.data || []).map((e: any) => ({
          id: e.id,
          groupId: e.group?.id || '',
          paidBy: '',
          title: e.title,
          description: e.description,
          amount: e.amount,
          category: e.category,
          receiptUrl: null,
          expenseDate: e.created_at,
          createdAt: e.created_at,
          paidByUser: e.paid_by_user ? {
            id: e.paid_by_user.id,
            name: e.paid_by_user.name,
            avatarUrl: e.paid_by_user.avatar_url,
            email: '',
            createdAt: '',
          } : undefined,
        })) as Expense[],
        groups: (groupsResult.data || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          coverImageUrl: g.cover_image_url,
          inviteCode: '',
          currency: g.currency,
          groupType: 'other' as const,
          createdBy: '',
          createdAt: '',
        })) as Group[],
        users: (usersResult.data || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatar_url,
          createdAt: '',
        })),
      };
    },
    enabled: !!query && query.trim().length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });
};
