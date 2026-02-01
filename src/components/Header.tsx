import { motion } from 'framer-motion';
import { Droplets, Shield } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl eco-gradient">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Cobalto</h1>
            <p className="text-xs text-muted-foreground">Verificación Hídrica</p>
          </div>
        </div>

      </div>
    </motion.header>
  );
}