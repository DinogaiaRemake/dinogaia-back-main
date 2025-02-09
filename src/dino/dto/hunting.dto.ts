export enum HuntingZone {
    BEACH = 'beach',
    JUNGLE = 'jungle',
    CANYON = 'canyon',
    SKY_ISLANDS = 'sky_islands',
    DRAGON_CAVE = 'dragon_cave',
    SAVANNA = 'savanna',
    MOUNTAIN = 'mountain',
    GRAND_CANYON = 'grand_canyon',
    MIDWORLD = 'midworld'
}

export interface Prey {
    name: string;
    rarity: number;  // 1-100
    xpGain: number;
    weightGain: number;
    isLegendary?: boolean;  // Pour les proies avec 
}

export interface Danger {
    name: string;
    healthDamage: number;
    manaDamage?: number;
    emeraldLoss?: number;
    description: string;
}

export interface HuntingZoneConfig {
    name: string;
    minLevel: number;
    quest?: string;
    preys: Prey[];
    dangers: Danger[];
    maxEvents: number;
    baseEventCount: number;
    dangerChance: number; // Pourcentage de risque de base pour la zone (ex: 30 pour 30%)
}

export const HUNTING_ZONES: { [key in HuntingZone]: HuntingZoneConfig } = {
    [HuntingZone.BEACH]: {
        name: 'La plage',
        minLevel: 1,
        baseEventCount: 3,
        maxEvents: 5,
        dangerChance: 10, //10% de chance de danger
        dangers: [
            { name: 'Attaque de requin', healthDamage: 18, description: 'Se faire attaquer par un requin' },
            { name: 'Attaque de requin blanc', healthDamage: 10, description: 'Se faire attaquer par un requin blanc' },
            { name: 'Attaque de crabe royal', healthDamage: 0, manaDamage: 30, description: 'Se faire attaquer par un crabe royal' },
            { name: 'Pince de crabe royal', healthDamage: 6, description: 'Se faire pincer par un crabe royal' },
            { name: 'Attaque d\'indigènes', healthDamage: 24, description: 'Se faire attaquer par un bataillon d\'indigènes du général' },
            { name: 'Attaque de baleine', healthDamage: 10, description: 'Se faire attaquer par une baleine bleue' }
        ],
        preys: [
            { name: 'baleine_bleue', rarity: 5, xpGain: 15, weightGain: 5 },
            { name: 'carpe_eau_douce', rarity: 5, xpGain: 5, weightGain: 1 },
            { name: 'crabe_dore', rarity: 10, xpGain: 10, weightGain: 1 },
            { name: 'poisson_febrile', rarity: 28, xpGain: 10, weightGain: 1 },
            { name: 'requin_citron', rarity: 8, xpGain: 15, weightGain: 3 },
            { name: 'requin_blanc', rarity: 8, xpGain: 15, weightGain: 3 },
            { name: 'mouette_offensive', rarity: 8, xpGain: 15, weightGain: 3 },
            { name: 'hippocampe', rarity: 3, xpGain: 15, weightGain: 3 },
            { name: 'epaulard_classique', rarity: 8, xpGain: 15, weightGain: 3 },
            { name: 'epaulard_joueur', rarity: 5, xpGain: 15, weightGain: 3 },
            { name: 'epaulard_joueur_dore', rarity: 2, xpGain: 15, weightGain: 3 },
            { name: 'dauphin_joueur', rarity: 5, xpGain: 12, weightGain: 2 },
            { name: 'dauphin_rieur', rarity: 3, xpGain: 15, weightGain: 3 },
            { name: 'crabe_royal', rarity: 2, xpGain: 20, weightGain: 2 }
        ]
    },
    [HuntingZone.JUNGLE]: {
        name: 'La pleine jungle',
        minLevel: 1,
        baseEventCount: 4,
        maxEvents: 6,
        dangerChance: 30, // 30% de chance de danger
        dangers: [
            { name: 'Collision avec un arbre', healthDamage: 18, description: 'Se prendre un arbre' },
            { name: 'Attaque de lézard doré', healthDamage: 0, manaDamage: 30, description: 'Se faire attaquer par un lézard doré' },
            { name: 'Attaque d\'éléphant', healthDamage: 20, description: 'Se faire attaquer par un éléphant colonel' },
            { name: 'Morsure de cobra', healthDamage: 20, description: 'Se faire mordre par un cobra royal' },
            { name: 'Aspiration de mana', healthDamage: 0, manaDamage: 23, description: 'Se faire aspirer de la mage par un lézard doré' }
        ],
        preys: [
            { name: 'lezard_dore', rarity: 20, xpGain: 3, weightGain: 2 },
            { name: 'hibou_hurleur', rarity: 15, xpGain: 1, weightGain: 1 },
            { name: 'renard_liseres', rarity: 15, xpGain: 3, weightGain: 3 },
            { name: 'cobra_royal', rarity: 15, xpGain: 5, weightGain: 2 },
            { name: 'panthere_noire', rarity: 12, xpGain: 7, weightGain: 4 },
            { name: 'lezard_cavernes', rarity: 15, xpGain: 8, weightGain: 1 },
            { name: 'panda', rarity: 5, xpGain: 20, weightGain: 3 },
            { name: 'tigre_blanc', rarity: 3, xpGain: 25, weightGain: 4 }
        ]
    },
    [HuntingZone.CANYON]: {
        name: 'Le canyon',
        minLevel: 1,
        baseEventCount: 3,
        maxEvents: 5,
        dangerChance: 35, // 35% de chance de danger
        dangers: [
            { name: 'Attaque d\'aigle', healthDamage: 15, description: 'Se faire attaquer par un aigle' },
            { name: 'Attaque d\'apprenti chaman', healthDamage: 15, manaDamage: 15, description: 'Se faire attaquer par un apprenti chaman' },
            { name: 'Attaque de chaman', healthDamage: 20, manaDamage: 20, description: 'Se faire attaquer par un chaman' }
        ],
        preys: [
            // Proies communes (50%)
            { name: 'lezard_dore', rarity: 10, xpGain: 3, weightGain: 2 },
            { name: 'vipere', rarity: 19, xpGain: 8, weightGain: 1 },
            { name: 'abeille', rarity: 20, xpGain: 1, weightGain: 0 },
            
            // Proies peu communes (39%)
            { name: 'girafe', rarity: 30, xpGain: 15, weightGain: 3 },
            
            // Items de compétence (10%)
            { name: 'heure_ecole', rarity: 3, xpGain: 0, weightGain: 0 },
            { name: 'trampoline', rarity: 3, xpGain: 0, weightGain: 0 },
            { name: 'haltere', rarity: 2, xpGain: 0, weightGain: 0 },
            { name: 'tapis_course', rarity: 2, xpGain: 0, weightGain: 0 },

            // Item légendaire (11%)
            { name: 'cle_doree', rarity: 11, xpGain: 50, weightGain: 0, isLegendary: true }
        ]
    },
    [HuntingZone.SKY_ISLANDS]: {
        name: 'Les îles du ciel',
        minLevel: 1,
        quest: 'iles_ciel',
        baseEventCount: 4,
        maxEvents: 6,
        dangerChance: 30, // 45% de chance de danger
        dangers: [
            { name: 'Chute dans l\'eau', healthDamage: 13, description: 'Tomber dans l\'eau' },
            { name: 'Aspiration de magie', healthDamage: 0, manaDamage: 20, description: 'Un crapaud doré t\'a aspiré de la magie' },
            { name: 'Attaque de baleine', healthDamage: 10, description: 'Tu t\'es fait attaquer par une baleine bleu' }
        ],
        preys: [
            { name: 'hibou_hurleur', rarity: 45, xpGain: 10, weightGain: 1 },
            { name: 'poulpe_geant', rarity: 35, xpGain: 20, weightGain: 3 },
            { name: 'epaulard_joueur', rarity: 20, xpGain: 15, weightGain: 2}
        ]
    },
    [HuntingZone.DRAGON_CAVE]: {
        name: 'Caverne du dragon',
        minLevel: 1,
        quest: 'caverne_dragon',
        baseEventCount: 4,
        maxEvents: 6,
        dangerChance: 50, // 50% de chance de danger
        dangers: [
            { name: 'Éboulement', healthDamage: 15, description: 'Des rochers tombent du plafond de la caverne' },
            { name: 'Morsure de chauve-souris', healthDamage: 10, description: 'Une chauve-souris vous mord' },
            { name: 'Attaque de lézard venimeux', healthDamage: 12, manaDamage: 15, description: 'Un lézard venimeux vous attaque' },
            { name: 'Chute dans une crevasse', healthDamage: 20, description: 'Vous glissez dans une crevasse profonde' }
        ],
        preys: [
            // Proies communes (60%)
            { name: 'lezard_cavernes', rarity: 25, xpGain: 8, weightGain: 1 },
            { name: 'lezard_dore', rarity: 20, xpGain: 10, weightGain: 2 },
            { name: 'chauve_souris', rarity: 15, xpGain: 5, weightGain: 1 },
            
            // Proies peu communes (30%)
            { name: 'salamandre', rarity: 15, xpGain: 12, weightGain: 2 },
            { name: 'rat', rarity: 15, xpGain: 15, weightGain: 3 },
            
            // Proies rares (10%)
            { name: 'lezard_ancien', rarity: 10, xpGain: 25, weightGain: 4, isLegendary: true }
        ]
    },
    [HuntingZone.SAVANNA]: {
        name: 'La savane',
        minLevel: 2,
        baseEventCount: 4,
        maxEvents: 6,
        dangerChance: 40, // 40% de chance de danger
        dangers: [
            { name: 'Morsure de tigre', healthDamage: 28, description: 'Se faire mordre par un tigre sacré' },
            { name: 'Attaque de rhinocéros', healthDamage: 25, description: 'Se faire attaquer par un Rhinoceros' },
            { name: 'Attaque de lion', healthDamage: 20, description: 'Se faire attaquer par un lion' }
        ],
        preys: [
            { name: 'zebre', rarity: 45, xpGain: 8, weightGain: 2 },
            { name: 'girafe', rarity: 35, xpGain: 15, weightGain: 3 },
            { name: 'lion_apprenti', rarity: 20, xpGain: 20, weightGain: 3 }
        ]
    },
    [HuntingZone.MOUNTAIN]: {
        name: 'La montagne',
        minLevel: 3,
        baseEventCount: 4,
        maxEvents: 6,
        dangerChance: 45, // 45% de chance de danger
        dangers: [
            { name: 'Glissade', healthDamage: 16, description: 'Danger : glissade' },
            { name: 'Avalanche', healthDamage: 28, description: 'Danger : tomber dans une avalanche' },
            { name: 'Création d\'avalanche', healthDamage: 27, description: 'Danger : Créer une avalanche' }
        ],
        preys: [
            { name: 'lynx_montagnes', rarity: 40, xpGain: 12, weightGain: 2 },
            { name: 'loup_pleureur', rarity: 35, xpGain: 10, weightGain: 2 },
            { name: 'ours_polaire', rarity: 25, xpGain: 20, weightGain: 4 }
        ]
    },
    [HuntingZone.GRAND_CANYON]: {
        name: 'Le grand Canyon',
        minLevel: 5,
        baseEventCount: 4,
        maxEvents: 6,
        dangerChance: 50, // 50% de chance de danger
        dangers: [
            { name: 'Vol', healthDamage: 0, emeraldLoss: 100, description: 'Te faire voler ta bourse en route' },
            { name: 'Charge de bison', healthDamage: 15, description: 'Te faire charger par un bison furax' },
            { name: 'Attaque de chaman', healthDamage: 20, manaDamage: 20, description: 'se faire attaquer par un chaman' }
        ],
        preys: [
            { name: 'aigle_mineur', rarity: 40, xpGain: 10, weightGain: 1 },
            { name: 'grizzly_canyons', rarity: 35, xpGain: 18, weightGain: 3 },
            { name: 'bison_furax', rarity: 25, xpGain: 15, weightGain: 3 }
        ]
    },
    [HuntingZone.MIDWORLD]: {
        name: 'Midworld',
        minLevel: 6,
        quest: 'midworld',
        baseEventCount: 5,
        maxEvents: 7,
        dangerChance: 55, // 55% de chance de danger
        dangers: [
            { name: 'Atterrissage UFO', healthDamage: 20, description: 'atterrissage très mouvementé de l\'UFO' },
            { name: 'Pillage aliens', healthDamage: 0, emeraldLoss: 100, description: 'se faire piller par des aliens' },
            { name: 'Perturbations UFO', healthDamage: 20, description: 'Tu as subi quelques perturbations dans l\'UFO' }
        ],
        preys: [
            { name: 'cyborgs_mg_v1', rarity: 45, xpGain: 15, weightGain: 2 },
            { name: 'alien_midworld', rarity: 35, xpGain: 20, weightGain: 2 },
            { name: 'demon_urbain', rarity: 20, xpGain: 25, weightGain: 3 }
        ]
    }
}; 