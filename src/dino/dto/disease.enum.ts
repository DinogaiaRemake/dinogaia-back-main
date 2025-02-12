export enum Disease {
    GRIPPE = 'grippe',
    PARASITES = 'parasites',
    INFECTION = 'infection',
    FRACTURE = 'fracture',
    EMPOISONNEMENT = 'empoisonnement'
}

export interface DiseaseConfig {
    name: string;
    dailyDamage: number;
    description: string;
}

export const DISEASE_CONFIG: Record<Disease, DiseaseConfig> = {
    [Disease.GRIPPE]: {
        name: 'Grippe',
        dailyDamage: 5,
        description: 'Une maladie commune qui affaiblit votre dinosaure'
    },
    [Disease.PARASITES]: {
        name: 'Parasites',
        dailyDamage: 3,
        description: 'Des parasites qui se nourrissent de l\'énergie de votre dinosaure'
    },
    [Disease.INFECTION]: {
        name: 'Infection',
        dailyDamage: 8,
        description: 'Une infection grave qui nécessite un traitement rapide'
    },
    [Disease.FRACTURE]: {
        name: 'Fracture',
        dailyDamage: 2,
        description: 'Une blessure qui limite les mouvements de votre dinosaure'
    },
    [Disease.EMPOISONNEMENT]: {
        name: 'Empoisonnement',
        dailyDamage: 10,
        description: 'Un empoisonnement grave qui doit être traité rapidement'
    }
}; 