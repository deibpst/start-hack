import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react';

interface ConnectionStatus {
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
}

export function SupabaseTest() {
    const [connection, setConnection] = useState<ConnectionStatus>({
        status: 'idle',
        message: '',
    });

    useEffect(() => {
        const runTest = async () => {
            setConnection({ status: 'testing', message: 'Probando conexión...' });

            const result = await testSupabaseConnection();

            console.log('📊 Supabase Connection Test:', result);

            setConnection({
                status: result.success ? 'success' : 'error',
                message: result.message,
            });
        };

        runTest();
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">Supabase Status</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {connection.status === 'testing' && (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Conectando...</span>
                            </>
                        )}
                        {connection.status === 'success' && (
                            <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Conectado</span>
                            </>
                        )}
                        {connection.status === 'error' && (
                            <>
                                <XCircle className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">Error</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {connection.message && (
                <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                    {connection.message}
                </p>
            )}
        </div>
    );
}
