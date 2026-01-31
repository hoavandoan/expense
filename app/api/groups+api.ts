import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase } = await getServerSupabase(request);

        const { data, error } = await supabase
            .from('groups')
            .select(`
        *,
        group_members!inner(
            user_id, 
            role,
            user:users(id, name, avatar_url)
          ),
          expenses!inner(
          amount,
           paid_by,
           expense_splits(
            user_id,
            amount,
            is_paid,
            user:users(id, name, avatar_url)
           )
           )
          
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to include computed fields
        const groups = (data || []).map((group: any) => ({
            ...group,
            inviteCode: group.invite_code,
            coverImageUrl: group.cover_image_url,
            memberCount: group.group_members?.length || 0,
            totalExpenses: group.expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0,
        }));

        return Response.json(groups);
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/groups):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const body = await request.json();

        const { data, error } = await supabase
            .from('groups')
            .insert({
                name: body.name,
                description: body.description || null,
                cover_image_url: body.coverImageUrl || null,
                currency: body.currency || 'VND',
                group_type: body.groupType || 'trip',
                created_by: user.id,
                invite_code: body.inviteCode,
            })
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
        console.error('API Error (POST /api/groups):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
