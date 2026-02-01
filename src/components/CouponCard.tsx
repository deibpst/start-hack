import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CouponBenefit } from '@/types/coupons';
import { cn } from '@/lib/utils';

interface CouponCardProps {
    couponCode: string;
    benefit: CouponBenefit;
    expiresAt: Date;
    className?: string;
}

export function CouponCard({ couponCode, benefit, expiresAt, className }: CouponCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(couponCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 shadow-lg",
                className
            )}
        >
            {/* Header con badge */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{benefit.icon}</span>
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">
                            Cupón Verde
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mt-2">
                        {benefit.title}
                    </h3>
                </div>
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>

            {/* Mensaje persuasivo */}
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {benefit.message}
            </p>

            {/* Código del cupón */}
            <div className="relative mb-4">
                <div className="rounded-lg border-2 border-dashed border-primary/40 bg-background p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Código de cupón:</p>
                            <p className="font-mono font-bold text-primary text-sm break-all">
                                {couponCode}
                            </p>
                        </div>
                        <Button
                            onClick={handleCopy}
                            size="sm"
                            variant={copied ? "default" : "outline"}
                            className="ml-3 shrink-0"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Copiado
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copiar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Expiración */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                        Válido por {daysUntilExpiry} día{daysUntilExpiry !== 1 ? 's' : ''}
                    </span>
                </div>
                <span className="text-muted-foreground">
                    Expira: {expiresAt.toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })}
                </span>
            </div>

            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
        </motion.div>
    );
}
