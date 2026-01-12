// User from Supabase auth
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    createdAt: string;
}

export type GroupType = 'trip' | 'home' | 'couple' | 'other';

// Group entity
export interface Group {
    id: string;
    name: string;
    description: string | null;
    coverImageUrl: string | null;
    inviteCode: string;
    currency: string;
    groupType: GroupType;
    createdBy: string;
    createdAt: string;
    hasDebtAssignment: boolean;
    debtAssignmentEnabled: boolean;
}

// Group member with role
export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    user?: User;
}

// Expense category
export type ExpenseCategory =
    | 'food'
    | 'transport'
    | 'accommodation'
    | 'entertainment'
    | 'shopping'
    | 'utilities'
    | 'other';

// Expense entity
export interface Expense {
    id: string;
    groupId: string;
    paidBy: string;
    title: string;
    description: string | null;
    amount: number;
    category: ExpenseCategory;
    receiptUrl: string | null;
    expenseDate: string;
    createdAt: string;
    paidByUser?: User;
}

// Expense split for each participant
export interface ExpenseSplit {
    id: string;
    expenseId: string;
    userId: string;
    amount: number;
    isPaid: boolean;
    paidAt: string | null;
    user?: User;
}

// Settlement between two users
export interface Settlement {
    id: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    status: 'pending' | 'completed' | 'rejected';
    createdAt: string;
    completedAt: string | null;
    fromUser?: User;
    toUser?: User;
}

// Notification entity
export interface Notification {
    id: string;
    userId: string;
    type: 'expense_created' | 'expense_updated' | 'settlement_requested' | 'settlement_completed' | 'group_member_added' | 'group_member_removed' | 'debt_assignment_requested' | 'debt_assignment_approved' | 'debt_assignment_rejected';
    title: string;
    body: string | null;
    metadata: Record<string, unknown>;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

// Activity log entry
export interface ActivityLog {
    id: string;
    groupId: string;
    userId: string;
    actionType: 'expense_created' | 'expense_updated' | 'expense_deleted' | 'settlement_created' | 'settlement_completed' | 'settlement_rejected' | 'group_member_added' | 'group_member_removed' | 'group_member_role_changed' | 'group_updated' | 'debt_assignment_created' | 'debt_assignment_updated';
    metadata: Record<string, unknown>;
    createdAt: string;
    user?: User;
    group?: Group;
}

// Computed types for debt calculation
export interface IndividualDebt {
    from: string;
    to: string;
    amount: number;
    description: string;
}

export interface Debt {
    from: string;
    to: string;
    amount: number;
}

// Debt Assignment entity
export interface DebtAssignment {
    id: string;
    groupId: string;
    assigneeUserId: string;
    assignedByUserId: string;
    status: 'active' | 'inactive';
    reason?: string;
    createdAt: string;
    updatedAt: string;
    deactivatedAt?: string;
    assigneeUser?: User;
    assignedByUser?: User;
}

// Debt Assignment Request entity
export interface DebtAssignmentRequest {
    id: string;
    groupId: string;
    requestedByUserId: string;
    proposedAssigneeUserId: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedByUserId?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    requestedByUser?: User;
    proposedAssigneeUser?: User;
    reviewedByUser?: User;
}

// Extended Debt type with assignee mode
export interface AssigneeDebt extends Debt {
    isToAssignee: boolean; // true = debt to assignee, false = debt from assignee
}

// Balance summary for a user in a group
export interface UserBalance {
    userId: string;
    user?: User;
    balance: number; // Positive = owed to them, Negative = they owe
}

// Group with computed data
export interface GroupWithDetails extends Group {
    members: GroupMember[];
    expenses: Expense[];
    memberCount: number;
    totalExpenses: number;
    userBalance: number;
}
