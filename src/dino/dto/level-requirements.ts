import { DinoSpecies } from './create-dino.dto';

export interface LevelRequirements {
    minAge: number;
    minWeight: number;
    maxForce: number;
    maxEndurance: number;
    maxAgility: number;
    maxIntelligence: number;
    maxExperience: number;
    quest?: string[];
}

export interface SpeciesLevelRequirements {
    [key: number]: LevelRequirements;
}

export const TREX_LEVELS: SpeciesLevelRequirements = {
    2: {
        minAge: 15,
        minWeight: 3,
        maxForce: 13,
        maxEndurance: 10,
        maxAgility: 9,
        maxIntelligence: 8,
        maxExperience: 20
    },
    3: {
        minAge: 30,
        minWeight: 12,
        maxForce: 65,
        maxEndurance: 50,
        maxAgility: 45,
        maxIntelligence: 40,
        maxExperience: 45,
        quest: ['caverne_dragon']
    },
    4: {
        minAge: 50,
        minWeight: 25,
        maxForce: 260,
        maxEndurance: 200,
        maxAgility: 180,
        maxIntelligence: 160,
        maxExperience: 175,
        quest: ['iles_ciel']
    },
    5: {
        minAge: 70,
        minWeight: 35,
        maxForce: 650,
        maxEndurance: 500,
        maxAgility: 450,
        maxIntelligence: 400,
        maxExperience: 450,
        quest: ['ufo']
    },
    6: {
        minAge: 95,
        minWeight: 46,
        maxForce: 1950,
        maxEndurance: 1500,
        maxAgility: 1350,
        maxIntelligence: 1200,
        maxExperience: 1000,
        quest: ['midworld']
    },
    7: {
        minAge: 120,
        minWeight: 110,
        maxForce: 3900,
        maxEndurance: 3000,
        maxAgility: 2700,
        maxIntelligence: 2400,
        maxExperience: 2000
    },
    8: {
        minAge: 200,
        minWeight: 340,
        maxForce: 6500,
        maxEndurance: 5000,
        maxAgility: 4500,
        maxIntelligence: 4000,
        maxExperience: 5000,
        quest: ['tete_3_cornes', 'numero_2']
    },
    9: {
        minAge: 320,
        minWeight: 800,
        maxForce: 11375,
        maxEndurance: 8750,
        maxAgility: 7875,
        maxIntelligence: 7000,
        maxExperience: 10000,
        quest: ['pilleurs_tombe', 'utopique_pangee', 'traces_mythe']
    }
};

export const VELOCIRAPTOR_LEVELS: SpeciesLevelRequirements = {
    2: {
        minAge: 15,
        minWeight: 3,
        maxForce: 8,
        maxEndurance: 9,
        maxAgility: 11,
        maxIntelligence: 12,
        maxExperience: 20
    },
    3: {
        minAge: 30,
        minWeight: 12,
        maxForce: 40,
        maxEndurance: 45,
        maxAgility: 55,
        maxIntelligence: 60,
        maxExperience: 45,
        quest: ['caverne_dragon']
    },
    4: {
        minAge: 50,
        minWeight: 25,
        maxForce: 160,
        maxEndurance: 180,
        maxAgility: 220,
        maxIntelligence: 240,
        maxExperience: 175,
        quest: ['iles_ciel']
    },
    5: {
        minAge: 70,
        minWeight: 35,
        maxForce: 400,
        maxEndurance: 450,
        maxAgility: 550,
        maxIntelligence: 600,
        maxExperience: 450,
        quest: ['ufo']
    },
    6: {
        minAge: 95,
        minWeight: 46,
        maxForce: 1350,
        maxEndurance: 1200,
        maxAgility: 1650,
        maxIntelligence: 1800,
        maxExperience: 1000,
        quest: ['midworld']
    },
    7: {
        minAge: 120,
        minWeight: 110,
        maxForce: 2700,
        maxEndurance: 2850,
        maxAgility: 3150,
        maxIntelligence: 3300,
        maxExperience: 2000
    },
    8: {
        minAge: 200,
        minWeight: 340,
        maxForce: 4000,
        maxEndurance: 4500,
        maxAgility: 5500,
        maxIntelligence: 6000,
        maxExperience: 5000,
        quest: ['tete_3_cornes', 'numero_2']
    },
    9: {
        minAge: 320,
        minWeight: 800,
        maxForce: 7000,
        maxEndurance: 7875,
        maxAgility: 9625,
        maxIntelligence: 10500,
        maxExperience: 10000,
        quest: ['pilleurs_tombe', 'utopique_pangee', 'traces_mythe']
    }
};

