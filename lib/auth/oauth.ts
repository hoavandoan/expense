import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '../supabase';

// Ensure browser session closes properly after auth
WebBrowser.maybeCompleteAuthSession();

/**
 * Get the redirect URI for OAuth
 * For Expo Go: uses a special format that Expo handles
 * For standalone/dev builds: uses custom scheme
 */
const getRedirectUri = () => {
    // Check if running in Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';

    if (isExpoGo) {
        // For Expo Go, we need to use the Expo proxy
        // Format: exp://192.168.x.x:8081/--/auth/callback (development)
        // Or: https://auth.expo.io/@username/splitsmart (production Expo Go)
        return AuthSession.makeRedirectUri({
            preferLocalhost: false,
        });
    }

    // For standalone builds, use custom scheme
    return AuthSession.makeRedirectUri({
        scheme: 'splitsmart',
        path: 'auth/callback',
    });
};

/**
 * Initiate Google Sign-In flow
 * Opens a browser for Google OAuth and handles the callback
 */
export const signInWithGoogle = async () => {
    const redirectUri = getRedirectUri();
    console.log('Google OAuth redirect URI:', redirectUri);

    // IMPORTANT: You need to add this redirect URI to:
    // 1. Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs
    // 2. Google Cloud Console -> OAuth credentials -> Authorized redirect URIs

    // Create OAuth URL for Google via Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
        },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL returned');

    // Open the OAuth URL in a browser
    const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
        {
            showInRecents: true,
            preferEphemeralSession: Platform.OS === 'ios',
        }
    );

    if (result.type === 'success') {
        const url = result.url;

        // Parse tokens from URL - can be in hash fragment or query params
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        try {
            const parsedUrl = new URL(url);

            // Check hash fragment first (standard OAuth)
            if (parsedUrl.hash) {
                const fragment = parsedUrl.hash.substring(1);
                const fragmentParams = new URLSearchParams(fragment);
                accessToken = fragmentParams.get('access_token');
                refreshToken = fragmentParams.get('refresh_token');
            }

            // Also check query params (some providers use this)
            if (!accessToken) {
                accessToken = parsedUrl.searchParams.get('access_token');
                refreshToken = parsedUrl.searchParams.get('refresh_token');
            }
        } catch (e) {
            console.error('Error parsing OAuth URL:', e);
        }

        if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;
            return sessionData;
        }

        // If we got here without tokens, try to get the current session
        const { data: currentSession } = await supabase.auth.getSession();
        if (currentSession?.session) {
            return currentSession;
        }

        throw new Error('Không thể lấy thông tin đăng nhập');
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
    console.log('Apple OAuth redirect URI:', redirectUri);

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
            preferEphemeralSession: Platform.OS === 'ios',
        }
    );

    if (result.type === 'success') {
        const url = result.url;

        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        try {
            const parsedUrl = new URL(url);

            if (parsedUrl.hash) {
                const fragment = parsedUrl.hash.substring(1);
                const fragmentParams = new URLSearchParams(fragment);
                accessToken = fragmentParams.get('access_token');
                refreshToken = fragmentParams.get('refresh_token');
            }

            if (!accessToken) {
                accessToken = parsedUrl.searchParams.get('access_token');
                refreshToken = parsedUrl.searchParams.get('refresh_token');
            }
        } catch (e) {
            console.error('Error parsing OAuth URL:', e);
        }

        if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;
            return sessionData;
        }

        const { data: currentSession } = await supabase.auth.getSession();
        if (currentSession?.session) {
            return currentSession;
        }

        throw new Error('Không thể lấy thông tin đăng nhập');
    }

    if (result.type === 'cancel') {
        throw new Error('Đăng nhập đã bị hủy');
    }

    throw new Error('Đăng nhập thất bại');
};
