import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Users, MapPin, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { Experiencia } from '@/types/experiencias';
import { cn } from '@/lib/utils';

interface ExperienciaDetailModalProps {
    experiencia: Experiencia | null;
    isOpen: boolean;
    onClose: () => void;
    onPurchase: () => void;
    userCoins: number;
    isEnrolled: boolean;
    isSoldOut: boolean;
    isPurchasing: boolean;
}

export function ExperienciaDetailModal({
    experiencia,
    isOpen,
    onClose,
    onPurchase,
    userCoins,
    isEnrolled,
    isSoldOut,
    isPurchasing,
}: ExperienciaDetailModalProps) {
    if (!experiencia) return null;

    const canAfford = userCoins >= experiencia.costo_monedas;
    const canPurchase = canAfford && !isEnrolled && !isSoldOut;
    const cupoRestante = experiencia.cupo_maximo - experiencia.cupo_actual;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{experiencia.titulo}</DialogTitle>
                    <DialogDescription className="text-base text-primary font-medium">
                        by {experiencia.empresa}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Image Placeholder */}
                    <div className="relative h-64 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <div className="text-8xl">
                            {experiencia.titulo.includes('turtle') ? '🐢' : '🏛️'}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Descripción</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {experiencia.descripcion_larga}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-muted-foreground">Cupo</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {cupoRestante}/{experiencia.cupo_maximo}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">lugares disponibles</p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                                <Coins className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-muted-foreground">Costo</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {experiencia.costo_monedas.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">monedas</p>
                        </div>
                    </div>

                    {/* User Balance */}
                    <div className={cn(
                        "p-4 rounded-lg border",
                        canAfford ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Coins className={cn(
                                    "h-5 w-5",
                                    canAfford ? "text-green-600" : "text-red-600"
                                )} />
                                <span className="text-sm font-medium">Tu saldo: {userCoins.toLocaleString()} monedas</span>
                            </div>
                            {canAfford ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                        </div>
                        {!canAfford && (
                            <p className="text-sm text-red-600 mt-2">
                                Necesitas {(experiencia.costo_monedas - userCoins).toLocaleString()} monedas más
                            </p>
                        )}
                    </div>

                    {/* Status Messages */}
                    {isEnrolled && (
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                    Ya estás inscrito en esta experiencia
                                </span>
                            </div>
                        </div>
                    )}

                    {isSoldOut && !isEnrolled && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-red-900">
                                    Esta experiencia está agotada
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Purchase Button */}
                    <div className="flex gap-3">
                        <Button
                            onClick={onPurchase}
                            disabled={!canPurchase || isPurchasing}
                            className="flex-1 h-12 text-base"
                        >
                            {isPurchasing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : isEnrolled ? (
                                'Ya inscrito'
                            ) : isSoldOut ? (
                                'Agotado'
                            ) : !canAfford ? (
                                'Saldo insuficiente'
                            ) : (
                                <>
                                    <Coins className="mr-2 h-5 w-5" />
                                    Canjear por {experiencia.costo_monedas.toLocaleString()} monedas
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="h-12"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
