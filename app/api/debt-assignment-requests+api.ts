import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase } = await getServerSupabase(request);
        const url = new URL(request.url);
        const groupId = url.searchParams.get('groupId');

        if (!groupId) return Response.json({ error: 'groupId is required' }, { status: 400 });

        const { data, error } = await supabase
            .from('debt_assignment_requests')
            .select(`
        *,
        requested_by_user:users!debt_assignment_requests_requested_by_user_id_fkey(id, name, avatar_url),
        proposed_assignee_user:users!debt_assignment_requests_proposed_assignee_user_id_fkey(id, name, avatar_url)
      `)
            .eq('group_id', groupId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform
        const requests = (data || []).map((r: any) => ({
            ...r,
            groupId: r.group_id,
            requestedByUserId: r.requested_by_user_id,
            proposedAssigneeUserId: r.proposed_assignee_user_id,
            requestedByUser: r.requested_by_user ? { ...r.requested_by_user, avatarUrl: r.requested_by_user.avatar_url } : undefined,
            proposedAssigneeUser: r.proposed_assignee_user ? { ...r.proposed_assignee_user, avatarUrl: r.proposed_assignee_user.avatar_url } : undefined,
        }));

        return Response.json(requests);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/debt-assignment-requests):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();

        const { data, error } = await supabase
            .from('debt_assignment_requests')
            .insert({
                group_id: body.groupId,
                requested_by_user_id: user.id,
                proposed_assignee_user_id: body.proposedAssigneeUserId,
                reason: body.reason,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;
        return Response.json(data);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (POST /api/debt-assignment-requests):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();
        const { requestId, status, groupId, proposedAssigneeUserId, reason, reviewNotes } = body;

        if (status === 'approved') {
            // 1. Deactivate existing assignment
            await supabase
                .from('debt_assignments')
                .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
                .eq('group_id', groupId)
                .eq('status', 'active');

            // 2. Create new assignment
            const { error: assignmentError } = await supabase
                .from('debt_assignments')
                .insert({
                    group_id: groupId,
                    assignee_user_id: proposedAssigneeUserId,
                    assigned_by_user_id: user.id,
                    reason: reason,
                    status: 'active',
                });

            if (assignmentError) throw assignmentError;

            // 3. Update request status
            const { data, error: requestError } = await supabase
                .from('debt_assignment_requests')
                .update({
                    status: 'approved',
                    reviewed_by_user_id: user.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', requestId)
                .select()
                .single();

            if (requestError) throw requestError;

            // 4. Update group flag
            await supabase.from('groups').update({ has_debt_assignment: true }).eq('id', groupId);

            return Response.json(data);
        } else if (status === 'rejected') {
            const { data, error } = await supabase
                .from('debt_assignment_requests')
                .update({
                    status: 'rejected',
                    reviewed_by_user_id: user.id,
                    reviewed_at: new Date().toISOString(),
                    review_notes: reviewNotes,
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw error;
            return Response.json(data);
        }

        return Response.json({ error: 'Invalid operation' }, { status: 400 });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (PATCH /api/debt-assignment-requests):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
