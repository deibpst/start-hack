import { motion } from 'framer-motion';
import { Droplets, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DiscountButton } from './DiscountButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProductoInfo, EstadoConfianza } from '@/services/verificationService';
import { calcularDescuento } from '@/services/verificationService';
import type { OpenFoodFactsProduct } from '@/services/openFoodFactsService';
import type { DatosCorporativos } from '@/services/supabaseProductService';
import { formatearConsumoAgua } from '@/services/supabaseProductService';

interface ProductCardProps {
  producto: ProductoInfo;
  estadoConfianza: EstadoConfianza;
  onClaimDiscount: () => void;
  openFoodFactsData?: OpenFoodFactsProduct | null;
  datosCorporativos?: DatosCorporativos | null;
}

/**
 * Calcula el estado del banner basado en huella hídrica mensual
 * > 800,000 L/mes = rojo (demasiada huella)
 * <= 800,000 L/mes = verde (verificado)
 * Sin datos = pendiente
 */
function calcularEstadoHidrico(datosCorporativos: DatosCorporativos | null | undefined): 'verde' | 'rojo' | 'pendiente' {
  if (!datosCorporativos?.encontrado || !datosCorporativos.huellaHidricaMensual) {
    return 'pendiente';
  }
  return datosCorporativos.huellaHidricaMensual > 800000 ? 'rojo' : 'verde';
}

/**
 * Calcula la puntuación eco basada en consumo mensual
 * Escala más estricta:
 * <= 20,000 L/mes = 100 puntos (muy eficiente)
 * >= 1,000,000 L/mes = 0 puntos (alto consumo)
 */
function calcularPuntuacionEco(datosCorporativos: DatosCorporativos | null | undefined): number {
  if (!datosCorporativos?.encontrado || !datosCorporativos.huellaHidricaMensual) {
    return 0;
  }

  const consumo = datosCorporativos.huellaHidricaMensual;
  const MIN_CONSUMO = 20000;      // 20K L/mes = 100 puntos
  const MAX_CONSUMO = 1000000;    // 1M L/mes = 0 puntos (escala más estricta)

  if (consumo <= MIN_CONSUMO) return 100;
  if (consumo >= MAX_CONSUMO) return 0;

  // Escala lineal inversa
  const rango = MAX_CONSUMO - MIN_CONSUMO;
  const puntuacion = 100 - ((consumo - MIN_CONSUMO) / rango) * 100;
  return Math.round(puntuacion);
}

