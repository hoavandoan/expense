import { getServerSupabase } from '../../lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const url = new URL(request.url);
        const query = url.searchParams.get('q');
        const limit = parseInt(url.searchParams.get('limit') || '10');

        if (!query || query.trim().length < 2) {
            return Response.json({ expenses: [], groups: [], users: [] });
        }

        const searchQuery = query.trim();

        // 1. Get user's group IDs
        const { data: memberships } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id);

        const groupIds = memberships?.map((m) => m.group_id) || [];

        // 2. Search expenses
        const expensesPromise = groupIds.length > 0
            ? supabase
                .from('expenses')
                .select(`
            id, title, description, amount, category, created_at, group_id,
            paid_by_user:users!expenses_paid_by_fkey(id, name, avatar_url),
            group:groups(id, name, currency)
          `)
                .in('group_id', groupIds)
                .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                .order('created_at', { ascending: false })
                .limit(limit)
            : Promise.resolve({ data: [], error: null });

        // 3. Search groups
        const groupsPromise = groupIds.length > 0
            ? supabase
                .from('groups')
                .select('id, name, description, cover_image_url, currency')
                .in('id', groupIds)
                .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                .order('created_at', { ascending: false })
                .limit(limit)
            : Promise.resolve({ data: [], error: null });

        // 4. Search users (in user's groups)
        const usersPromise = groupIds.length > 0
            ? supabase
                .from('group_members')
                .select(`user:users(id, name, email, avatar_url)`)
                .in('group_id', groupIds)
                .neq('user_id', user.id)
                .limit(limit)
                .then((result) => {
                    if (result.error) return { data: [], error: result.error };
                    const users = (result.data || [])
                        .map((m: any) => m.user)
                        .filter((u: any) =>
                            u && (
                                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                        );
                    return { data: users, error: null };
                })
            : Promise.resolve({ data: [], error: null });

        const [expensesResult, groupsResult, usersResult] = await Promise.all([
            expensesPromise,
            groupsPromise,
            usersPromise,
        ]);

        if (expensesResult.error) throw expensesResult.error;
        if (groupsResult.error) throw groupsResult.error;
        if (usersResult.error) throw usersResult.error;

        return Response.json({
            expenses: (expensesResult.data || []).map((e: any) => ({
                ...e,
                groupId: e.group_id,
                paidByUser: e.paid_by_user ? { ...e.paid_by_user, avatarUrl: e.paid_by_user.avatar_url } : undefined,
            })),
            groups: (groupsResult.data || []).map((g: any) => ({
                ...g,
                coverImageUrl: g.cover_image_url,
            })),
            users: (usersResult.data || []).map((u: any) => ({
                ...u,
                avatarUrl: u.avatar_url,
            })),
        });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (GET /api/search):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
