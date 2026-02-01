import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Scan, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ProductCard } from '@/components/ProductCard';
import { DiscountModal } from '@/components/DiscountModal';
import { BottomNavbar } from '@/components/BottomNavbar';
import { Button } from '@/components/ui/button';
import {
  buscarProducto,
  obtenerEstadoConfianza,
  generarPruebaDeImpacto,
  calcularDescuento,
  type ProductoInfo,
  type EstadoConfianza,
  type PruebaDeImpacto
} from '@/services/verificationService';
import {
  buscarProductoOpenFoodFacts,
  type OpenFoodFactsProduct
} from '@/services/openFoodFactsService';
import {
  buscarProductoEnSupabase,
  type DatosCorporativos
} from '@/services/supabaseProductService';
import { saveScannedProduct } from '@/services/checkinService';
import { useToast } from '@/hooks/use-toast';

type Vista = 'scanner' | 'resultado';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [vista, setVista] = useState<Vista>('scanner');
  const [isScanning, setIsScanning] = useState(false);
  const [producto, setProducto] = useState<ProductoInfo | null>(null);
  const [openFoodFactsData, setOpenFoodFactsData] = useState<OpenFoodFactsProduct | null>(null);
  const [datosCorporativos, setDatosCorporativos] = useState<DatosCorporativos | null>(null);
  const [estadoConfianza, setEstadoConfianza] = useState<EstadoConfianza>('pendiente');
  const [pruebaImpacto, setPruebaImpacto] = useState<PruebaDeImpacto | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleScan = useCallback(async (barcode: string) => {
    setIsScanning(true);
    setDatosCorporativos(null);

    // Buscar en paralelo en ambas fuentes locales
    const [productoLocal, openFoodFactsResult] = await Promise.all([
      Promise.resolve(buscarProducto(barcode)),
      buscarProductoOpenFoodFacts(barcode),
    ]);

    // Guardar datos de Open Food Facts si existen
    if (openFoodFactsResult.found && openFoodFactsResult.product) {
      setOpenFoodFactsData(openFoodFactsResult.product);

      // Buscar en Supabase usando el nombre del producto
      const nombreProducto = openFoodFactsResult.product.product_name;
      if (nombreProducto) {
        const datosSupabase = await buscarProductoEnSupabase(nombreProducto);
        setDatosCorporativos(datosSupabase);
      }
    } else {
      setOpenFoodFactsData(null);
    }

    if (productoLocal) {
      setProducto(productoLocal);
      setEstadoConfianza(obtenerEstadoConfianza(productoLocal));
      setPruebaImpacto(generarPruebaDeImpacto(productoLocal));
      setVista('resultado');

      // Guardar en historial
      if (user?.id) {
        await saveScannedProduct(user.id, productoLocal.nombre, productoLocal.marca);
      }

      toast({
        title: '¡Producto verificado!',
        description: `${productoLocal.nombre} - ${productoLocal.marca}`,
      });
    } else if (openFoodFactsResult.found && openFoodFactsResult.product) {
      // Producto encontrado en Open Food Facts
      const productoBasico: ProductoInfo = {
        barcode,
        nombre: openFoodFactsResult.product.product_name || 'Producto sin nombre',
        marca: openFoodFactsResult.product.brands || 'Marca desconocida',
        categoria: 'General',
        verificado: false,
        impacto: {
          agua_ahorrada_litros: 0,
          co2e_evitado_kg: 0,
          puntuacion_eco: 0,
        },
        fabrica: {
          nombre: 'No registrada',
          ahorro_porcentaje: 0,
          tecnologias: [],
        },
        region: {
          nombre: 'No disponible',
          estado_sequia: 'normal',
          spi: 0,
        },
        descuento_disponible: 0,
      };

      setProducto(productoBasico);
      setEstadoConfianza('rojo');
      setPruebaImpacto(null);
      setVista('resultado');

      // Guardar en historial
      if (user?.id) {
        await saveScannedProduct(user.id, productoBasico.nombre, productoBasico.marca);
      }

      toast({
        title: 'Producto encontrado',
        description: 'Buscando datos en base de datos Cobalto...',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Producto no encontrado',
        description: 'El código de barras no está registrado.',
        variant: 'destructive',
      });
    }

    setIsScanning(false);
  }, [toast, user]);

  const handleBack = useCallback(() => {
    setVista('scanner');
    setProducto(null);
    setOpenFoodFactsData(null);
    setDatosCorporativos(null);
    setEstadoConfianza('pendiente');
    setPruebaImpacto(null);
  }, []);

  const handleClaimDiscount = useCallback(() => {
    setShowDiscountModal(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />

      <main className="container px-4 py-6">
        <AnimatePresence mode="wait">
          {vista === 'scanner' ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Welcome Section */}
              <div className="mb-6 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl eco-gradient shadow-eco"
                >
                  <Scan className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="mb-2 text-2xl font-bold text-foreground">
                  Verifica tu Producto
                </h1>
                <p className="text-sm text-muted-foreground">
                  Escanea el código de barras para conocer el impacto hídrico y obtener descuentos por compras sostenibles
                </p>
              </div>

              <BarcodeScanner onScan={handleScan} isScanning={isScanning} />
            </motion.div>
          ) : (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Escanear otro producto
              </Button>

              {producto && (
                <ProductCard
                  producto={producto}
                  estadoConfianza={estadoConfianza}
                  onClaimDiscount={handleClaimDiscount}
                  openFoodFactsData={openFoodFactsData}
                  datosCorporativos={datosCorporativos}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Discount Modal */}
      {producto && pruebaImpacto && (
        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          producto={producto}
          prueba={pruebaImpacto}
          descuento={calcularDescuento(producto)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default Index;
