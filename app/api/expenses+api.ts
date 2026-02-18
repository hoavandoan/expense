import { getServerSupabase } from '../../lib/supabase-server';

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: Request) {
    try {
        const { supabase } = await getServerSupabase(request);
        const url = new URL(request.url);

        const groupId = url.searchParams.get('groupId');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || String(DEFAULT_PAGE_SIZE)), 100);
        const search = url.searchParams.get('search')?.trim() || '';
        const category = url.searchParams.get('category') || '';
        const memberId = url.searchParams.get('memberId') || '';
        const sortBy = url.searchParams.get('sortBy') === 'amount' ? 'amount' : 'date';
        const cursor = url.searchParams.get('cursor') || '';
        const cursorId = url.searchParams.get('cursorId') || '';

        // Recent expenses endpoint (no groupId, no pagination)
        if (!groupId) {
            const recentLimit = Math.min(parseInt(url.searchParams.get('limit') || '5'), 50);
            const { data: memberships } = await supabase
                .from('group_members')
                .select('group_id');

            const groupIds = memberships?.map((m) => m.group_id) || [];
            if (groupIds.length === 0) return Response.json([]);

            const { data, error } = await supabase
                .from('expenses')
                .select(`
                    *,
                    paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
                    created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
                    group:groups(id, name, currency),
                    expense_splits(id, user_id, amount, is_paid, user:users(id, name, avatar_url))
                `)
                .in('group_id', groupIds)
                .order('created_at', { ascending: false })
                .limit(recentLimit);

            if (error) throw error;
            return Response.json(transformExpenses(data || []));
        }

        // Build base query with all joins
        let query = supabase
            .from('expenses')
            .select(`
                *,
                paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
                created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
                group:groups(id, name, currency),
                expense_splits(id, user_id, amount, is_paid, user:users(id, name, avatar_url))
            `)
            .eq('group_id', groupId);

        // Server-side search: title or description ILIKE
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Category filter
        if (category) {
            query = query.eq('category', category);
        }

        // Member filter: paid_by OR has a split for this user
        if (memberId) {
            // Fetch expense IDs where this member has a split
            const { data: splitExpenseIds } = await supabase
                .from('expense_splits')
                .select('expense_id')
                .eq('user_id', memberId);

            const splitIds = splitExpenseIds?.map((s) => s.expense_id) || [];

            if (splitIds.length > 0) {
                query = query.or(`paid_by.eq.${memberId},id.in.(${splitIds.join(',')})`);
            } else {
                query = query.eq('paid_by', memberId);
            }
        }

        // Cursor-based pagination
        if (sortBy === 'amount') {
            // Sort by amount DESC, then id ASC as tie-breaker
            if (cursor && cursorId) {
                const cursorAmount = parseFloat(cursor);
                query = query.or(
                    `amount.lt.${cursorAmount},and(amount.eq.${cursorAmount},id.gt.${cursorId})`
                );
            }
            query = query.order('amount', { ascending: false }).order('id', { ascending: true });
        } else {
            // Sort by expense_date DESC, then id ASC as tie-breaker
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

        return Response.json({
            data: transformExpenses(pageData),
            nextCursor,
            nextCursorId,
        });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/expenses):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

function transformExpenses(data: any[]) {
    return data.map((e) => ({
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
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();

        // 1. Create expense
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert({
                group_id: body.groupId,
                paid_by: body.paidById || user.id,
                created_by: user.id,
                title: body.title,
                amount: body.amount,
                category: body.category || 'other',
                description: body.description || null,
                receipt_url: body.receiptUrl || null,
                expense_date: body.expenseDate || new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

        if (expenseError) throw expenseError;

        // 2. Create splits
        if (body.splits && body.splits.length > 0) {
            const { error: splitsError } = await supabase
                .from('expense_splits')
                .insert(
                    body.splits.map((split: any) => ({
                        expense_id: expense.id,
                        user_id: split.userId,
                        amount: split.amount,
                    }))
                );

            if (splitsError) throw splitsError;
        }

        return Response.json(expense);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (POST /api/expenses):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