export function ProductCard({ producto, estadoConfianza, onClaimDiscount, openFoodFactsData, datosCorporativos }: ProductCardProps) {
  const descuento = calcularDescuento(producto);
  const estadoHidrico = calcularEstadoHidrico(datosCorporativos);
  const puntuacionEco = calcularPuntuacionEco(datosCorporativos);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-5"
    >
      {/* Banner de Estado Hídrico */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl p-6 text-center ${estadoHidrico === 'verde'
          ? 'bg-gradient-to-br from-green-500 to-green-600'
          : estadoHidrico === 'rojo'
            ? 'bg-gradient-to-br from-red-500 to-red-600'
            : 'bg-gradient-to-br from-amber-500 to-amber-600'
          }`}
      >
        <div className="flex flex-col items-center gap-2">
          {estadoHidrico === 'verde' ? (
            <CheckCircle className="h-12 w-12 text-white" />
          ) : estadoHidrico === 'rojo' ? (
            <XCircle className="h-12 w-12 text-white" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-white" />
          )}
          <h2 className="text-xl font-bold text-white">
            {estadoHidrico === 'verde'
              ? 'Producto Verificado'
              : estadoHidrico === 'rojo'
                ? 'Alta Huella Hídrica'
                : 'Sin verificar'}
          </h2>
          <p className="text-sm text-white/80">
            {estadoHidrico === 'verde'
              ? 'Consumo hídrico sostenible'
              : estadoHidrico === 'rojo'
                ? 'Consumo superior a 800,000 L/mes'
                : 'Sin datos de ahorro verificados'}
          </p>
        </div>
      </motion.div>

      {/* Tabbed Content */}
      <Tabs defaultValue="hidrico" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hidrico" className="gap-2">
            <Droplets className="h-4 w-4" />
            Impacto Hídrico
          </TabsTrigger>
          <TabsTrigger value="producto" className="gap-2">
            <Package className="h-4 w-4" />
            Info Producto
          </TabsTrigger>
        </TabsList>

        {/* Impacto Hídrico Tab */}
        <TabsContent value="hidrico" className="mt-4 space-y-5">
          {/* Product Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">{producto.nombre}</h3>
                <p className="text-sm text-muted-foreground">{producto.marca}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {producto.categoria}
              </span>
            </div>

            {/* Eco Score - Calculado desde Supabase */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Puntuación Eco</span>
                <span className={`text-lg font-bold ${puntuacionEco >= 50 ? 'text-green-600' : puntuacionEco >= 25 ? 'text-amber-500' : 'text-red-500'}`}>
                  {puntuacionEco}/100
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${puntuacionEco}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full ${puntuacionEco >= 50 ? 'bg-green-500' : puntuacionEco >= 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Basado en consumo hídrico mensual de la planta productora
              </p>
            </div>
          </motion.div>

          {/* Datos Corporativos Hídricos - Supabase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg eco-gradient">
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-semibold text-foreground">Datos Corporativos Hídricos</h4>
            </div>

            {datosCorporativos?.encontrado ? (
              <div className="space-y-4">
                {/* Consumo Mensual - Prominente */}
                <div className="rounded-xl bg-card p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Consumo mensual de la planta</p>
                  <div className={`text-3xl font-bold ${estadoHidrico === 'verde' ? 'text-green-600' : estadoHidrico === 'rojo' ? 'text-red-500' : 'text-amber-500'}`}>
                    {formatearConsumoAgua(datosCorporativos.huellaHidricaMensual)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({formatearConsumoAgua(datosCorporativos.huellaHidricaAnual)} anuales)
                  </p>
                </div>

                {/* Detalles del Corporativo */}
                <div className="space-y-2">
                  <InfoRow
                    label="Corporativo"
                    value={datosCorporativos.nombreFabrica || 'No disponible'}
                    highlight
                  />
                  <InfoRow
                    label="Región"
                    value={datosCorporativos.ubicacion || 'No disponible'}
                  />
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">
                    Datos verificados en CONAGUA
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
                <div>
                  <h5 className="font-medium text-foreground">Producto no registrado</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este producto no se encuentra en nuestra base de datos hídrica.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Info Producto Tab (Open Food Facts) */}
        <TabsContent value="producto" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            {openFoodFactsData ? (
              <div className="flex flex-col items-center gap-4">
                {/* Product Image */}
                {openFoodFactsData.image_url && (
                  <div className="relative aspect-square w-48 overflow-hidden rounded-xl bg-muted">
                    <img
                      src={openFoodFactsData.image_url}
                      alt={openFoodFactsData.product_name || 'Producto'}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="w-full space-y-3 text-center">
                  <h3 className="text-xl font-bold text-foreground">
                    {openFoodFactsData.product_name || 'Nombre no disponible'}
                  </h3>
                  {openFoodFactsData.brands && (
                    <p className="text-sm text-muted-foreground">
                      Marca: {openFoodFactsData.brands}
                    </p>
                  )}
                  <p className="font-mono text-xs text-muted-foreground">
                    Código: {openFoodFactsData.code}
                  </p>
                </div>

                <div className="mt-2 rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Datos obtenidos de Open Food Facts
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <Package className="h-16 w-16 text-muted-foreground/40" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Información no disponible
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Este producto no se encuentra en la base de datos de Open Food Facts.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Discount Button */}
      {estadoConfianza === 'verde' && descuento > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <DiscountButton
            descuento={descuento}
            onClick={onClaimDiscount}
          />
        </motion.div>
      )}
    </motion.div>
  );
}


interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}
