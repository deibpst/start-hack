import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { ProductoInfo, PruebaDeImpacto } from '@/services/verificationService';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: ProductoInfo;
  prueba: PruebaDeImpacto;
  descuento: number;
}

export function DiscountModal({ isOpen, onClose, producto, prueba, descuento }: DiscountModalProps) {
  const [copied, setCopied] = useState(false);
  
  const codigoDescuento = `ECO${descuento}-${prueba.hash.slice(2, 10).toUpperCase()}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codigoDescuento);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 bottom-4 top-auto z-50 mx-auto max-w-md rounded-3xl border border-border bg-card p-6 shadow-lg"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Success Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full verified-gradient">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>

            <h2 className="mb-2 text-center text-xl font-bold text-foreground">
              ¡Descuento Verificado!
            </h2>
            
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Tu compra sostenible de <strong>{producto.nombre}</strong> ha sido registrada en blockchain
            </p>

            {/* Discount Code */}
            <div className="mb-4 rounded-xl bg-muted p-4">
              <p className="mb-2 text-xs text-muted-foreground">Tu código de descuento:</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-bold text-primary">{codigoDescuento}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="mb-6 space-y-2 rounded-xl border border-border p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hash de Prueba:</span>
                <span className="font-mono text-foreground">{prueba.hash.slice(0, 14)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agua Ahorrada:</span>
                <span className="text-foreground">{prueba.ahorroAgua} litros</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CO₂e Evitado:</span>
                <span className="text-foreground">{prueba.co2eEvitado} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Región:</span>
                <span className="text-foreground capitalize">{prueba.regionSequia}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1 gap-2 eco-gradient"
                onClick={() => window.open('#', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Ver en Explorer
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}