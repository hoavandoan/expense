import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const url = new URL(request.url);
        const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
        const limit = parseInt(url.searchParams.get('limit') || '20');

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query.limit(limit);

        if (error) throw error;

        const notifications = (data || []).map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            body: n.body,
            metadata: n.metadata || {},
            isRead: n.is_read,
            readAt: n.read_at,
            createdAt: n.created_at,
        }));

        return Response.json(notifications);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/notifications):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();

        if (body.allAsRead) {
            const { error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
            return Response.json({ success: true });
        }

        if (body.notificationId) {
            const { data, error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString(),
                })
                .eq('id', body.notificationId)
                .select()
                .single();

            if (error) throw error;
            return Response.json(data);
        }

        return Response.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (PATCH /api/notifications):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
