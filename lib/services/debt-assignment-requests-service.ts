import { supabase } from '../supabase';
import type { DebtAssignmentRequest } from '../types';

const REQUEST_SELECT = `
    *,
    requested_by_user:users!debt_assignment_requests_requested_by_user_id_fkey(id, name, avatar_url),
    proposed_assignee_user:users!debt_assignment_requests_proposed_assignee_user_id_fkey(id, name, avatar_url)
`;

// Transform snake_case DB row → camelCase DebtAssignmentRequest
const transformRequest = (row: any): DebtAssignmentRequest => ({
    ...row,
    groupId: row.group_id,
    requestedByUserId: row.requested_by_user_id,
    proposedAssigneeUserId: row.proposed_assignee_user_id,
    requestedByUser: row.requested_by_user
        ? { ...row.requested_by_user, avatarUrl: row.requested_by_user.avatar_url }
        : undefined,
    proposedAssigneeUser: row.proposed_assignee_user
        ? { ...row.proposed_assignee_user, avatarUrl: row.proposed_assignee_user.avatar_url }
        : undefined,
});

/**
 * Fetch pending debt assignment requests for a group
 */
export const fetchPendingRequests = async (
    groupId: string
): Promise<DebtAssignmentRequest[]> => {
    const { data, error } = await supabase
        .from('debt_assignment_requests')
        .select(REQUEST_SELECT)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(transformRequest);
};

/**
 * Create a new debt assignment request
 */
export const createRequest = async (input: {
    groupId: string;
    proposedAssigneeUserId: string;
    reason?: string;
}): Promise<DebtAssignmentRequest> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('debt_assignment_requests')
        .insert({
            group_id: input.groupId,
            requested_by_user_id: user.id,
            proposed_assignee_user_id: input.proposedAssigneeUserId,
            reason: input.reason,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Approve a debt assignment request (creates assignment + updates request status)
 */
export const approveRequest = async (input: {
    requestId: string;
    groupId: string;
    proposedAssigneeUserId: string;
    reason?: string;
}): Promise<DebtAssignmentRequest> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Deactivate existing assignment
    await supabase
        .from('debt_assignments')
        .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
        .eq('group_id', input.groupId)
        .eq('status', 'active');

    // 2. Create new assignment
    const { error: assignmentError } = await supabase
        .from('debt_assignments')
        .insert({
            group_id: input.groupId,
            assignee_user_id: input.proposedAssigneeUserId,
            assigned_by_user_id: user.id,
            reason: input.reason,
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
        .eq('id', input.requestId)
        .select()
        .single();

    if (requestError) throw requestError;

    // 4. Update group flag
    await supabase
        .from('groups')
        .update({ has_debt_assignment: true })
        .eq('id', input.groupId);

    return data;
};

/**
 * Reject a debt assignment request
 */
export const rejectRequest = async (input: {
    requestId: string;
    groupId: string;
    reviewNotes?: string;
}): Promise<DebtAssignmentRequest> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('debt_assignment_requests')
        .update({
            status: 'rejected',
            reviewed_by_user_id: user.id,
            reviewed_at: new Date().toISOString(),
            review_notes: input.reviewNotes,
        })
        .eq('id', input.requestId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
