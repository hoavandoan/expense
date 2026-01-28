import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const url = new URL(request.url);
        const groupId = url.searchParams.get('groupId');
        const pendingOnly = url.searchParams.get('pendingOnly') === 'true';

        let query = supabase
            .from('settlements')
            .select(`
        *,
        from_user:users!settlements_from_user_id_fkey(id, name, avatar_url),
        to_user:users!settlements_to_user_id_fkey(id, name, avatar_url)
      `)
            .order('created_at', { ascending: false });

        if (groupId) {
            query = query.eq('group_id', groupId);
        }

        if (pendingOnly) {
            query = query.eq('to_user_id', user.id).eq('status', 'pending');
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform
        const settlements = (data || []).map((s: any) => ({
            ...s,
            groupId: s.group_id,
            fromUserId: s.from_user_id,
            toUserId: s.to_user_id,
            createdAt: s.created_at,
            completedAt: s.completed_at,
            fromUser: s.from_user ? { ...s.from_user, avatarUrl: s.from_user.avatar_url } : undefined,
            toUser: s.to_user ? { ...s.to_user, avatarUrl: s.to_user.avatar_url } : undefined,
        }));

        return Response.json(settlements);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/settlements):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();

        const { data, error } = await supabase
            .from('settlements')
            .insert({
                group_id: body.groupId,
                from_user_id: user.id,
                to_user_id: body.toUserId,
                amount: body.amount,
                note: body.note || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;
        return Response.json(data);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (POST /api/settlements):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { supabase } = await getServerSupabase(request);
        const body = await request.json();
        const { settlementId, status } = body;

        const updates: any = { status };
        if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('settlements')
            .update(updates)
            .eq('id', settlementId)
            .select()
            .single();

        if (error) throw error;
        return Response.json(data);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (PATCH /api/settlements):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
