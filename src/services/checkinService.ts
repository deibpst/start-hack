import { supabase } from '@/lib/supabase';
import type { ScannedProduct, CheckinReward, MonthlyStats } from '@/types/checkin';

/**
 * Genera cantidad aleatoria de monedas según probabilidad
 * 80% -> 5 monedas
 * 15% -> 10 monedas
 * 5% -> 20 monedas
 */
export function getRandomCoins(): number {
    const rand = Math.random();
    if (rand < 0.80) return 5;   // 80%
    if (rand < 0.95) return 10;  // 15%
    return 20;                    // 5%
}

/**
 * Realiza check-in diario y otorga monedas
 */
export async function doCheckin(userId: string): Promise<{ data: CheckinReward | null; error: Error | null }> {
    try {
        const coins = getRandomCoins();
        const now = new Date().toISOString();

        // Get current coins first
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('coins')
            .eq('id', userId)
            .single();

        const newCoins = (currentProfile?.coins || 0) + coins;

        // Update profile with new coins and last check-in
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                coins: newCoins,
                last_checkin: now,
            })
            .eq('id', userId);

        if (updateError) {
            return { data: null, error: updateError };
        }

        const messages = [
            '¡Check-in exitoso! Sigue así, guardián del agua 💧',
            '¡Monedas ganadas! Tu compromiso marca la diferencia 🌊',
            '¡Excelente! Cada acción cuenta para el planeta 🌍',
            '¡Genial! Estás haciendo del mundo un lugar mejor 💙',
        ];

        const reward: CheckinReward = {
            coins,
            message: messages[Math.floor(Math.random() * messages.length)],
        };

        return { data: reward, error: null };
    } catch (err) {
        return { data: null, error: err as Error };
    }
}

/**
 * Guarda producto escaneado en historial
 */
export async function saveScannedProduct(
    userId: string,
    productName: string,
    companyName: string | null
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('scanned_history')
            .insert({
                user_id: userId,
                product_name: productName,
                company_name: companyName,
            });

        return { error };
    } catch (err) {
        return { error: err as Error };
    }
}

/**
 * Obtiene productos escaneados del mes actual
 */
export async function getMonthlyScans(userId: string): Promise<{ data: ScannedProduct[]; error: Error | null }> {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data, error } = await supabase
            .from('scanned_history')
            .select('*')
            .eq('user_id', userId)
            .gte('scanned_at', firstDayOfMonth)
            .order('scanned_at', { ascending: false });

        if (error) {
            return { data: [], error };
        }

        return { data: data || [], error: null };
    } catch (err) {
        return { data: [], error: err as Error };
    }
}

/**
 * Calcula estadísticas mensuales y racha
 */
export async function getMonthlyStats(userId: string): Promise<{ data: MonthlyStats | null; error: Error | null }> {
    try {
        const { data: scans, error: scansError } = await getMonthlyScans(userId);

        if (scansError) {
            return { data: null, error: scansError };
        }

        // Obtener último check-in
        const { data: profile } = await supabase
            .from('profiles')
            .select('last_checkin')
            .eq('id', userId)
            .single();

        const checkinDates: Date[] = [];
        if (profile?.last_checkin) {
            const lastCheckin = new Date(profile.last_checkin);
            checkinDates.push(lastCheckin);
        }

        // Calcular racha (días consecutivos del mes actual)
        let currentStreak = 0;
        if (checkinDates.length > 0) {
            const today = new Date();
            const lastCheckin = checkinDates[0];

            // Si el último check-in fue hoy, contar racha
            if (lastCheckin.toDateString() === today.toDateString()) {
                currentStreak = 1;
            }
        }

        const stats: MonthlyStats = {
            totalScans: scans.length,
            currentStreak,
            checkinDates,
        };

        return { data: stats, error: null };
    } catch (err) {
        return { data: null, error: err as Error };
    }
}

/**
 * Genera mensaje motivacional según cantidad de escaneos
 */
export function getMotivationalMessage(scanCount: number): string {
    if (scanCount >= 16) {
        return '¡Eres un guardián del agua! Tu impacto es real y nos inspira a todos. 💙';
    } else if (scanCount >= 6) {
        return '¡Increíble! Estás tomando decisiones muy conscientes. ¡Sigue así!';
    } else {
        return '¡Buen comienzo! Cada paso cuenta para salvar el agua.';
    }
}
