import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'processing' | 'error';
export type CameraError = 'permission_denied' | 'not_found' | 'unknown' | null;

interface UseBarcodeScanner {
  status: ScannerStatus;
  cameraError: CameraError;
  startScanner: () => Promise<void>;
  stopScanner: () => Promise<void>;
  lastScannedCode: string | null;
  resetScanner: () => void;
}

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 150 },
  formatsToSupport: [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.UPC_A,
  ],
  aspectRatio: 1.777778, // 16:9
};

export function useBarcodeScanner(
  containerId: string,
  onScan: (barcode: string) => void
): UseBarcodeScanner {
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [cameraError, setCameraError] = useState<CameraError>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
        isRunningRef.current = false;
      } catch (error) {
        console.warn('Error al detener escáner:', error);
      }
    }
    setStatus('idle');
  }, []);

  const startScanner = useCallback(async () => {
    if (isRunningRef.current) return;
    
    setStatus('starting');
    setCameraError(null);

    try {
      // Crear instancia si no existe
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId, {
          formatsToSupport: SCANNER_CONFIG.formatsToSupport,
          verbose: false,
        });
      }

      // Obtener cámaras disponibles
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        setCameraError('not_found');
        setStatus('error');
        return;
      }

      // Preferir cámara trasera
      const backCamera = cameras.find(
        (cam) => cam.label.toLowerCase().includes('back') || 
                 cam.label.toLowerCase().includes('trasera') ||
                 cam.label.toLowerCase().includes('environment')
      );
      const cameraId = backCamera?.id || cameras[0].id;

      await scannerRef.current.start(
        cameraId,
        {
          fps: SCANNER_CONFIG.fps,
          qrbox: SCANNER_CONFIG.qrbox,
          aspectRatio: SCANNER_CONFIG.aspectRatio,
        },
        async (decodedText) => {
          // Detener escaneo inmediatamente para evitar duplicados
          setLastScannedCode(decodedText);
          setStatus('processing');
          
          if (scannerRef.current && isRunningRef.current) {
            try {
              await scannerRef.current.stop();
              isRunningRef.current = false;
            } catch (e) {
              console.warn('Error al detener tras escaneo:', e);
            }
          }
          
          onScan(decodedText);
        },
        () => {
          // Ignorar errores de escaneo continuo
        }
      );

      isRunningRef.current = true;
      setStatus('scanning');
    } catch (error) {
      console.error('Error al iniciar escáner:', error);
      
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      
      if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorMessage.includes('notallowed')) {
        setCameraError('permission_denied');
      } else if (errorMessage.includes('not found') || errorMessage.includes('no camera')) {
        setCameraError('not_found');
      } else {
        setCameraError('unknown');
      }
      
      setStatus('error');
    }
  }, [containerId, onScan]);

  const resetScanner = useCallback(() => {
    setLastScannedCode(null);
    setCameraError(null);
    setStatus('idle');
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current.stop().catch(() => {});
        isRunningRef.current = false;
      }
    };
  }, []);

  return {
    status,
    cameraError,
    startScanner,
    stopScanner,
    lastScannedCode,
    resetScanner,
  };
}
