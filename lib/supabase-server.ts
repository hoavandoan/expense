import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Get a Supabase client for server-side operations in API Routes.
 * It uses the user's access token for Row Level Security (RLS).
 */
export async function getServerSupabase(request: Request) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        auth: {
            persistSession: false,
        },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return { supabase, user };
}
