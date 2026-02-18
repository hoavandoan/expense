/**
 * Expense category definitions with icons, colors, and labels
 */
export const EXPENSE_CATEGORIES = [
    { value: 'food', label: 'Ăn uống', icon: 'fork.knife', color: '#F5A623', bg: '#FFF7ED' },
    { value: 'transport', label: 'Di chuyển', icon: 'car.fill', color: '#0070F3', bg: '#EFF6FF' },
    { value: 'shopping', label: 'Mua sắm', icon: 'cart.fill', color: '#FF0080', bg: '#FFF1F2' },
    { value: 'entertainment', label: 'Giải trí', icon: 'gamecontroller.fill', color: '#7928CA', bg: '#FAF5FF' },
    { value: 'utilities', label: 'Tiện ích', icon: 'bolt.fill', color: '#EAB308', bg: '#FEFCE8' },
    { value: 'gift', label: 'Lì xì', icon: 'gift.fill', color: '#DC2626', bg: '#FEF2F2' },
    { value: 'other', label: 'Khác', icon: 'ellipsis.circle.fill', color: '#71717A', bg: '#F4F4F5' },
] as const;

/**
 * Category config lookup map for quick access by category value
 */
export const CATEGORY_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
    food: { icon: 'fork.knife', color: '#F5A623', bg: 'bg-warning/10', label: 'Ăn uống' },
    transport: { icon: 'car.fill', color: '#0070F3', bg: 'bg-accent/10', label: 'Di chuyển' },
    shopping: { icon: 'cart.fill', color: '#FF0080', bg: 'bg-danger/10', label: 'Mua sắm' },
    entertainment: { icon: 'gamecontroller.fill', color: '#7928CA', bg: 'bg-accent/10', label: 'Giải trí' },
    utilities: { icon: 'bolt.fill', color: '#EAB308', bg: 'bg-warning/10', label: 'Tiện ích' },
    gift: { icon: 'gift.fill', color: '#DC2626', bg: 'bg-danger/10', label: 'Lì xì' },
    other: { icon: 'ellipsis.circle.fill', color: '#71717A', bg: 'bg-default/10', label: 'Khác' },
};

/**
 * Type for expense category values
 */
export type ExpenseCategoryValue = typeof EXPENSE_CATEGORIES[number]['value'];

/**
 * Get category info by value
 */
export const getCategoryInfo = (categoryValue: string) => {
    return CATEGORY_CONFIG[categoryValue] || CATEGORY_CONFIG.other;
};
