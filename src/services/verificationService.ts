import anexoTecnico from '@/data/anexo_tecnico.json';

export interface ProductoInfo {
  barcode: string;
  nombre: string;
  marca: string;
  categoria: string;
  verificado: boolean;
  impacto: {
    agua_ahorrada_litros: number;
    co2e_evitado_kg: number;
    puntuacion_eco: number;
  };
  fabrica: {
    nombre: string;
    ahorro_porcentaje: number;
    tecnologias: string[];
  };
  region: {
    nombre: string;
    estado_sequia: string;
    spi: number;
  };
  descuento_disponible: number;
}

export interface PruebaDeImpacto {
  productoId: string;
  fabricaId: string;
  timestamp: number;
  ahorroAgua: number;
  co2eEvitado: number;
  regionSequia: string;
  spiAlMomento: number;
  hash: string;
}

export type EstadoConfianza = 'verde' | 'rojo' | 'pendiente';

/**
 * Busca un producto por su código de barras
 */
export function buscarProducto(barcode: string): ProductoInfo | null {
  const producto = anexoTecnico.productos[barcode as keyof typeof anexoTecnico.productos];
  
  if (!producto) {
    return null;
  }

  const fabrica = anexoTecnico.fabricas[producto.fabrica_id as keyof typeof anexoTecnico.fabricas];
  const region = anexoTecnico.regiones[fabrica.region as keyof typeof anexoTecnico.regiones];

  return {
    barcode,
    nombre: producto.nombre,
    marca: producto.marca,
    categoria: producto.categoria,
    verificado: producto.verificado,
    impacto: {
      agua_ahorrada_litros: producto.impacto.agua_ahorrada_litros,
      co2e_evitado_kg: producto.impacto.co2e_evitado_kg,
      puntuacion_eco: producto.impacto.puntuacion_eco,
    },
    fabrica: {
      nombre: fabrica.nombre,
      ahorro_porcentaje: fabrica.ahorro_porcentaje,
      tecnologias: fabrica.tecnologias_implementadas,
    },
    region: {
      nombre: region.nombre,
      estado_sequia: region.estado_sequia,
      spi: region.spi,
    },
    descuento_disponible: producto.descuento_disponible,
  };
}

/**
 * Determina el estado de confianza basado en los datos del producto
 */
export function obtenerEstadoConfianza(producto: ProductoInfo): EstadoConfianza {
  const { umbrales } = anexoTecnico;
  
  // Si no está verificado, es rojo
  if (!producto.verificado) {
    return 'rojo';
  }

  // Si está en zona de sequía y tiene ahorro significativo, es verde
  const enSequia = producto.region.spi < umbrales.spi_sequia_moderada;
  const ahorroSignificativo = producto.fabrica.ahorro_porcentaje >= umbrales.ahorro_minimo_certificacion;
  const puntuacionAlta = producto.impacto.puntuacion_eco >= umbrales.puntuacion_eco_minima_verde;

  if (enSequia && ahorroSignificativo && puntuacionAlta) {
    return 'verde';
  }

  if (puntuacionAlta) {
    return 'verde';
  }

  return 'rojo';
}

/**
 * Genera una Prueba de Impacto para el smart contract
 */
export function generarPruebaDeImpacto(producto: ProductoInfo): PruebaDeImpacto {
  const timestamp = Date.now();
  
  // Simular hash (en producción sería un hash criptográfico real)
  const dataString = `${producto.barcode}-${timestamp}-${producto.impacto.agua_ahorrada_litros}`;
  const hash = `0x${Array.from(dataString).map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 64)}`;

  return {
    productoId: producto.barcode,
    fabricaId: producto.fabrica.nombre,
    timestamp,
    ahorroAgua: producto.impacto.agua_ahorrada_litros,
    co2eEvitado: producto.impacto.co2e_evitado_kg,
    regionSequia: producto.region.estado_sequia,
    spiAlMomento: producto.region.spi,
    hash,
  };
}

/**
 * Calcula el descuento final aplicable
 */
export function calcularDescuento(producto: ProductoInfo): number {
  if (!producto.verificado) return 0;
  
  const { incentivos, umbrales } = anexoTecnico;
  let descuento = incentivos.descuento_base_porcentaje;

  // Bonus por sequía severa
  if (producto.region.spi < umbrales.spi_sequia_severa) {
    descuento += incentivos.bonus_sequia_severa;
  }

  // Bonus por ahorro excepcional (>40%)
  if (producto.fabrica.ahorro_porcentaje > 40) {
    descuento += incentivos.bonus_ahorro_excepcional;
  }

  return Math.min(descuento, producto.descuento_disponible);
}

/**
 * Obtiene todos los códigos de barras disponibles (para demo)
 */
export function obtenerCodigosDemo(): string[] {
  return Object.keys(anexoTecnico.productos);
}

/**
 * Traduce el estado de sequía a texto amigable
 */
export function traducirEstadoSequia(estado: string): string {
  const traducciones: Record<string, string> = {
    'normal': 'Condiciones normales',
    'moderada': 'Sequía moderada',
    'severa': 'Sequía severa',
  };
  return traducciones[estado] || estado;
}

/**
 * Traduce tecnologías a texto amigable
 */
export function traducirTecnologia(tecnologia: string): string {
  const traducciones: Record<string, string> = {
    'reciclaje_agua': 'Reciclaje de agua',
    'riego_eficiente': 'Riego eficiente',
    'sensores_iot': 'Sensores IoT',
    'optimizacion_procesos': 'Optimización de procesos',
    'tratamiento_aguas': 'Tratamiento de aguas',
    'captacion_lluvia': 'Captación de lluvia',
  };
  return traducciones[tecnologia] || tecnologia;
}