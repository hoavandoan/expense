import { queryOptions, useQuery } from '@tanstack/react-query';
import * as searchService from '../services/search-service';
import type { Expense, Group, User } from '../types';

export const searchQueryOptions = (query: string, options?: { limit?: number }) => queryOptions({
  queryKey: ['search', query, options],
  queryFn: () => searchService.searchAll(query, options?.limit),
  enabled: !!query && query.trim().length >= 2,
  staleTime: 30000,
});

/**
 * Search expenses, groups, and users
 */
export const useSearch = (query: string, options?: { limit?: number }) => {
  return useQuery(searchQueryOptions(query, options));
};
