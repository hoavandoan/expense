/**
 * Group type definitions with icons and labels
 */
export const GROUP_TYPES = [
    { value: 'trip', label: 'Chuyến đi', icon: 'airplane' },
    { value: 'home', label: 'Nhà cửa', icon: 'house.fill' },
    { value: 'couple', label: 'Cặp đôi', icon: 'heart.fill' },
    { value: 'other', label: 'Khác', icon: 'ellipsis.circle.fill' },
] as const;

/**
 * Group type config lookup map for quick access
 */
export const GROUP_TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
    trip: { icon: 'airplane', label: 'Chuyến đi' },
    home: { icon: 'house.fill', label: 'Nhà cửa' },
    couple: { icon: 'heart.fill', label: 'Cặp đôi' },
    other: { icon: 'ellipsis.circle.fill', label: 'Khác' },
};

/**
 * Type for group type values
 */
export type GroupTypeValue = typeof GROUP_TYPES[number]['value'];

/**
 * Get group type info by value
 */
export const getGroupTypeInfo = (typeValue: string) => {
    return GROUP_TYPE_CONFIG[typeValue] || GROUP_TYPE_CONFIG.other;
};
