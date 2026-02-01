import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExperienciaCard } from '@/components/ExperienciaCard';
import { ExperienciaDetailModal } from '@/components/ExperienciaDetailModal';
import { getExperiencias, getUserExperiences, purchaseExperience, getExperienciaStatus } from '@/services/experienciasService';
import type { Experiencia, ExperienciaStatus } from '@/types/experiencias';

export default function Experiencias() {
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
    const [userExperiencias, setUserExperiencias] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedExperiencia, setSelectedExperiencia] = useState<Experiencia | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<ExperienciaStatus | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Load experiencias
    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user?.id]);

    const loadData = async () => {
        if (!user?.id) return;

        setIsLoading(true);

        const [experienciasResult, userExpResult] = await Promise.all([
            getExperiencias(),
            getUserExperiences(user.id),
        ]);

        if (experienciasResult.data) {
            setExperiencias(experienciasResult.data);
        }

        if (userExpResult.data) {
            setUserExperiencias(userExpResult.data);
        }

        setIsLoading(false);
    };

    const handleExperienciaClick = async (experiencia: Experiencia) => {
        if (!user?.id || !profile) return;

        const status = await getExperienciaStatus(experiencia, user.id, profile.coins);
        setSelectedExperiencia(experiencia);
        setSelectedStatus(status);
    };

    const handlePurchase = async () => {
        if (!user?.id || !selectedExperiencia) return;

        setIsPurchasing(true);

        const result = await purchaseExperience(user.id, selectedExperiencia.id);

        if (result.success) {
            toast({
                title: '¡Experiencia canjeada! 🎉',
                description: result.message,
            });

            // Reload data to update everything
            await loadData();
            setSelectedExperiencia(null);
            setSelectedStatus(null);

            // Force profile reload to update coins
            window.location.reload();
        } else {
            toast({
                title: 'Error al canjear',
                description: result.error || result.message,
                variant: 'destructive',
            });
        }

        setIsPurchasing(false);
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Experiencias
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Canjea tus monedas por experiencias reales
                        </p>
                    </div>
                    {/* Balance de monedas */}
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                        <Coins className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold text-primary">
                            {profile?.coins || 0}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {experiencias.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            No hay experiencias disponibles
                        </h3>
                        <p className="text-muted-foreground">
                            Pronto habrá nuevas experiencias para canjear
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* Info Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20"
                        >
                            <p className="text-sm text-center text-foreground">
                                💙 <strong>{experiencias.length} experiencias</strong> disponibles.
                                Acumula monedas haciendo check-ins y escaneando productos.
                            </p>
                        </motion.div>

                        {/* Grid de Experiencias */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {experiencias.map((experiencia, index) => (
                                <motion.div
                                    key={experiencia.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <ExperienciaCard
                                        experiencia={experiencia}
                                        isEnrolled={userExperiencias.includes(experiencia.id)}
                                        isSoldOut={experiencia.cupo_actual >= experiencia.cupo_maximo}
                                        onClick={() => handleExperienciaClick(experiencia)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            <ExperienciaDetailModal
                experiencia={selectedExperiencia}
                isOpen={!!selectedExperiencia}
                onClose={() => {
                    setSelectedExperiencia(null);
                    setSelectedStatus(null);
                }}
                onPurchase={handlePurchase}
                userCoins={profile?.coins || 0}
                isEnrolled={selectedStatus?.isEnrolled || false}
                isSoldOut={selectedStatus?.isSoldOut || false}
                isPurchasing={isPurchasing}
            />
        </div>
    );
}
