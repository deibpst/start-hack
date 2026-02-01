import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Loader2, Mail, Lock, User, AtSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function Login() {
    const { signInWithEmail, signUp, user, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: 'Campos requeridos',
                description: 'Por favor ingresa tu email y contraseña',
                variant: 'destructive',
            });
            return;
        }

        if (mode === 'signup' && (!fullName || !username)) {
            toast({
                title: 'Campos requeridos',
                description: 'Por favor completa todos los campos',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);

            if (mode === 'signup') {
                const { error } = await signUp(email, password, fullName, username);

                if (error) {
                    toast({
                        title: 'Error al crear cuenta',
                        description: error.message,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: '¡Cuenta creada!',
                        description: 'Si es necesario, revisa tu email para confirmar tu cuenta. O intenta iniciar sesión directamente.',
                    });
                    // No cambiar de modo automáticamente para que el usuario pueda ver el mensaje
                }
            } else {
                const { error } = await signInWithEmail(email, password);

                if (error) {
                    toast({
                        title: 'Error al iniciar sesión',
                        description: error.message,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: '¡Bienvenido!',
                        description: 'Sesión iniciada correctamente',
                    });
                }
            }
        } catch (error) {
            toast({
                title: 'Error inesperado',
                description: 'Intenta nuevamente',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary mb-4">
                        <svg
                            className="h-10 w-10 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Cobalto</h1>
                    <p className="text-muted-foreground">Verificación Hídrica</p>
                </div>

                {/* Login/Signup Card */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    {/* Mode Toggle */}
                    <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 px-4 rounded-md transition-colors ${mode === 'login'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-2 px-4 rounded-md transition-colors ${mode === 'signup'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Crear Cuenta
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Signup Fields */}
                        {mode === 'signup' && (
                            <>
                                <div>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Nombre completo"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            disabled={isLoading}
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="relative">
                                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Nombre de usuario"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={isLoading}
                                            className="pl-10 h-12"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email & Password */}
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <LogIn className="mr-2 h-5 w-5" />
                            )}
                            {mode === 'signup' ? 'Crear Cuenta' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Al continuar, aceptas nuestros términos y política de privacidad
                </p>
            </motion.div>
        </div>
    );
}
