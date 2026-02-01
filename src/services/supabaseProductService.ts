import { supabase } from '@/lib/supabase';

/**
 * Datos del corporativo vinculado al producto
 */
export interface DatosCorporativos {
    encontrado: boolean;
    nombreFabrica: string | null;
    ubicacion: string | null;
    huellaHidricaAnual: number | null;
    huellaHidricaMensual: number | null;
    nombreProducto: string | null;
}

/**
 * Busca un producto en Supabase por nombre y obtiene datos del corporativo
 * @param nombreProducto - Nombre del producto desde Open Food Facts
 * @returns Datos del corporativo vinculado o null si no se encuentra
 */
export async function buscarProductoEnSupabase(
    nombreProducto: string
): Promise<DatosCorporativos> {
    try {
        // Limpiar el nombre para búsqueda más flexible
        const nombreLimpio = nombreProducto.trim().toLowerCase();

        // Buscar producto con ILIKE para coincidencia parcial
        const { data: productos, error: errorProducto } = await supabase
            .from('productos')
            .select(`
        id,
        nombre_producto,
        corporativo_id,
        corporativos (
          id,
          nombre,
          ubicacion,
          huella_hidrica_anual
        )
      `)
            .ilike('nombre_producto', `%${nombreLimpio}%`)
            .limit(1);

        if (errorProducto) {
            console.error('❌ Error al buscar producto en Supabase:', errorProducto);
            return {
                encontrado: false,
                nombreFabrica: null,
                ubicacion: null,
                huellaHidricaAnual: null,
                huellaHidricaMensual: null,
                nombreProducto: null,
            };
        }

        if (!productos || productos.length === 0) {
            console.log('ℹ️ Producto no encontrado en base de datos Cobalto:', nombreProducto);
            return {
                encontrado: false,
                nombreFabrica: null,
                ubicacion: null,
                huellaHidricaAnual: null,
                huellaHidricaMensual: null,
                nombreProducto: null,
            };
        }

        const producto = productos[0];
        const corporativo = producto.corporativos as any;

        if (!corporativo) {
            console.log('ℹ️ Producto encontrado pero sin corporativo vinculado');
            return {
                encontrado: true,
                nombreFabrica: null,
                ubicacion: null,
                huellaHidricaAnual: null,
                huellaHidricaMensual: null,
                nombreProducto: producto.nombre_producto,
            };
        }

        // Calcular huella hídrica mensual
        const huellaAnual = corporativo.huella_hidrica_anual || 0;
        const huellaMensual = Math.round(huellaAnual / 12);

        console.log('✅ Producto encontrado en Cobalto:', {
            producto: producto.nombre_producto,
            fabrica: corporativo.nombre,
            ubicacion: corporativo.ubicacion,
            huellaMensual,
        });

        return {
            encontrado: true,
            nombreFabrica: corporativo.nombre,
            ubicacion: corporativo.ubicacion,
            huellaHidricaAnual: huellaAnual,
            huellaHidricaMensual: huellaMensual,
            nombreProducto: producto.nombre_producto,
        };
    } catch (err) {
        console.error('❌ Error inesperado en buscarProductoEnSupabase:', err);
        return {
            encontrado: false,
            nombreFabrica: null,
            ubicacion: null,
            huellaHidricaAnual: null,
            huellaHidricaMensual: null,
            nombreProducto: null,
        };
    }
}

/**
 * Formatea el consumo de agua para mostrar en UI
 * @param litros - Cantidad de litros
 * @returns String formateado (ej: "1,234,567 L" o "1.2M L")
 */
export function formatearConsumoAgua(litros: number | null): string {
    if (litros === null || litros === 0) return 'N/A';

    if (litros >= 1_000_000) {
        return `${(litros / 1_000_000).toFixed(1)}M L`;
    }
    if (litros >= 1_000) {
        return `${(litros / 1_000).toFixed(1)}K L`;
    }
    return `${litros.toLocaleString()} L`;
}
