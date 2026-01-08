/**
 * Format number as currency
 * @param amount - The amount to format
 * @param currency - Optional currency code (default: VND)
 */
export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
    const locale = currency === 'VND' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'VND' ? 0 : 2,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
};

/**
 * Format currency in compact form (e.g., 1.5M, 500k)
 */
export const formatCurrencyCompact = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 1_000_000_000) {
        return `${sign}${(absAmount / 1_000_000_000).toFixed(1)}B`;
    }
    if (absAmount >= 1_000_000) {
        return `${sign}${(absAmount / 1_000_000).toFixed(1)}M`;
    }
    if (absAmount >= 1_000) {
        return `${sign}${Math.round(absAmount / 1_000)}k`;
    }
    return `${sign}${absAmount}đ`;
};

/**
 * Format currency without currency symbol
 */
export const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};

/**
 * Parse Vietnamese formatted number to number
 */
export const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
};

const MAX_SUGGESTION = 1_000_000_000;

/**
 * Generate amount suggestions based on input
 */
export const generateAmountSuggestions = (input: string): number[] => {
    const digits = input.replace(/\D/g, '');
    if (!digits || digits === '0') return [];

    const base = parseInt(digits, 10);
    if (base > MAX_SUGGESTION) return [];

    return [10, 100, 1000, 10000, 100000, 1000000]
        .map((multiplier) => base * multiplier)
        .filter((suggestion) => suggestion <= MAX_SUGGESTION && suggestion >= 10000);
};

/**
 * Format date in Vietnamese locale
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

/**
 * Format relative time (e.g., "5 phút trước")
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return formatDate(dateString);
};

/**
 * Generate a random invite code
 */
export const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
