import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '❌ Supabase credentials missing! Check your .env.local file.',
        '\n   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    );
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

/**
 * Test connection to Supabase
 * @returns Promise with connection status
 */
export async function testSupabaseConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
}> {
    try {
        // Simple query to test connection
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            // Check if it's a "table doesn't exist" error (expected if table not created)
            if (error.code === '42P01') {
                return {
                    success: true,
                    message: '✅ Conexión exitosa. La tabla "profiles" no existe aún, pero Supabase responde correctamente.',
                };
            }

            return {
                success: false,
                message: `⚠️ Error de Supabase: ${error.message}`,
            };
        }

        return {
            success: true,
            message: '✅ Conexión exitosa a Supabase.',
            data,
        };
    } catch (err) {
        return {
            success: false,
            message: `❌ Error de conexión: ${err instanceof Error ? err.message : 'Unknown error'}`,
        };
    }
}
