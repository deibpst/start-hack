import { motion } from 'framer-motion';
import { Droplets, Leaf, Factory, MapPin, Package, AlertTriangle } from 'lucide-react';
import { TrustTrafficLight } from './TrustTrafficLight';
import { DiscountButton } from './DiscountButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProductoInfo, EstadoConfianza } from '@/services/verificationService';
import { traducirEstadoSequia, traducirTecnologia, calcularDescuento } from '@/services/verificationService';
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

export function ProductCard({ producto, estadoConfianza, onClaimDiscount, openFoodFactsData, datosCorporativos }: ProductCardProps) {
  const descuento = calcularDescuento(producto);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-5"
    >
      {/* Trust Traffic Light */}
      <TrustTrafficLight estado={estadoConfianza} />

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

            {/* Impact Metrics */}
            {producto.verificado && (
              <div className="mb-4 grid grid-cols-2 gap-3">
                <MetricCard
                  icon={Droplets}
                  value={`${producto.impacto.agua_ahorrada_litros.toLocaleString()}`}
                  unit="litros"
                  label="Agua ahorrada"
                  variant="water"
                />
                <MetricCard
                  icon={Leaf}
                  value={producto.impacto.co2e_evitado_kg.toFixed(2)}
                  unit="kg CO₂e"
                  label="Emisiones evitadas"
                  variant="eco"
                />
              </div>
            )}

            {/* Eco Score */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Puntuación Eco</span>
                <span className="text-lg font-bold text-primary">{producto.impacto.puntuacion_eco}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${producto.impacto.puntuacion_eco}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                  className="h-full eco-gradient"
                />
              </div>
            </div>
          </motion.div>

          {/* Factory Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <Factory className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Información del Productor</h4>
            </div>

            <div className="space-y-3">
              <InfoRow label="Fábrica" value={producto.fabrica.nombre} />
              <InfoRow
                label="Ahorro de agua"
                value={`${producto.fabrica.ahorro_porcentaje}%`}
                highlight={producto.fabrica.ahorro_porcentaje >= 25}
              />

              {producto.fabrica.tecnologias.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Tecnologías implementadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {producto.fabrica.tecnologias.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      >
                        {traducirTecnologia(tech)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                  <div className="text-3xl font-bold text-primary">
                    {formatearConsumoAgua(datosCorporativos.huellaHidricaMensual)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({formatearConsumoAgua(datosCorporativos.huellaHidricaAnual)} anuales)
                  </p>
                </div>

                {/* Detalles del Corporativo */}
                <div className="space-y-2">
                  <InfoRow
                    label="Fábrica"
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
                    Datos verificados en base de datos Cobalto
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <AlertTriangle className="h-10 w-10 text-warning" />
                <div>
                  <h5 className="font-medium text-foreground">Producto no registrado</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este producto no se encuentra en nuestra base de datos hídrica.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Region Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              <h4 className="font-semibold text-foreground">Condiciones Hídricas</h4>
            </div>

            <div className="space-y-3">
              <InfoRow label="Región" value={producto.region.nombre} />
              <InfoRow
                label="Estado de sequía"
                value={traducirEstadoSequia(producto.region.estado_sequia)}
                highlight={producto.region.estado_sequia !== 'normal'}
              />
              <InfoRow
                label="Índice SPI"
                value={producto.region.spi.toFixed(1)}
              />
            </div>
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

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  unit: string;
  label: string;
  variant: 'water' | 'eco';
}

function MetricCard({ icon: Icon, value, unit, label, variant }: MetricCardProps) {
  return (
    <div className={`rounded-xl p-4 ${variant === 'water' ? 'water-gradient' : 'eco-gradient'}`}>
      <Icon className="mb-2 h-5 w-5 text-white/80" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/80">{unit}</div>
      <div className="mt-1 text-xs text-white/70">{label}</div>
    </div>
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
