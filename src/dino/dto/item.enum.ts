export enum ItemType {
    PREY = 'prey',
    SECURITY = 'security',
    HYGIENE = 'hygiene',
    FOOD = 'food',
    SKILL = 'skill',
    WEAPON = 'weapon',
    FIGHT_BOOST = 'fight_boost',
    QUEST_ITEM = 'quest_item'
}

export interface ItemConfig {
    name: string;
    type: ItemType;
    price: number;
    description: string;
    securityBonus?: number;
    hygieneBonus?: number;
    weightGain?: number;
    xpGain?: number;
    skillBonus?: {
        intelligence?: number;
        agility?: number;
        strength?: number;
        endurance?: number;
    };
    weaponStats?: {
        minPreys: number;
        maxPreys: number;
    };
    fightBoost?: {
        health: number;
        mana: number;
    };
}

export const ITEMS_CONFIG: { [key: string]: ItemConfig } = {
    // Proies de la plage
    'poisson_febrile': {
        name: 'Poisson fébrile',
        type: ItemType.PREY,
        price: 3,
        description: 'Un poisson commun de la plage',
        weightGain: 1,
        xpGain: 0
    },
    'crabe_royal': {
        name: 'Crabe Royal',
        type: ItemType.PREY,
        price: 200,
        description: 'Un crabe majestueux aux pinces dorées',
        weightGain: 2,
        xpGain: 0
    },
    'crabe_dore': {
        name: 'Crabe doré',
        type: ItemType.PREY,
        price: 10,
        description: 'Un crabe à la carapace dorée',
        weightGain: 1,
        xpGain: 0
    },
    'baleine_bleue': {
        name: 'Baleine Bleue',
        type: ItemType.PREY,
        price: 150,
        description: 'Une énorme baleine bleue',
        weightGain: 5,
        xpGain: 0
    },
    'dauphin_joueur': {
        name: 'Dauphin joueur',
        type: ItemType.PREY,
        price: 125,
        description: 'Un dauphin très joueur',
        weightGain: 19,
        xpGain: 0
    },
    'carpe_eau_douce': {
        name: 'Carpe d\'eau douce',
        type: ItemType.PREY,
        price: 40,
        description: 'Une carpe d\'eau douce',
        weightGain: 1,
        xpGain: 0
    },
    'requin_citron': {
        name: 'Requin citron',
        type: ItemType.PREY,
        price: 100,
        description: 'Un requin citron',
        weightGain: 3,
        xpGain: 0
    },
    'requin_blanc': {
        name: 'Requin blanc',
        type: ItemType.PREY,
        price: 125,
        description: 'Un requin blanc',
        weightGain: 3,
        xpGain: 0
    },
    'mouette_offensive': {
        name: 'Mouette Offensive',
        type: ItemType.PREY,
        price: 80,
        description: 'Une mouette agressive',
        weightGain: 3,
        xpGain: 0
    },
    'hippocampe': {
        name: 'Hippocampe',
        type: ItemType.PREY,
        price: 20,
        description: 'Un hippocampe rare',
        weightGain: 3,
        xpGain: 0
    },
    'epaulard_classique': {
        name: 'Epaulard Classique',
        type: ItemType.PREY,
        price: 130,
        description: 'Un épaulard classique',
        weightGain: 3,
        xpGain: 0
    },
    'epaulard_joueur': {
        name: 'Epaulard joueur',
        type: ItemType.PREY,
        price: 180,
        description: 'Un épaulard joueur légendaire',
        weightGain: 3,
        xpGain: 0
    },
    'epaulard_joueur_dore': {
        name: 'Epaulard joueur doré',
        type: ItemType.PREY,
        price: 250,
        description: 'Un épaulard joueur doré légendaire',
        weightGain: 3,
        xpGain: 0
    },
    'dauphin_rieur': {
        name: 'Dauphin rieur',
        type: ItemType.PREY,
        price: 90,
        description: 'Un dauphin rieur',
        weightGain: 3,
        xpGain: 0
    },

    // Proies de la jungle
    'lezard_dore': {
        name: 'Lézard doré',
        type: ItemType.PREY,
        price: 30,
        description: 'Un lézard à la peau dorée',
        weightGain: 2,
        xpGain: 0
    },
    'hibou_hurleur': {
        name: 'Hibou hurleur',
        type: ItemType.PREY,
        price: 15,
        description: 'Un hibou qui hurle',
        weightGain: 1,
        xpGain: 0
    },
    'renard_liseres': {
        name: 'Renard des lisères',
        type: ItemType.PREY,
        price: 30,
        description: 'Un renard des lisères',
        weightGain: 3,
        xpGain: 0
    },
    'cobra_royal': {
        name: 'Cobra royal',
        type: ItemType.PREY,
        price: 80,
        description: 'Un cobra royal',
        weightGain: 2,
        xpGain: 0
    },
    'panthere_noire': {
        name: 'Panthère noire',
        type: ItemType.PREY,
        price: 150,
        description: 'Une panthère noire',
        weightGain: 4,
        xpGain: 0
    },
    'lezard_cavernes': {
        name: 'Lézard des cavernes',
        type: ItemType.PREY,
        price: 7,
        description: 'Un lézard des cavernes',
        weightGain: 1,
        xpGain: 0
    },
    'panda': {
        name: 'Panda',
        type: ItemType.PREY,
        price: 300,
        description: 'Un panda rare',
        weightGain: 3,
        xpGain: 0
    },
    'tigre_blanc': {
        name: 'Tigre Blanc',
        type: ItemType.PREY,
        price: 400,
        description: 'Un tigre blanc légendaire',
        weightGain: 4,
        xpGain: 0
    },

    // Proies du canyon
    'aigle_mineur': {
        name: 'Aigle mineur',
        type: ItemType.PREY,
        price: 62,
        description: 'Un aigle mineur',
        weightGain: 1,
        xpGain: 0
    },
    'python_chasseur': {
        name: 'Python chasseur',
        type: ItemType.PREY,
        price: 120,
        description: 'Un python chasseur',
        weightGain: 2,
        xpGain: 0
    },

    // Proies des îles du ciel
    'poulpe_geant': {
        name: 'Poulpe Géant',
        type: ItemType.PREY,
        price: 250,
        description: 'Un poulpe géant',
        weightGain: 3,
        xpGain: 0
    },

    // Proies de la savane
    'zebre': {
        name: 'Zèbre',
        type: ItemType.PREY,
        price: 43,
        description: 'Un zèbre',
        weightGain: 2,
        xpGain: 0
    },
    'girafe': {
        name: 'Girafe',
        type: ItemType.PREY,
        price: 49,
        description: 'Une girafe',
        weightGain: 3,
        xpGain: 0
    },
    'lion_apprenti': {
        name: 'Lion apprenti',
        type: ItemType.PREY,
        price: 180,
        description: 'Un lion apprenti',
        weightGain: 3,
        xpGain: 0
    },

    // Proies de la montagne
    'lynx_montagnes': {
        name: 'Lynx des montagnes',
        type: ItemType.PREY,
        price: 55,
        description: 'Un lynx des montagnes',
        weightGain: 2,
        xpGain: 0
    },
    'loup_pleureur': {
        name: 'Loup pleureur',
        type: ItemType.PREY,
        price: 140,
        description: 'Un loup pleureur',
        weightGain: 2,
        xpGain: 0
    },
    'ours_polaire': {
        name: 'Ours polaire',
        type: ItemType.PREY,
        price: 300,
        description: 'Un ours polaire',
        weightGain: 4,
        xpGain: 0
    },

    // Proies du grand canyon
    'grizzly_canyons': {
        name: 'Grizzly des canyons',
        type: ItemType.PREY,
        price: 250,
        description: 'Un grizzly des canyons',
        weightGain: 3,
        xpGain: 0
    },
    'bison_furax': {
        name: 'Bison furax',
        type: ItemType.PREY,
        price: 200,
        description: 'Un bison furax',
        weightGain: 3,
        xpGain: 0
    },

    // Proies de Midworld
    'cyborgs_mg_v1': {
        name: 'Cyborgs mg-V1',
        type: ItemType.PREY,
        price: 300,
        description: 'Un cyborg mg-V1',
        weightGain: 2,
        xpGain: 0
    },
    'alien_midworld': {
        name: 'Alien de MidWorld',
        type: ItemType.PREY,
        price: 350,
        description: 'Un alien de MidWorld',
        weightGain: 2,
        xpGain: 0
    },
    'demon_urbain': {
        name: 'Demon Urbain',
        type: ItemType.PREY,
        price: 400,
        description: 'Un démon urbain',
        weightGain: 3,
        xpGain: 0
    },

    // Items de sécurité
    'camera': {
        name: 'Caméra de surveillance',
        type: ItemType.SECURITY,
        price: 100,
        description: 'Augmente la sécurité de la grotte',
        securityBonus: 10
    },
    'alarme': {
        name: 'Système d\'alarme',
        type: ItemType.SECURITY,
        price: 200,
        description: 'Augmente significativement la sécurité de la grotte',
        securityBonus: 20
    },

    // Items d'hygiène
    'savon': {
        name: 'Savon',
        type: ItemType.HYGIENE,
        price: 50,
        description: 'Améliore l\'hygiène de la grotte',
        hygieneBonus: 5
    },
    'desinfectant': {
        name: 'Désinfectant',
        type: ItemType.HYGIENE,
        price: 100,
        description: 'Améliore significativement l\'hygiène de la grotte',
        hygieneBonus: 15
    },

    // Nourriture
    'viande_sechee': {
        name: 'Viande séchée',
        type: ItemType.FOOD,
        price: 75,
        description: 'Nourriture conservée',
        weightGain: 2,
    },

    // Livres de compétences
    'heure_ecole': {
        name: 'Heure d\'école',
        type: ItemType.SKILL,
        price: 5,
        description: 'Augmente l\'intelligence',
        skillBonus: {
            intelligence: 1
        }
    },
    'trampoline': {
        name: 'Trampoline',
        type: ItemType.SKILL,
        price: 5,
        description: 'Augmente l\'agilité',
        skillBonus: {
            agility: 1
        }
    },
    'haltere': {
        name: 'Haltère',
        type: ItemType.SKILL,
        price: 5,
        description: 'Augmente la force',
        skillBonus: {
            strength: 1
        }
    },
    'tapis_course': {
        name: 'Tapis de course',
        type: ItemType.SKILL,
        price: 5,
        description: 'Augmente l\'endurance',
        skillBonus: {
            endurance: 1
        }
    },

    // Armes
    'lance_pierre': {
        name: 'Lance-pierre',
        type: ItemType.WEAPON,
        price: 20,
        description: 'Cette arme de très courte portée mais bon marché te permettra d\'effectuer 1 à 2 évènements par chasse.',
        weaponStats: {
            minPreys: 1,
            maxPreys: 2
        }
    },
    'lance': {
        name: 'Lance',
        type: ItemType.WEAPON,
        price: 60,
        description: 'Légère, puissante et facile à manier, la lance te permettra d\'effectuer 1 à 4 évènements par chasse.',
        weaponStats: {
            minPreys: 1,
            maxPreys: 4
        }
    },
    'arbalete': {
        name: 'Arbalète',
        type: ItemType.WEAPON,
        price: 250,
        description: 'Alliant à la fois portée et puissance, l\'arbalète te permettra d\'effectuer 3 à 5 évènements par chasse.',
        weaponStats: {
            minPreys: 3,
            maxPreys: 5
        }
    },
    'fusil_chasse': {
        name: 'Fusil de chasse',
        type: ItemType.WEAPON,
        price: 600,
        description: 'Sa puissance de feu et sa maniabilité en font l\'arme idéale pour partir en chasse. Tu pourras effectuer 4 à 6 évènements par chasse.',
        weaponStats: {
            minPreys: 4,
            maxPreys: 6
        }
    },
    'fusil_lunette': {
        name: 'Fusil à lunette',
        type: ItemType.WEAPON,
        price: 1250,
        description: 'L\'arme de précision par excellence. Avec elle, rien ne t\'échappera et tu pourras effectuer 5 à 7 évènements par chasse.',
        weaponStats: {
            minPreys: 5,
            maxPreys: 7
        }
    },
    'lance_roquettes': {
        name: 'Lance-roquettes',
        type: ItemType.WEAPON,
        price: 2200,
        description: 'La puissance dévastatrice de ses roquettes te permettra d\'effectuer une valeur constante de 7 évènements à chaque chasse !',
        weaponStats: {
            minPreys: 7,
            maxPreys: 7
        }
    },
    'bazooka': {
        name: 'Bazooka',
        type: ItemType.WEAPON,
        price: 2400,
        description: 'Issu des armureries du grand conseil, le bazooka affiche une puissance qui n\'a d\'égale que son imprévisibilité. Il te permet d\'effectuer 1 à 16 évènements par chasse.',
        weaponStats: {
            minPreys: 1,
            maxPreys: 16
        }
    },

    // Items spéciaux des quêtes
    'ailes_divines': {
        name: 'Ailes Divines',
        type: ItemType.QUEST_ITEM,
        price: 1000,
        description: 'Des ailes magiques permettant d\'accéder aux îles célestes',
        weightGain: 0,
        xpGain: 0
    },
}; 