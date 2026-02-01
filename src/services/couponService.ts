import { supabase } from '@/lib/supabase';
import type { ProductoInfo } from '@/services/verificationService';
import type { Coupon, BenefitType, CouponBenefit, WaterComparison } from '@/types/coupons';

// Umbrales de sostenibilidad por categoría (litros de agua/mes)
const SUSTAINABILITY_THRESHOLDS: Record<string, number> = {
    'Bebidas': 100,
    'Alimentos': 200,
    'Lácteos': 150,
    'Snacks': 80,
    'General': 120,
};

// Promedios por categoría para comparación
const CATEGORY_AVERAGES: Record<string, number> = {
    'Bebidas': 150,
    'Alimentos': 300,
    'Lácteos': 200,
    'Snacks': 120,
    'General': 180,
};

/**
 * Calcula comparativa de consumo hídrico
 */
export function calculateWaterComparison(producto: ProductoInfo): WaterComparison {
    // Convertir ahorro a consumo (valor positivo)
    const productConsumption = Math.abs(producto.impacto.agua_ahorrada_litros);
    const categoryAverage = CATEGORY_AVERAGES[producto.categoria] || CATEGORY_AVERAGES['General'];

    const percentageBetter = ((categoryAverage - productConsumption) / categoryAverage) * 100;
    const threshold = SUSTAINABILITY_THRESHOLDS[producto.categoria] || SUSTAINABILITY_THRESHOLDS['General'];
    const isSustainable = productConsumption < threshold;

    return {
        productConsumption,
        categoryAverage,
        percentageBetter: Math.max(0, percentageBetter),
        isSustainable,
    };
}

/**
 * Determina si se debe generar cupón para el producto
 */
export function shouldGenerateCoupon(producto: ProductoInfo): boolean {
    const comparison = calculateWaterComparison(producto);
    return comparison.isSustainable && comparison.percentageBetter > 0;
}

/**
 * Genera código único de cupón
 */
export function generateCouponCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `COBALTO-VERDE-${timestamp}-${random}`;
}

/**
 * Determina tipo de beneficio según características del producto
 */
export function determineBenefitType(producto: ProductoInfo): BenefitType {
    const comparison = calculateWaterComparison(producto);

    // Más del 30% mejor → ahorro
    if (comparison.percentageBetter > 30) {
        return 'savings';
    }

    // Producto verificado y con puntuación eco alta → salud
    if (producto.verificado && producto.impacto.puntuacion_eco > 70) {
        return 'health';
    }

    // Default → ambiente
    return 'environment';
}

/**
 * Obtiene mensaje de beneficio según tipo
 */
export function getBenefitMessage(
    benefitType: BenefitType,
    producto: ProductoInfo,
    comparison: WaterComparison
): CouponBenefit {
    const percentage = Math.round(comparison.percentageBetter);
    const savedLiters = Math.round(comparison.categoryAverage - comparison.productConsumption);

    switch (benefitType) {
        case 'health':
            return {
                type: 'health',
                title: '💚 Beneficio para tu Salud',
                message: `Al elegir ${producto.nombre}, consumes ingredientes con menor procesamiento hídrico, cuidando tu salud y la del planeta.`,
                icon: '🌱',
            };

        case 'savings':
            return {
                type: 'savings',
                title: '💰 Ahorro Inteligente',
                message: `Este producto es un ${percentage}% más eficiente en su producción que el promedio, lo que te permite ahorrar dinero hoy mientras proteges el recurso del mañana.`,
                icon: '💎',
            };

        case 'environment':
            return {
                type: 'environment',
                title: '💙 Impacto Ambiental Positivo',
                message: `Con esta elección, ahorras aproximadamente ${savedLiters} litros de agua al mes. ¡Eres parte del cambio!`,
                icon: '💧',
            };
    }
}

/**
 * Guarda cupón en Supabase
 */
export async function saveCoupon(
    userId: string,
    producto: ProductoInfo,
    couponCode: string,
    benefitType: BenefitType,
    comparison: WaterComparison
): Promise<{ error: Error | null }> {
    try {
        const benefit = getBenefitMessage(benefitType, producto, comparison);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
        const waterSaved = comparison.categoryAverage - comparison.productConsumption;

        const { error } = await supabase
            .from('user_coupons')
            .insert({
                user_id: userId,
                product_barcode: producto.barcode,
                product_name: producto.nombre,
                coupon_code: couponCode,
                discount_message: benefit.message,
                benefit_type: benefitType,
                expires_at: expiresAt.toISOString(),
                water_saved_liters: waterSaved,
            });

        return { error };
    } catch (err) {
        return { error: err as Error };
    }
}

/**
 * Obtiene cupones del usuario
 */
export async function getUserCoupons(userId: string): Promise<{ data: Coupon[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('user_coupons')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return { data: [], error };
        }

        return { data: data || [], error: null };
    } catch (err) {
        return { data: [], error: err as Error };
    }
}

/**
 * Marca cupón como usado
 */
export async function markCouponAsUsed(couponId: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('user_coupons')
            .update({
                is_used: true,
                used_at: new Date().toISOString(),
            })
            .eq('id', couponId);

        return { error };
    } catch (err) {
        return { error: err as Error };
    }
}
