import { motion } from 'framer-motion';
import { Gift, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscountButtonProps {
  descuento: number;
  onClick: () => void;
}

export function DiscountButton({ descuento, onClick }: DiscountButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        onClick={onClick}
        className="relative w-full overflow-hidden rounded-2xl py-8 text-lg font-bold verified-gradient shadow-eco"
      >
        {/* Animated sparkles background */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Sparkles className="absolute left-4 h-5 w-5 text-white/30" />
          <Sparkles className="absolute right-4 h-5 w-5 text-white/30" />
        </motion.div>
        
        <div className="relative z-10 flex items-center justify-center gap-3">
          <Gift className="h-6 w-6" />
          <span>Obtener {descuento}% de Descuento</span>
          <ArrowRight className="h-5 w-5" />
        </div>
      </Button>
      
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Interactúa con el contrato de incentivos blockchain
      </p>
    </motion.div>
  );
}