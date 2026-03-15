
import { useAuthStore } from './stores/auth-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}/api`
    : '/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

/**
 * Enhanced fetch wrapper for Expo API Routes
 */
export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;

    // Build URL with query parameters
    let url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    // Get session from store (source of truth mirrored from Supabase)
    let session = useAuthStore.getState().session;

    // If we think we are authenticated but session is null, 
    // it's likely a sync delay on app start. Wait once.
    if (!session && useAuthStore.getState().isAuthenticated) {
        console.log('[apiClient] Session null but authenticated, waiting for sync...');
        await new Promise(resolve => setTimeout(resolve, 500));
        session = useAuthStore.getState().session;
    }

    const token = session?.access_token;

    const headers = new Headers(init.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...init,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `API Error: ${response.status} ${response.statusText}`;

        // Create an error object with status for better handling
        const error = new Error(errorMessage) as any;
        error.status = response.status;
        throw error;
    }

    // For 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}
