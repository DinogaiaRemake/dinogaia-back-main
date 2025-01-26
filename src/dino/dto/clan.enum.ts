import { DinoSpecies } from './create-dino.dto';

export enum TRexClans {
    KING_OF_WORLD = 'King of World',
    CONFRERIE = 'La confrérie',
    PROPHETES = 'Les prophètes de l\'appocalyspe',
    GARDIENS = 'Les gardiens de l\'enfer',
    COLOSSE = 'Le colosse qui rôde'
}

export enum VelociraptorClans {
    CHASSEURS_BROUSSE = 'Les chasseurs de la brousse',
    LEZARDS_ABYSSES = 'Les lézards des abysses',
    CAVALIERS = 'Les cavaliers de Gaïa-West',
    ORDRE_REPTILE = 'L\'ordre du reptile',
    RAPID_RAPTOR = 'Rapid Raptor'
}

export enum PterodactyleClans {
    CHASSEURS_FIRMAMENT = 'Les chasseurs du firmament',
    MESSAGERS = 'Les messagers du vent',
    JUSTICIERS = 'Les justiciers funestes',
    ORDRE_VENT = 'L\'ordre du vent',
    SECTE_DRAGON = 'La secte du Dragon'
}

export enum MegalodonClans {
    SENTINELLES = 'Les sentinelles',
    TEMPLE = 'Le temple océanique',
    PREDATORS = 'Predators'
}

export const GRAND_CONSEIL = 'Le grand conseil';

export function getRandomClanForSpecies(species: DinoSpecies): string {
    const random = Math.random();
    
    // 5% de chance d'être dans le Grand Conseil
    if (random < 0.05) {
        return GRAND_CONSEIL;
    }

    let clans: string[] = [];
    switch (species) {
        case DinoSpecies.TREX:
            clans = Object.values(TRexClans);
            break;
        case DinoSpecies.VELOCIRAPTOR:
            clans = Object.values(VelociraptorClans);
            break;
        case DinoSpecies.PTERODACTYL:
            clans = Object.values(PterodactyleClans);
            break;
        case DinoSpecies.MEGALODON:
            clans = Object.values(MegalodonClans);
            break;
    }

    const randomIndex = Math.floor(Math.random() * clans.length);
    return clans[randomIndex];
} 