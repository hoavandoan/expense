import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '../supabase';

// Ensure browser session closes properly after auth
WebBrowser.maybeCompleteAuthSession();

// iOS: Warm up the browser to handle cookies/session reliably
if (Platform.OS === 'ios') {
    void WebBrowser.warmUpAsync();
}

const IS_EXPO_GO = Constants.appOwnership === 'expo';

/**
 * Get the correct redirect URI for the current platform.
 * - Expo Go: uses exp:// scheme (no custom scheme support)
 * - Dev build / Production: uses splitsmart:// custom scheme
 */
const getRedirectUri = () => {
    return AuthSession.makeRedirectUri({
        ...(!IS_EXPO_GO && { scheme: 'splitsmart' }),
        path: 'auth/callback',
    });
};

/**
 * Extract tokens from OAuth callback URL fragment
 */
const extractTokensFromUrl = (url: string): { accessToken: string; refreshToken: string } | null => {
    try {
        const hashIndex = url.indexOf('#');
        if (hashIndex === -1) return null;

        const fragment = url.substring(hashIndex + 1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) return null;

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('[OAuth] Error extracting tokens:', error);
        return null;
    }
};

/**
 * Common OAuth flow: open browser, extract tokens, set session.
 * onAuthStateChange in AuthProvider handles the rest (fetchProfile, navigation).
 */
const performOAuthFlow = async (provider: 'google' | 'apple'): Promise<void> => {
    const redirectUri = getRedirectUri();
    console.log('[OAuth] redirectUri:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
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

    console.log("result", result);

    if (result.type === 'cancel') {
        throw new Error('Đăng nhập đã bị hủy');
    }

    if (result.type !== 'success' || !result.url) {
        throw new Error('Đăng nhập thất bại');
    }

    const tokens = extractTokensFromUrl(result.url);
    if (!tokens) {
        throw new Error('Không thể lấy thông tin xác thực');
    }

    // setSession triggers onAuthStateChange → SIGNED_IN → fetchProfile
    const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
    });

    if (sessionError) {
        throw sessionError;
    }
};

/**
 * Initiate Google Sign-In flow
 */
export const signInWithGoogle = async (): Promise<void> => {
    try {
        await performOAuthFlow('google');
    } catch (err) {
        if (err instanceof Error && err.message.includes('User cancelled')) {
            throw new Error('Đăng nhập đã bị hủy');
        }
        throw err;
    } finally {
        if (Platform.OS === 'ios') {
            void WebBrowser.coolDownAsync();
        }
    }
};

/**
 * Initiate Apple Sign-In flow
 */
export const signInWithApple = async (): Promise<void> => {
    try {
        await performOAuthFlow('apple');
    } catch (err) {
        if (err instanceof Error && err.message.includes('User cancelled')) {
            throw new Error('Đăng nhập đã bị hủy');
        }
        throw err;
    } finally {
        if (Platform.OS === 'ios') {
            void WebBrowser.coolDownAsync();
        }
    }
};
