import { supabase } from '@/lib/supabase';
import type { Experiencia, InscripcionExperiencia, PurchaseResult, ExperienciaStatus } from '@/types/experiencias';

/**
 * Obtener todas las experiencias activas
 */
export async function getExperiencias(): Promise<{ data: Experiencia[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('experiencias')
            .select('*')
            .eq('activa', true)
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
 * Obtener experiencias en las que el usuario está inscrito
 */
export async function getUserExperiences(userId: string): Promise<{ data: string[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('inscripciones_experiencias')
            .select('experiencia_id')
            .eq('user_id', userId);

        if (error) {
            return { data: [], error };
        }

        return { data: (data || []).map(item => item.experiencia_id), error: null };
    } catch (err) {
        return { data: [], error: err as Error };
    }
}

/**
 * Verificar estado de una experiencia para un usuario
 */
export async function getExperienciaStatus(
    experiencia: Experiencia,
    userId: string,
    userCoins: number
): Promise<ExperienciaStatus> {
    // Verificar si ya está inscrito
    const { data: inscripciones } = await getUserExperiences(userId);
    const isEnrolled = inscripciones.includes(experiencia.id);

    // Verificar si está agotado
    const isSoldOut = experiencia.cupo_actual >= experiencia.cupo_maximo;

    // Verificar si puede pagar
    const canAfford = userCoins >= experiencia.costo_monedas;

    // Puede comprar si tiene saldo, no está inscrito y hay cupo
    const canPurchase = canAfford && !isEnrolled && !isSoldOut;

    return {
        isEnrolled,
        isSoldOut,
        canAfford,
        canPurchase,
    };
}

/**
 * Canjear monedas por experiencia
 */
export async function purchaseExperience(
    userId: string,
    experienciaId: string
): Promise<PurchaseResult> {
    try {
        // 1. Obtener datos actuales del perfil y experiencia
        const [profileResult, experienciaResult] = await Promise.all([
            supabase.from('profiles').select('coins').eq('id', userId).single(),
            supabase.from('experiencias').select('*').eq('id', experienciaId).single(),
        ]);

        if (profileResult.error) {
            return { success: false, error: 'Error al obtener perfil' };
        }

        if (experienciaResult.error) {
            return { success: false, error: 'Error al obtener experiencia' };
        }

        const profile = profileResult.data;
        const experiencia = experienciaResult.data as Experiencia;

        // 2. Validar saldo
        if (profile.coins < experiencia.costo_monedas) {
            return {
                success: false,
                error: 'Saldo insuficiente',
                message: `Necesitas ${experiencia.costo_monedas - profile.coins} monedas más`,
            };
        }

        // 3. Validar cupo
        if (experiencia.cupo_actual >= experiencia.cupo_maximo) {
            return {
                success: false,
                error: 'Cupo agotado',
                message: 'No hay lugares disponibles',
            };
        }

        // 4. Verificar si ya está inscrito
        const { data: existingInscriptions } = await supabase
            .from('inscripciones_experiencias')
            .select('id')
            .eq('user_id', userId)
            .eq('experiencia_id', experienciaId);

        if (existingInscriptions && existingInscriptions.length > 0) {
            return {
                success: false,
                error: 'Ya estás inscrito',
                message: 'Ya canjeaste esta experiencia',
            };
        }

        // 5. Transacción: restar monedas
        const newCoins = profile.coins - experiencia.costo_monedas;
        const { error: updateCoinsError } = await supabase
            .from('profiles')
            .update({ coins: newCoins })
            .eq('id', userId);

        if (updateCoinsError) {
            return { success: false, error: 'Error al actualizar monedas' };
        }

        // 6. Incrementar cupo
        const { error: updateCupoError } = await supabase
            .from('experiencias')
            .update({ cupo_actual: experiencia.cupo_actual + 1 })
            .eq('id', experienciaId);

        if (updateCupoError) {
            // Revertir las monedas si falla
            await supabase
                .from('profiles')
                .update({ coins: profile.coins })
                .eq('id', userId);

            return { success: false, error: 'Error al actualizar cupo' };
        }

        // 7. Crear inscripción
        const { error: inscripcionError } = await supabase
            .from('inscripciones_experiencias')
            .insert({
                user_id: userId,
                experiencia_id: experienciaId,
                monedas_pagadas: experiencia.costo_monedas,
            });

        if (inscripcionError) {
            // Revertir cambios si falla
            await Promise.all([
                supabase.from('profiles').update({ coins: profile.coins }).eq('id', userId),
                supabase.from('experiencias').update({ cupo_actual: experiencia.cupo_actual }).eq('id', experienciaId),
            ]);

            return { success: false, error: 'Error al crear inscripción' };
        }

        return {
            success: true,
            message: `¡Experiencia canjeada! Se restaron ${experiencia.costo_monedas} monedas`,
        };
    } catch (err) {
        return {
            success: false,
            error: 'Error inesperado',
            message: (err as Error).message,
        };
    }
}
