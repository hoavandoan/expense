import type { Debt, Expense, GroupMember, IndividualDebt, UserBalance } from '../types';

/**
 * Calculate balance for each member in a group
 * Positive = they are owed money, Negative = they owe money
 */
export const calculateBalances = (
    members: GroupMember[],
    expenses: Expense[],
    splits: Map<string, { userId: string; amount: number }[]>
): Record<string, number> => {
    const balances: Record<string, number> = {};

    // Initialize balances to 0
    members.forEach((member) => {
        balances[member.userId] = 0;
    });

    // Process each expense
    expenses.forEach((expense) => {
        // Person who paid gets credited the full amount
        balances[expense.paidBy] += expense.amount;

        // Each participant gets debited their share
        const expenseSplits = splits.get(expense.id) || [];
        expenseSplits.forEach((split) => {
            balances[split.userId] -= split.amount;
        });
    });

    return balances;
};

/**
 * Calculate balances with simple equal split (when splits are not provided)
 */
export const calculateBalancesSimple = (
    members: GroupMember[],
    expenses: (Expense & { participants: string[] })[]
): Record<string, number> => {
    const balances: Record<string, number> = {};

    members.forEach((member) => {
        balances[member.userId] = 0;
    });

    expenses.forEach((expense) => {
        balances[expense.paidBy] += expense.amount;

        const perPerson = expense.amount / expense.participants.length;
        expense.participants.forEach((participantId) => {
            balances[participantId] -= perPerson;
        });
    });

    return balances;
};

/**
 * Optimize debts using two-pointer algorithm
 * Minimizes the number of transactions needed
 */
export const assignDebtsOptimized = (
    balances: Record<string, number>
): Debt[] => {
    const debts: Debt[] = [];

    // Sort members by balance (descending)
    const sorted = Object.entries(balances)
        .map(([id, balance]) => ({ id, balance }))
        .sort((a, b) => b.balance - a.balance);

    let i = 0; // Creditors (positive balance)
    let j = sorted.length - 1; // Debtors (negative balance)

    while (i < j) {
        const creditor = sorted[i];
        const debtor = sorted[j];

        // Skip if already settled
        if (Math.abs(creditor.balance) < 0.01) {
            i++;
            continue;
        }
        if (Math.abs(debtor.balance) < 0.01) {
            j--;
            continue;
        }

        const amount = Math.min(creditor.balance, -debtor.balance);

        if (amount > 0) {
            debts.push({
                from: debtor.id,
                to: creditor.id,
                amount: Math.round(amount), // Round for VND
            });

            creditor.balance -= amount;
            debtor.balance += amount;
        }

        if (creditor.balance < 0.01) i++;
        if (debtor.balance > -0.01) j--;
    }

    return debts;
};

/**
 * Calculate individual debts by expense (detailed breakdown)
 */
export const calculateIndividualDebts = (
    expenses: (Expense & { participants: string[] })[]
): IndividualDebt[] => {
    const debts: IndividualDebt[] = [];

    expenses.forEach((expense) => {
        const perPerson = expense.amount / expense.participants.length;

        expense.participants.forEach((participantId) => {
            if (participantId !== expense.paidBy) {
                debts.push({
                    from: participantId,
                    to: expense.paidBy,
                    amount: Math.round(perPerson),
                    description: expense.title,
                });
            }
        });
    });

    return debts;
};

/**
 * Get user balances as an array with user info
 */
export const getUserBalances = (
    balances: Record<string, number>,
    members: GroupMember[]
): UserBalance[] => {
    return members.map((member) => ({
        userId: member.userId,
        user: member.user,
        balance: Math.round(balances[member.userId] || 0),
    }));
};

/**
 * Calculate what a specific user owes or is owed in a group
 */
export const calculateUserBalance = (
    userId: string,
    balances: Record<string, number>
): number => {
    return Math.round(balances[userId] || 0);
};
