import { getServerSupabase } from '../../../lib/supabase-server';

export async function GET(request: Request, { id }: { id: string }) {
    try {
        const { supabase } = await getServerSupabase(request);

        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
        created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
        expense_splits(id, user_id, amount, is_paid, user:users(id, name, avatar_url)),
        group:groups(id, name, currency)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Transform for client
        const expense = {
            ...data,
            groupId: data.group_id,
            paidBy: data.paid_by,
            createdBy: data.created_by,
            expenseDate: data.expense_date,
            paidByUser: data.paid_by_user ? { ...data.paid_by_user, avatarUrl: data.paid_by_user.avatar_url } : undefined,
            createdByUser: data.created_by_user ? { ...data.created_by_user, avatarUrl: data.created_by_user.avatar_url } : undefined,
            expense_splits: data.expense_splits?.map((s: any) => ({
                ...s,
                userId: s.user_id,
                user: s.user ? { ...s.user, avatarUrl: s.user.avatar_url } : undefined,
            })),
        };

        return Response.json(expense);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error(`API Error (GET /api/expenses/${id}):`, error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { id }: { id: string }) {
    try {
        const { supabase } = await getServerSupabase(request);
        const body = await request.json();

        // 1. Update expense details
        const { data, error } = await supabase
            .from('expenses')
            .update({
                title: body.title,
                amount: body.amount,
                category: body.category,
                description: body.description,
                receipt_url: body.receiptUrl,
                paid_by: body.paidById,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // 2. Update splits if provided
        if (body.splits) {
            // Delete existing splits
            const { error: deleteError } = await supabase
                .from('expense_splits')
                .delete()
                .eq('expense_id', id);

            if (deleteError) throw deleteError;

            // Insert new splits
            const { error: insertError } = await supabase
                .from('expense_splits')
                .insert(
                    body.splits.map((split: any) => ({
                        expense_id: id,
                        user_id: split.userId,
                        amount: split.amount,
                    }))
                );

            if (insertError) throw insertError;
        }

        return Response.json(data);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error(`API Error (PATCH /api/expenses/${id}):`, error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { id }: { id: string }) {
    try {
        const { supabase } = await getServerSupabase(request);

        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return new Response(null, { status: 204 });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error(`API Error (DELETE /api/expenses/${id}):`, error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
