import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const url = new URL(request.url);
        const groupId = url.searchParams.get('groupId');
        const actionType = url.searchParams.get('actionType');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        let query = supabase
            .from('activity_log')
            .select(`
        *,
        user:users(id, name, avatar_url),
        group:groups(id, name)
      `);

        if (groupId) {
            query = query.eq('group_id', groupId);
        } else {
            // Need to find groups user is in
            const { data: memberships } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', user.id);

            const groupIds = memberships?.map(m => m.group_id) || [];
            if (groupIds.length === 0) return Response.json([]);
            query = query.in('group_id', groupIds);
        }

        if (actionType) {
            query = query.eq('action_type', actionType);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Transform for client
        const activities = (data || []).map((a: any) => ({
            id: a.id,
            groupId: a.group_id,
            userId: a.user_id,
            actionType: a.action_type,
            metadata: a.metadata || {},
            createdAt: a.created_at,
            user: a.user ? {
                id: a.user.id,
                name: a.user.name,
                avatarUrl: a.user.avatar_url,
            } : undefined,
            group: a.group ? {
                id: a.group.id,
                name: a.group.name,
            } : undefined,
        }));

        return Response.json(activities);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/activity):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
