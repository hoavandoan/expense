import { supabase } from '../supabase';
import type { DebtAssignment } from '../types';

/**
 * Fetch the active debt assignment for a group
 */
export const fetchActiveDebtAssignment = async (
    groupId: string
): Promise<DebtAssignment | null> => {
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

    if (!data) return null;

    return {
        ...data,
        groupId: data.group_id,
        assigneeUserId: data.assignee_user_id,
        assignedByUserId: data.assigned_by_user_id,
        assigneeUser: data.assignee_user
            ? { ...data.assignee_user, avatarUrl: data.assignee_user.avatar_url }
            : undefined,
        assignedByUser: data.assigned_by_user
            ? { ...data.assigned_by_user, avatarUrl: data.assigned_by_user.avatar_url }
            : undefined,
    };
};

/**
 * Create a new debt assignment (deactivates any existing active assignment)
 */
export const createDebtAssignment = async (input: {
    groupId: string;
    assigneeUserId: string;
    reason?: string;
}): Promise<DebtAssignment> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Deactivate any existing active assignment
    await supabase
        .from('debt_assignments')
        .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
        .eq('group_id', input.groupId)
        .eq('status', 'active');

    // 2. Create new assignment
    const { data, error } = await supabase
        .from('debt_assignments')
        .insert({
            group_id: input.groupId,
            assignee_user_id: input.assigneeUserId,
            assigned_by_user_id: user.id,
            reason: input.reason,
            status: 'active',
        })
        .select()
        .single();

    if (error) throw error;

    // 3. Update group flag
    await supabase
        .from('groups')
        .update({ has_debt_assignment: true })
        .eq('id', input.groupId);

    return data;
};

/**
 * Disable the active debt assignment for a group
 */
export const disableDebtAssignment = async (groupId: string): Promise<void> => {
    const { error } = await supabase
        .from('debt_assignments')
        .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
        .eq('group_id', groupId)
        .eq('status', 'active');

    if (error) throw error;

    await supabase
        .from('groups')
        .update({ has_debt_assignment: false })
        .eq('id', groupId);
};
