import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase } = await getServerSupabase(request);
        const url = new URL(request.url);
        const groupId = url.searchParams.get('groupId');

        if (!groupId) return Response.json({ error: 'groupId is required' }, { status: 400 });

        const { data, error } = await supabase
            .from('debt_assignments')
            .select(`
        *,
        assignee_user:users!debt_assignments_assignee_user_id_fkey(id, name, avatar_url),
        assigned_by_user:users!debt_assignments_assigned_by_user_id_fkey(id, name, avatar_url)
      `)
            .eq('group_id', groupId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;

        // Transform
        const assignment = data ? {
            ...data,
            groupId: data.group_id,
            assigneeUserId: data.assignee_user_id,
            assignedByUserId: data.assigned_by_user_id,
            assigneeUser: data.assignee_user ? { ...data.assignee_user, avatarUrl: data.assignee_user.avatar_url } : undefined,
            assignedByUser: data.assigned_by_user ? { ...data.assigned_by_user, avatarUrl: data.assigned_by_user.avatar_url } : undefined,
        } : null;

        return Response.json(assignment);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/debt-assignments):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();
        const { groupId, assigneeUserId, reason, action } = body;

        if (action === 'disable') {
            const { error } = await supabase
                .from('debt_assignments')
                .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
                .eq('group_id', groupId)
                .eq('status', 'active');

            if (error) throw error;

            await supabase.from('groups').update({ has_debt_assignment: false }).eq('id', groupId);
            return Response.json({ success: true });
        }

        // 1. Deactivate any existing active assignment
        await supabase
            .from('debt_assignments')
            .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
            .eq('group_id', groupId)
            .eq('status', 'active');

        // 2. Create new assignment
        const { data, error } = await supabase
            .from('debt_assignments')
            .insert({
                group_id: groupId,
                assignee_user_id: assigneeUserId,
                assigned_by_user_id: user.id,
                reason: reason,
                status: 'active',
            })
            .select()
            .single();

        if (error) throw error;

        // 3. Update group flag
        await supabase.from('groups').update({ has_debt_assignment: true }).eq('id', groupId);

        return Response.json(data);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (POST /api/debt-assignments):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
