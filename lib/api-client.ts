import { supabase } from './supabase';

const API_BASE_URL = '/api'; // Expo Router API routes are relative to the root

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

    // Get current session for the access token
    const { data: { session } } = await supabase.auth.getSession();
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
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
    }

    // For 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}
