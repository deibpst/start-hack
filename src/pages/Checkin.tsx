import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Flame, Calendar, Package, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { doCheckin, getMonthlyScans, getMonthlyStats, getMotivationalMessage } from '@/services/checkinService';
import type { ScannedProduct, MonthlyStats } from '@/types/checkin';

export default function Checkin() {
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isCheckinLoading, setIsCheckinLoading] = useState(false);
    const [monthlyScans, setMonthlyScans] = useState<ScannedProduct[]>([]);
    const [stats, setStats] = useState<MonthlyStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Load monthly stats and scans
    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user?.id]);

    const loadData = async () => {
        if (!user?.id) return;

        setStatsLoading(true);

        const [scansResult, statsResult] = await Promise.all([
            getMonthlyScans(user.id),
            getMonthlyStats(user.id),
        ]);

        if (scansResult.data) {
            setMonthlyScans(scansResult.data);
        }

        if (statsResult.data) {
            setStats(statsResult.data);
        }

        setStatsLoading(false);
    };

    const handleCheckin = async () => {
        if (!user?.id) return;

        try {
            setIsCheckinLoading(true);
            const { data, error } = await doCheckin(user.id);

            if (error) {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive',
                });
                return;
            }

            if (data) {
                toast({
                    title: `+${data.coins} monedas! 🎉`,
                    description: data.message,
                });

                // Reload data to update coins
                await loadData();
            }
        } catch (error) {
            toast({
                title: 'Error inesperado',
                description: 'No se pudo hacer check-in',
                variant: 'destructive',
            });
        } finally {
            setIsCheckinLoading(false);
        }
    };

    if (loading || statsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const motivationalMessage = getMotivationalMessage(stats?.totalScans || 0);

    // Check if can do checkin today
    const canCheckinToday = !profile?.last_checkin ||
        new Date(profile.last_checkin).toDateString() !== new Date().toDateString();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground flex-1">Check-in Mensual</h1>
                    {/* Balance de monedas */}
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">{profile?.coins || 0}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Racha Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Flame className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Racha Mensual</h2>
                            <p className="text-sm text-muted-foreground">
                                {stats?.currentStreak || 0} día{stats?.currentStreak !== 1 ? 's' : ''} consecutivo{stats?.currentStreak !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Check-in Button */}
                    <Button
                        onClick={handleCheckin}
                        disabled={!canCheckinToday || isCheckinLoading}
                        className="w-full h-14 text-lg"
                    >
                        {isCheckinLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Procesando...
                            </>
                        ) : !canCheckinToday ? (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Ya hiciste check-in hoy
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Hacer Check-in
                            </>
                        )}
                    </Button>

                    {canCheckinToday && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Gana entre 5 y 20 monedas
                        </p>
                    )}
                </motion.div>

                {/* Mensaje Motivacional */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm"
                >
                    <p className="text-center text-foreground font-medium">
                        {motivationalMessage}
                    </p>
                </motion.div>

                {/* Estadísticas del Mes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Este Mes</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-foreground">{stats?.totalScans || 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">Escaneos</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-foreground">{profile?.coins || 0}</p>
                            <p className="text-xs text-muted-foreground mt-1">Monedas</p>
                        </div>
                    </div>
                </motion.div>

                {/* Historial de Escaneos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Historial de Escaneos</h3>
                    </div>

                    {monthlyScans.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                Aún no has escaneado productos este mes
                            </p>
                            <Button
                                variant="link"
                                onClick={() => navigate('/')}
                                className="mt-2"
                            >
                                Ir al escáner
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {monthlyScans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {scan.product_name}
                                        </p>
                                        {scan.company_name && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {scan.company_name}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(scan.scanned_at).toLocaleDateString('es-MX', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
