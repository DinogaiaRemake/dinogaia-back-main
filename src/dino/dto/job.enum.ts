export enum Job {
    CHOMEUR = 'chomeur',
    ESCROC = 'escroc',
    OUVRIER = 'ouvrier',
    VOLEUR = 'voleur',
    POLICIER = 'policier',
    POMPIER = 'pompier',
    GARDE_ROYAL = 'garde_royal',
    VOYANT = 'voyant',
    ENSEIGNANT = 'enseignant',
    MAGICIEN = 'magicien',
    CHASSEUR_PROFESSIONNEL = 'chasseur_professionnel',
    SORCIER = 'sorcier',
    CAPITAINE_GARDE_ROYAL = 'capitaine_garde_royal',
    VENDEUR = 'vendeur',
    CHASSEUR_INDIGENES = 'chasseur_indigenes'
}

export interface JobConfig {
    name: string;
    formation: number;  // Coût en émeraudes
    salaire: number;   // Émeraudes par jour
    bonus: string;     // Description du bonus
}

export const JOB_CONFIG: { [key in Job]: JobConfig } = {
    [Job.CHOMEUR]: {
        name: 'Chômeur',
        formation: 0,
        salaire: 1,
        bonus: 'Aucun'
    },
    [Job.ESCROC]: {
        name: 'Escroc',
        formation: 75,
        salaire: 3,
        bonus: 'Peut cambrioler une grotte au lieu de partir en chasse'
    },
    [Job.OUVRIER]: {
        name: 'Ouvrier',
        formation: 150,
        salaire: 6,
        bonus: 'Bénéficie d\'une remise de 2% sur l\'habitat'
    },
    [Job.VOLEUR]: {
        name: 'Voleur',
        formation: 200,
        salaire: 8,
        bonus: 'Peut cambrioler une grotte au lieu de partir en chasse avec un risque moins élevé'
    },
    [Job.POLICIER]: {
        name: 'Policier',
        formation: 250,
        salaire: 10,
        bonus: 'Bénéficie d\'une remise de 2% sur l\'armement'
    },
    [Job.POMPIER]: {
        name: 'Pompier',
        formation: 300,
        salaire: 12,
        bonus: 'Regagne 5 points de vie supplémentaires chaque jour'
    },
    [Job.GARDE_ROYAL]: {
        name: 'Garde royal',
        formation: 350,
        salaire: 15,
        bonus: 'Touche une prime de risque +1 émeraude par jour'
    },
    [Job.VOYANT]: {
        name: 'Voyant',
        formation: 425,
        salaire: 16,
        bonus: 'Obtient une approximation des compétences de son adversaire avant un combat'
    },
    [Job.ENSEIGNANT]: {
        name: 'Enseignant',
        formation: 500,
        salaire: 18,
        bonus: 'Bénéficie d\'une remise de 60% sur les heures d\'école'
    },
    [Job.MAGICIEN]: {
        name: 'Magicien',
        formation: 575,
        salaire: 21,
        bonus: 'Regagne 16 points de mana par jour au lieu de 10'
    },
    [Job.CHASSEUR_PROFESSIONNEL]: {
        name: 'Chasseur professionnel',
        formation: 650,
        salaire: 24,
        bonus: 'Permet d\'effectuer de 0 à 2 évènements supplémentaires par chasse'
    },
    [Job.SORCIER]: {
        name: 'Sorcier',
        formation: 750,
        salaire: 27,
        bonus: 'Bénéficie d\'une remise de 1 émeraude sur la magie'
    },
    [Job.CAPITAINE_GARDE_ROYAL]: {
        name: 'Capitaine de la garde royal',
        formation: 800,
        salaire: 29,
        bonus: 'Touche des pots de vins (de 1 et 6 émeraudes par jour)'
    },
    [Job.VENDEUR]: {
        name: 'Vendeur',
        formation: 900,
        salaire: 33,
        bonus: 'Peut vendre ses objets de manière directe sans passer par le marché pour 15% du prix moyen'
    },
    [Job.CHASSEUR_INDIGENES]: {
        name: 'Chasseur d\'indigènes',
        formation: 1000,
        salaire: 35,
        bonus: 'L\'indigène le craignant, il est plus généreux avec lui'
    }
}; 