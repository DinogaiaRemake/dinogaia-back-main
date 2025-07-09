export enum CasinoGameType {
    SLOT_MACHINE = 'slot_machine',
    SCRATCH_TICKET = 'scratch_ticket'
}

export interface SlotMachineConfig {
    name: string;
    cost: number;
    symbols: string[];
    payouts: {
        [combination: string]: {
            emeralds?: number;
            items?: { key: string; quantity: number; }[];
            chance: number; // Pourcentage de chance pour cette combinaison spécifique
        }
    };
}

export interface ScratchTicketConfig {
    name: string;
    cost: number;
    symbols: string[];
    prizes: {
        combination: string[];
        emeralds?: number;
        items?: { key: string; quantity: number; }[];
        chance: number; // Pourcentage de chance (0-100)
    }[];
}

export const SLOT_MACHINES: { [key: string]: SlotMachineConfig } = {
    'machine_basique': {
        name: 'V-Rock Jackpot',
        cost: 5,
        symbols: ['dino', 'emerald', 'star', 'skull', 'crown', 'gem'],
        payouts: {
            'dino,dino,dino': { 
                emeralds: 1,
                chance: 15 // Gain très fréquent
            },
            'emerald,gem,emerald': { 
                emeralds: 2,
                chance: 12
            },
            'star,star,star': { 
                emeralds: 5,
                chance: 10
            },
            'skull,skull,skull': {
                emeralds: 15,
                chance: 8
            },
            'crown,crown,crown': {
                emeralds: 30,
                chance: 5
            },
            'gem,gem,gem': {
                emeralds: 50,
                chance: 3
            },
            'emerald,emerald,emerald': { 
                emeralds: 150,
                chance: 1 // Combinaison spéciale très rare
            }
        }
    }
};

export const SCRATCH_TICKETS: { [key: string]: ScratchTicketConfig } = {
    'ticket_basique': {
        name: 'Ticket à Gratter Basique',
        cost: 5,
        symbols: ['étoile', 'pièce', 'diamant', 'trèfle', 'coeur'],
        prizes: [
            { 
                combination: ['étoile', 'étoile', 'pièce'],
                emeralds: 1,
                chance: 25 // plus fréquent
            },
            { 
                combination: ['pièce', 'diamant', 'pièce'],
                emeralds: 5,
                chance: 15
            },
            { 
                combination: ['diamant', 'coeur', 'diamant'],
                emeralds: 10,
                chance: 10
            },
            {
                combination: ['trèfle', 'trèfle', 'diamant'],
                emeralds: 15,
                chance: 6
            },
            {
                combination: ['coeur', 'étoile', 'coeur'],
                emeralds: 250,
                chance: 1
            },
            {
                combination: ['diamant', 'diamant', 'diamant'],
                emeralds: 500,
                chance: 0.2
            }
        ]
    }
}; 