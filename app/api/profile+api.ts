import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);

        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        return Response.json({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
        });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/profile):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();

        const { data, error } = await supabase
            .from('users')
            .update({
                name: body.name,
                avatar_url: body.avatarUrl,
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        return Response.json({
            id: data.id,
            email: data.email,
            name: data.name,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
        });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (PATCH /api/profile):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
