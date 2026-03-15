import { getServerSupabase } from '../../../lib/supabase-server';

export async function GET(request: Request, { id }: { id: string }) {
    try {
        const { supabase } = await getServerSupabase(request);

        const { data, error } = await supabase
            .from('groups')
            .select(`
        *,
        group_members(
          id, user_id, role, joined_at,
          user:users(id, name, email, avatar_url)
        ),
        expenses(
          id, title, description, amount, category, paid_by, created_by, expense_date, created_at,
          paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
          created_by_user:users!expenses_created_by_fkey(id, name, avatar_url),
          expense_splits(id, user_id, amount, is_paid)
        )
      `)
            .eq('id', id)
            .order('created_at', { ascending: false, referencedTable: 'expenses' })
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return Response.json({ error: 'Group not found' }, { status: 404 });
        }

        // Transform for client
        const group = {
            ...data,
            inviteCode: data.invite_code,
            coverImageUrl: data.cover_image_url,
            members: data.group_members?.map((m: any) => ({
                ...m,
                userId: m.user_id,
                joinedAt: m.joined_at,
                user: m.user ? {
                    ...m.user,
                    avatarUrl: m.user.avatar_url,
                } : undefined,
            })),
            expenses: data.expenses?.map((e: any) => ({
                ...e,
                paidBy: e.paid_by,
                createdBy: e.created_by,
                expenseDate: e.expense_date,
                paidByUser: e.paid_by_user ? { ...e.paid_by_user, avatarUrl: e.paid_by_user.avatar_url } : undefined,
                createdByUser: e.created_by_user ? { ...e.created_by_user, avatarUrl: e.created_by_user.avatar_url } : undefined,
                expense_splits: e.expense_splits?.map((s: any) => ({
                    ...s,
                    userId: s.user_id,
                })),
            })),
            memberCount: data.group_members?.length || 0,
            totalExpenses: data.expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0,
        };

        return Response.json(group);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error(`API Error (GET /api/groups/${id}):`, error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { id }: { id: string }) {
    try {
        const { supabase } = await getServerSupabase(request);
        const body = await request.json();

        const { data, error } = await supabase
            .from('groups')
            .update({
                name: body.name,
                description: body.description,
                cover_image_url: body.coverImageUrl,
                currency: body.currency,
                group_type: body.groupType,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const group = {
            ...data,
            inviteCode: data.invite_code,
            coverImageUrl: data.cover_image_url,
        };

        return Response.json(group);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error(`API Error (PATCH /api/groups/${id}):`, error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { id }: { id: string }) {
    try {
        const { supabase, user } = await getServerSupabase(request);

        // Parse body to determine action
        const body = await request.json().catch(() => ({}));
        const action = body.action;

        // Remove a member from group (owner/admin only)
        if (action === 'remove-member') {
            const { userId } = body;

            if (!userId) {
                return Response.json(
                    { error: 'userId is required' },
                    { status: 400 }
                );
            }

            if (userId === user.id) {
                return Response.json(
                    { error: 'Cannot remove yourself. Use leave group instead.' },
                    { status: 400 }
                );
            }

            // Check requesting user's role
            const { data: requestingMember } = await supabase
                .from('group_members')
                .select('role')
                .eq('group_id', id)
                .eq('user_id', user.id)
                .single();

            if (!requestingMember) {
                return Response.json(
                    { error: 'You are not a member of this group' },
                    { status: 403 }
                );
            }

            const isOwnerOrAdmin = requestingMember.role === 'owner' || requestingMember.role === 'admin';
            if (!isOwnerOrAdmin) {
                return Response.json(
                    { error: 'Only owner or admin can remove members' },
                    { status: 403 }
                );
            }

            // Check target member exists and is not owner
            const { data: targetMember } = await supabase
                .from('group_members')
                .select('role')
                .eq('group_id', id)
                .eq('user_id', userId)
                .single();

            if (!targetMember) {
                return Response.json(
                    { error: 'Member not found in this group' },
                    { status: 404 }
                );
            }

            if (targetMember.role === 'owner') {
                return Response.json(
                    { error: 'Cannot remove the group owner' },
                    { status: 403 }
                );
            }

            const { error: deleteError } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', id)
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            return new Response(null, { status: 204 });
        }

        // Default: leave group or delete group
        const { data: member } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', id)
            .eq('user_id', user.id)
            .single();

        if (member?.role === 'owner') {
            return Response.json(
                { error: 'Owner cannot leave the group. Transfer ownership first or delete the group.' },
                { status: 403 }
            );
        }

        // Leave group (non-owner only)
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', id)
            .eq('user_id', user.id);
        if (error) throw error;

        return new Response(null, { status: 204 });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error(`API Error (DELETE /api/groups/${id}):`, error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
