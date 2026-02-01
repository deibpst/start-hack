import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Keyboard, Loader2, AlertCircle, RefreshCw, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useBarcodeScanner, type ScannerStatus, type CameraError } from '@/hooks/useBarcodeScanner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isScanning: boolean;
}

const SCANNER_CONTAINER_ID = 'barcode-scanner-container';

export function BarcodeScanner({ onScan, isScanning }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');

  const {
    status,
    cameraError,
    startScanner,
    stopScanner,
    resetScanner,
  } = useBarcodeScanner(SCANNER_CONTAINER_ID, onScan);

  // Iniciar escáner cuando cambia a modo cámara
  useEffect(() => {
    if (mode === 'camera' && status === 'idle' && !isScanning) {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mode, status, isScanning, startScanner]);

  // Detener escáner cuando cambia a modo manual o componente se desmonta
  useEffect(() => {
    if (mode === 'manual') {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [mode, stopScanner]);

  const handleManualSubmit = useCallback(() => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  }, [manualCode, onScan]);

  const handleRetry = useCallback(() => {
    resetScanner();
    startScanner();
  }, [resetScanner, startScanner]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Mode Toggle */}
      <div className="flex gap-2 rounded-xl bg-muted p-1">
        <button
          onClick={() => setMode('camera')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all',
            mode === 'camera'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Camera className="h-4 w-4" />
          Cámara
        </button>
        <button
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all',
            mode === 'manual'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Keyboard className="h-4 w-4" />
          Manual
        </button>
      </div>

      {mode === 'camera' ? (
        /* Camera Scanner View */
        <div className="relative w-full overflow-hidden rounded-2xl bg-black">
          {/* Scanner Container */}
          <div
            id={SCANNER_CONTAINER_ID}
            className="aspect-[4/3] w-full"
          />

          {/* Viewfinder Overlay */}
          {status === 'scanning' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {/* Darkened areas around viewfinder */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Viewfinder cutout */}
              <div className="relative z-10 h-[150px] w-[250px] rounded-lg border-2 border-primary bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                {/* Corner markers */}
                <div className="absolute -left-0.5 -top-0.5 h-4 w-4 rounded-tl-lg border-l-4 border-t-4 border-primary" />
                <div className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-tr-lg border-r-4 border-t-4 border-primary" />
                <div className="absolute -bottom-0.5 -left-0.5 h-4 w-4 rounded-bl-lg border-b-4 border-l-4 border-primary" />
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-br-lg border-b-4 border-r-4 border-primary" />

                {/* Scan line animation */}
                <motion.div
                  className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                  initial={{ top: '10%' }}
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {(status === 'starting' || status === 'processing' || isScanning) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium text-white">
                {status === 'starting' && 'Iniciando cámara...'}
                {(status === 'processing' || isScanning) && 'Consultando producto...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6">
              <CameraErrorMessage error={cameraError} />
              <Button
                onClick={handleRetry}
                variant="outline"
                className="mt-4 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}

          {/* Instruction Text */}
          {status === 'scanning' && (
            <div className="absolute inset-x-0 bottom-4 text-center">
              <p className="text-sm font-medium text-white/90">
                Apunta al código de barras
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Manual Entry View */
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ingresa el código de barras"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              className="text-lg"
            />
            <Button
              onClick={handleManualSubmit}
              disabled={!manualCode.trim() || isScanning}
              className="eco-gradient px-6"
            >
              {isScanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface CameraErrorMessageProps {
  error: CameraError;
}

function CameraErrorMessage({ error }: CameraErrorMessageProps) {
  const messages: Record<NonNullable<CameraError>, { title: string; description: string }> = {
    permission_denied: {
      title: 'Permiso de cámara denegado',
      description: 'Por favor, permite el acceso a la cámara en la configuración de tu navegador para escanear códigos de barras.',
    },
    not_found: {
      title: 'Cámara no encontrada',
      description: 'No se detectó ninguna cámara en tu dispositivo. Puedes usar el modo manual para ingresar el código.',
    },
    unknown: {
      title: 'Error al acceder a la cámara',
      description: 'Ocurrió un problema al intentar acceder a la cámara. Intenta recargar la página.',
    },
  };

  const message = error ? messages[error] : messages.unknown;

  return (
    <div className="text-center">
      <CameraOff className="mx-auto h-12 w-12 text-destructive" />
      <h4 className="mt-3 font-semibold text-white">{message.title}</h4>
      <p className="mt-2 text-sm text-white/70">{message.description}</p>
    </div>
  );
}
