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

// Activity log entry
export interface ActivityLog {
    id: string;
    groupId: string;
    userId: string;
    actionType: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    user?: User;
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
