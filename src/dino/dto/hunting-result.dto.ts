export interface HuntingPreyResult {
    type: 'prey';
    name: string;
    displayName: string;
    xpGain: number;
    weightGain: number;
    price: number;
    description: string;
    isLegendary?: boolean;
}

export interface HuntingDangerResult {
    type: 'danger';
    name: string;
    description: string;
    healthDamage: number;
    manaDamage?: number;
    emeraldLoss?: number;
}

export interface RaidResult {
    success: boolean;
    healthDamage?: number;
    stolenItems?: {
        itemKey: string;
        displayName: string;
        quantity: number;
    }[];
    targetDino: {
        id: number;
        name: string;
    };
    message: string;
}

export type HuntingResult = HuntingPreyResult | HuntingDangerResult;

export interface HuntingResponse {
    events: HuntingResult[];
} 