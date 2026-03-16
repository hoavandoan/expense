import { supabase } from '../supabase';
import type { Settlement } from '../types';

// Transform snake_case DB row → camelCase Settlement
const transformSettlement = (row: any): Settlement => ({
    ...row,
    groupId: row.group_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    fromUser: row.from_user
        ? { ...row.from_user, avatarUrl: row.from_user.avatar_url }
        : undefined,
    toUser: row.to_user
        ? { ...row.to_user, avatarUrl: row.to_user.avatar_url }
        : undefined,
});

const SETTLEMENT_SELECT = `
    *,
    from_user:users!settlements_from_user_id_fkey(id, name, avatar_url),
    to_user:users!settlements_to_user_id_fkey(id, name, avatar_url)
`;

/**
 * Fetch settlements for a group
 */
export const fetchSettlements = async (groupId: string): Promise<Settlement[]> => {
    const { data, error } = await supabase
        .from('settlements')
        .select(SETTLEMENT_SELECT)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(transformSettlement);
};

/**
 * Fetch pending settlements where the current user is the receiver
 */
export const fetchPendingSettlements = async (groupId: string): Promise<Settlement[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('settlements')
        .select(SETTLEMENT_SELECT)
        .eq('group_id', groupId)
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(transformSettlement);
};

/**
 * Create a settlement request
 */
export const createSettlement = async (input: {
    groupId: string;
    toUserId: string;
    amount: number;
    note?: string;
}): Promise<Settlement> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('settlements')
        .insert({
            group_id: input.groupId,
            from_user_id: user.id,
            to_user_id: input.toUserId,
            amount: input.amount,
            note: input.note || null,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update settlement status (complete or reject)
 */
export const updateSettlementStatus = async (
    settlementId: string,
    status: 'completed' | 'rejected'
): Promise<Settlement> => {
    const updates: Record<string, any> = { status };
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
    return data;
};
