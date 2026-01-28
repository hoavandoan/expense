import { getServerSupabase } from '../../../lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { supabase, user } = await getServerSupabase(request);
        const { inviteCodeOrId } = await request.json();

        const code = inviteCodeOrId.trim().toUpperCase();
        let groupId: string | null = null;

        // Check if input looks like a UUID (group ID)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inviteCodeOrId.trim());

        if (isUUID) {
            const { data: group } = await supabase
                .from('groups')
                .select('id')
                .eq('id', inviteCodeOrId.trim())
                .single();

            if (group) groupId = group.id;
        }

        if (!groupId) {
            const { data: group } = await supabase
                .from('groups')
                .select('id')
                .eq('invite_code', code)
                .maybeSingle();

            if (group) groupId = group.id;
        }

        if (!groupId) {
            return Response.json({ error: 'Mã mời không hợp lệ hoặc nhóm không tồn tại' }, { status: 404 });
        }

        // Check if already a member
        const { data: existing } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existing) {
            return Response.json({ error: 'Bạn đã là thành viên của nhóm này' }, { status: 400 });
        }

        // Add user to group
        const { error: joinError } = await supabase.from('group_members').insert({
            group_id: groupId,
            user_id: user.id,
            role: 'member',
        });

        if (joinError) throw joinError;

        return Response.json({ groupId });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error('API Error (POST /api/groups/join):', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
