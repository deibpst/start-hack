export interface ScannedProduct {
    id: string;
    user_id: string;
    product_name: string;
    company_name: string | null;
    scanned_at: string;
}

export interface CheckinReward {
    coins: number;
    message: string;
}

export interface MonthlyStats {
    totalScans: number;
    currentStreak: number;
    checkinDates: Date[];
}
