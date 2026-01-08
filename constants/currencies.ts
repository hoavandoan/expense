/**
 * Currency definitions with symbols and labels
 */
export const CURRENCIES = [
    { value: 'VND', label: 'Việt Nam Đồng (đ)', symbol: '₫', locale: 'vi-VN' },
    { value: 'USD', label: 'Đô la Mỹ ($)', symbol: '$', locale: 'en-US' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€', locale: 'de-DE' },
] as const;

/**
 * Currency config lookup map for quick access
 */
export const CURRENCY_CONFIG: Record<string, { symbol: string; label: string; locale: string }> = {
    VND: { symbol: '₫', label: 'Việt Nam Đồng', locale: 'vi-VN' },
    USD: { symbol: '$', label: 'Đô la Mỹ', locale: 'en-US' },
    EUR: { symbol: '€', label: 'Euro', locale: 'de-DE' },
};

/**
 * Type for currency values
 */
export type CurrencyValue = typeof CURRENCIES[number]['value'];

/**
 * Get currency info by value
 */
export const getCurrencyInfo = (currencyValue: string) => {
    return CURRENCY_CONFIG[currencyValue] || CURRENCY_CONFIG.VND;
};

/**
 * Get currency symbol by value
 */
export const getCurrencySymbol = (currencyValue: string): string => {
    return CURRENCY_CONFIG[currencyValue]?.symbol || '₫';
};
