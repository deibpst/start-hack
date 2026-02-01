export interface Experiencia {
    id: string;
    titulo: string;
    empresa: string;
    descripcion_corta: string;
    descripcion_larga: string;
    costo_monedas: number;
    cupo_maximo: number;
    cupo_actual: number;
    imagen_url: string | null;
    activa: boolean;
    created_at: string;
}

export interface InscripcionExperiencia {
    id: string;
    user_id: string;
    experiencia_id: string;
    monedas_pagadas: number;
    created_at: string;
}

export interface PurchaseResult {
    success: boolean;
    error?: string;
    message?: string;
}

export interface ExperienciaStatus {
    isEnrolled: boolean;
    isSoldOut: boolean;
    canAfford: boolean;
    canPurchase: boolean;
}
