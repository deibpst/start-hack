import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstadoConfianza } from '@/services/verificationService';

interface TrustTrafficLightProps {
  estado: EstadoConfianza;
  className?: string;
}

const config = {
  verde: {
    icon: CheckCircle,
    label: 'Verificado',
    description: 'Este producto cuidó el agua durante la sequía actual',
    bgClass: 'verified-gradient',
    glowClass: 'animate-glow',
  },
  rojo: {
    icon: XCircle,
    label: 'Sin verificar',
    description: 'Sin datos de ahorro verificados',
    bgClass: 'danger-gradient',
    glowClass: '',
  },
  pendiente: {
    icon: Clock,
    label: 'Procesando',
    description: 'Verificando información del producto...',
    bgClass: 'bg-warning',
    glowClass: '',
  },
};

export function TrustTrafficLight({ estado, className }: TrustTrafficLightProps) {
  const { icon: Icon, label, description, bgClass, glowClass } = config[estado];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl p-6 text-center',
        bgClass,
        glowClass,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
      >
        <Icon className="h-12 w-12 text-white" strokeWidth={2.5} />
      </motion.div>
      
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-2xl font-bold text-white"
      >
        {label}
      </motion.h2>
      
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-white/90"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}