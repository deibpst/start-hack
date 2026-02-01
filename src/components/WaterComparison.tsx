import { motion } from 'framer-motion';
import type { WaterComparison } from '@/types/coupons';
import { cn } from '@/lib/utils';

interface WaterComparisonProps {
    comparison: WaterComparison;
    productName: string;
}

export function WaterComparison({ comparison, productName }: WaterComparisonProps) {
    const { productConsumption, categoryAverage, percentageBetter } = comparison;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="text-lg">💧</span>
                Comparativa de Consumo Hídrico
            </h3>

            <div className="space-y-3">
                {/* Producto Actual */}
                <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-muted-foreground">Este producto</span>
                        <span className="font-semibold text-primary">
                            {Math.round(productConsumption)} L/mes
                        </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(productConsumption / categoryAverage) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-primary rounded-full"
                        />
                    </div>
                </div>

                {/* Promedio Categoría */}
                <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-muted-foreground">Producto promedio</span>
                        <span className="font-semibold text-muted-foreground">
                            {Math.round(categoryAverage)} L/mes
                        </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-full bg-muted-foreground/30 rounded-full" />
                    </div>
                </div>

                {/* Resultado */}
                <div className={cn(
                    "mt-4 p-3 rounded-lg text-center",
                    comparison.isSustainable
                        ? "bg-green-50 border border-green-200"
                        : "bg-muted"
                )}>
                    {comparison.isSustainable ? (
                        <div>
                            <p className="text-2xl font-bold text-green-700 mb-1">
                                {Math.round(percentageBetter)}%
                            </p>
                            <p className="text-xs text-green-700 font-medium">
                                más eficiente que el promedio
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Consumo dentro del promedio
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
