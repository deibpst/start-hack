import { motion } from 'framer-motion';
import { MapPin, Users, Coins, Clock } from 'lucide-react';
import type { Experiencia } from '@/types/experiencias';
import { cn } from '@/lib/utils';

interface ExperienciaCardProps {
    experiencia: Experiencia;
    isEnrolled?: boolean;
    isSoldOut?: boolean;
    onClick: () => void;
}

export function ExperienciaCard({
    experiencia,
    isEnrolled = false,
    isSoldOut = false,
    onClick
}: ExperienciaCardProps) {
    const cupoRestante = experiencia.cupo_maximo - experiencia.cupo_actual;
    const porcentajeOcupacion = (experiencia.cupo_actual / experiencia.cupo_maximo) * 100;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="cursor-pointer"
        >
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="text-6xl">
                        {experiencia.titulo.includes('turtle') ? '🐢' : '🏛️'}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex gap-2">
                        {isEnrolled && (
                            <span className="px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold">
                                INSCRITO
                            </span>
                        )}
                        {isSoldOut && !isEnrolled && (
                            <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-semibold">
                                AGOTADO
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-1">
                                {experiencia.titulo}
                            </h3>
                            <p className="text-sm text-primary font-medium">
                                by {experiencia.empresa}
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {experiencia.descripcion_corta}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{cupoRestante} lugares</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{experiencia.cupo_actual}/{experiencia.cupo_maximo} inscritos</span>
                            <span>{Math.round(porcentajeOcupacion)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all rounded-full",
                                    porcentajeOcupacion >= 80 ? "bg-red-500" :
                                        porcentajeOcupacion >= 50 ? "bg-yellow-500" :
                                            "bg-primary"
                                )}
                                style={{ width: `${porcentajeOcupacion}%` }}
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-primary" />
                            <span className="text-lg font-bold text-foreground">
                                {experiencia.costo_monedas.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">monedas</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
