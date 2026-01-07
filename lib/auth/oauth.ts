import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/auth-store';
import { supabase } from '../supabase';
import type { User } from '../types';

// Ensure browser session closes properly after auth
WebBrowser.maybeCompleteAuthSession();

/**
 * Get the correct redirect URI for the current platform
 */
const getRedirectUri = () => {
    // Use AuthSession.makeRedirectUri for proper Expo Go compatibility
    const redirectUri = AuthSession.makeRedirectUri({
        path: 'auth/callback',
    });

    console.log('Platform:', Platform.OS);
    console.log('Redirect URI:', redirectUri);

    return redirectUri;
};

/**
 * Decode JWT token to get user data without calling Supabase
 */
const decodeJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error decoding JWT:', e);
        return null;
    }
};

/**
 * Parse user data from JWT payload
 */
const parseUserFromJwt = (payload: any): User | null => {
    if (!payload) return null;

    const metadata = payload.user_metadata || {};

    return {
        id: payload.sub,
        email: payload.email || '',
        name: metadata.full_name || metadata.name || payload.email?.split('@')[0] || '',
        avatarUrl: metadata.avatar_url || metadata.picture || null,
        createdAt: new Date(payload.iat * 1000).toISOString(),
    };
};

/**
 * Extract tokens from OAuth callback URL
 */
const extractTokensFromUrl = (url: string): { accessToken: string; refreshToken: string } | null => {
    try {
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
            const fragment = url.substring(hashIndex + 1);
            const params = new URLSearchParams(fragment);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                return { accessToken, refreshToken };
            }
        }
        return null;
    } catch (e) {
        console.error('Error extracting tokens:', e);
        return null;
    }
};

/**
 * Initiate Google Sign-In flow
 */
export const signInWithGoogle = async () => {
    const redirectUri = getRedirectUri();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
        },
    });

    if (error) {
        console.error('OAuth error:', error);
        throw error;
    }

    if (!data.url) {
        throw new Error('No OAuth URL returned');
    }

    console.log('Opening OAuth URL...');

    const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
        {
            showInRecents: true,
            preferEphemeralSession: false,
        }
    );

    console.log('WebBrowser result:', result.type);

    if (result.type === 'success' && result.url) {
        console.log('OAuth callback received');

        const tokens = extractTokensFromUrl(result.url);

        if (tokens) {
            console.log('Tokens extracted');

            // Decode JWT to get user data directly (avoid setSession hang)
            const payload = decodeJwt(tokens.accessToken);
            const user = parseUserFromJwt(payload);

            if (user) {
                console.log('User parsed from JWT:', user.email);

                // Update auth store immediately
                useAuthStore.getState().setUser(user);

                // Try to set session in background (don't await)
                supabase.auth.setSession({
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                }).then(({ error }) => {
                    if (error) {
                        console.log('Background setSession error:', error.message);
                    } else {
                        console.log('Background setSession success');
                    }
                }).catch((e) => {
                    console.log('Background setSession failed:', e.message);
                });

                return { user, session: { access_token: tokens.accessToken } };
            }
        }

        throw new Error('Không thể lấy thông tin người dùng');
    }

    if (result.type === 'cancel') {
        throw new Error('Đăng nhập đã bị hủy');
    }

    throw new Error('Đăng nhập thất bại');
};

/**
 * Initiate Apple Sign-In flow
 */
export const signInWithApple = async () => {
    const redirectUri = getRedirectUri();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
        },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
        {
            showInRecents: true,
            preferEphemeralSession: false,
        }
    );

    console.log('WebBrowser result:', result.type);

    if (result.type === 'success' && result.url) {
        const tokens = extractTokensFromUrl(result.url);

        if (tokens) {
            const payload = decodeJwt(tokens.accessToken);
            const user = parseUserFromJwt(payload);

            if (user) {
                useAuthStore.getState().setUser(user);

                // Background setSession
                supabase.auth.setSession({
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                }).catch(() => { });

                return { user };
            }
        }

        throw new Error('Không thể lấy thông tin người dùng');
    }

    if (result.type === 'cancel') {
        throw new Error('Đăng nhập đã bị hủy');
    }

    throw new Error('Đăng nhập thất bại');
};

/**
 * Sign out user
 */
export const signOut = async () => {
    useAuthStore.getState().logout();

    // Try to sign out from Supabase in background
    supabase.auth.signOut().catch(() => { });
};