export const PTERODACTYLE_LEVELS: SpeciesLevelRequirements = {
    2: {
        minAge: 15,
        minWeight: 3,
        maxForce: 6,
        maxEndurance: 12,
        maxAgility: 11,
        maxIntelligence: 11,
        maxExperience: 20
    },
    3: {
        minAge: 30,
        minWeight: 12,
        maxForce: 30,
        maxEndurance: 60,
        maxAgility: 55,
        maxIntelligence: 55,
        maxExperience: 45,
        quest: ['caverne_dragon']
    },
    4: {
        minAge: 50,
        minWeight: 25,
        maxForce: 120,
        maxEndurance: 240,
        maxAgility: 220,
        maxIntelligence: 220,
        maxExperience: 175,
        quest: ['iles_ciel']
    },
    5: {
        minAge: 70,
        minWeight: 35,
        maxForce: 300,
        maxEndurance: 600,
        maxAgility: 550,
        maxIntelligence: 550,
        maxExperience: 450,
        quest: ['ufo']
    },
    6: {
        minAge: 95,
        minWeight: 46,
        maxForce: 900,
        maxEndurance: 1800,
        maxAgility: 1650,
        maxIntelligence: 1650,
        maxExperience: 1000,
        quest: ['midworld']
    },
    7: {
        minAge: 120,
        minWeight: 110,
        maxForce: 1800,
        maxEndurance: 3600,
        maxAgility: 3300,
        maxIntelligence: 3300,
        maxExperience: 2000
    },
    8: {
        minAge: 200,
        minWeight: 340,
        maxForce: 6500,
        maxEndurance: 5000,
        maxAgility: 4500,
        maxIntelligence: 4000,
        maxExperience: 5000,
        quest: ['tete_3_cornes', 'numero_2']
    },
    9: {
        minAge: 320,
        minWeight: 800,
        maxForce: 5250,
        maxEndurance: 10500,
        maxAgility: 9625,
        maxIntelligence: 9625,
        maxExperience: 10000,
        quest: ['pilleurs_tombe', 'utopique_pangee', 'traces_mythe']
    }
};

export const MEGALODON_LEVELS: SpeciesLevelRequirements = {
    2: {
        minAge: 15,
        minWeight: 3,
        maxForce: 11,
        maxEndurance: 7,
        maxAgility: 12,
        maxIntelligence: 10,
        maxExperience: 20
    },
    3: {
        minAge: 30,
        minWeight: 12,
        maxForce: 55,
        maxEndurance: 35,
        maxAgility: 60,
        maxIntelligence: 50,
        maxExperience: 45,
        quest: ['caverne_dragon']
    },
    4: {
        minAge: 50,
        minWeight: 25,
        maxForce: 220,
        maxEndurance: 140,
        maxAgility: 240,
        maxIntelligence: 200,
        maxExperience: 175,
        quest: ['iles_ciel']
    },
    5: {
        minAge: 70,
        minWeight: 35,
        maxForce: 550,
        maxEndurance: 350,
        maxAgility: 600,
        maxIntelligence: 500,
        maxExperience: 450,
        quest: ['ufo']
    },
    6: {
        minAge: 95,
        minWeight: 46,
        maxForce: 1650,
        maxEndurance: 1050,
        maxAgility: 1800,
        maxIntelligence: 1500,
        maxExperience: 1000,
        quest: ['midworld']
    },
    7: {
        minAge: 120,
        minWeight: 110,
        maxForce: 3300,
        maxEndurance: 2100,
        maxAgility: 3600,
        maxIntelligence: 3000,
        maxExperience: 2000
    },
    8: {
        minAge: 200,
        minWeight: 340,
        maxForce: 6500,
        maxEndurance: 5000,
        maxAgility: 4500,
        maxIntelligence: 4000,
        maxExperience: 5000,
        quest: ['tete_3_cornes', 'numero_2']
    },
    9: {
        minAge: 320,
        minWeight: 800,
        maxForce: 9625,
        maxEndurance: 6125,
        maxAgility: 10500,
        maxIntelligence: 8750,
        maxExperience: 10000,
        quest: ['pilleurs_tombe', 'utopique_pangee', 'traces_mythe']
    }
}; 