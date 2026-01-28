import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '5');
        const groupId = url.searchParams.get('groupId');

        let query = supabase
            .from('expenses')
            .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
        created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
        group:groups(id, name, currency),
        expense_splits(id, user_id, amount, is_paid, user:users(id, name, avatar_url))
      `);

        if (groupId) {
            query = query.eq('group_id', groupId);
        } else {
            // If no groupId, we need to find all groups the user is in first
            // This is handled by RLS if we query directly, but we might want to be explicit
            const { data: memberships } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', user.id);

            const groupIds = memberships?.map(m => m.group_id) || [];
            if (groupIds.length === 0) return Response.json([]);
            query = query.in('group_id', groupIds);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Transform for client
        const expenses = (data || []).map((e: any) => ({
            ...e,
            groupId: e.group_id,
            paidBy: e.paid_by,
            createdBy: e.created_by,
            expenseDate: e.expense_date,
            paidByUser: e.paid_by_user ? { ...e.paid_by_user, avatarUrl: e.paid_by_user.avatar_url } : undefined,
            createdByUser: e.created_by_user ? { ...e.created_by_user, avatarUrl: e.created_by_user.avatar_url } : undefined,
            expense_splits: e.expense_splits?.map((s: any) => ({
                ...s,
                userId: s.user_id,
                user: s.user ? { ...s.user, avatarUrl: s.user.avatar_url } : undefined,
            })),
        }));

        return Response.json(expenses);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/expenses):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
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
