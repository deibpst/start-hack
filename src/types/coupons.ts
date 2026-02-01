export type BenefitType = 'health' | 'savings' | 'environment';

export interface Coupon {
    id: string;
    user_id: string;
    product_barcode: string;
    product_name: string;
    coupon_code: string;
    discount_message: string;
    benefit_type: BenefitType;
    expires_at: string;
    is_used: boolean;
    used_at: string | null;
    water_saved_liters: number;
    created_at: string;
}

export interface CouponBenefit {
    type: BenefitType;
    title: string;
    message: string;
    icon: string;
}

export interface WaterComparison {
    productConsumption: number;
    categoryAverage: number;
    percentageBetter: number;
    isSustainable: boolean;
}
