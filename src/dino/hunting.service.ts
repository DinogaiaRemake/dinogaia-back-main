import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DinoService } from './dino.service';
import { HuntingZone, HUNTING_ZONES, Prey, Danger } from './dto/hunting.dto';
import { CaveService } from './cave.service';

@Injectable()
export class HuntingService {
    constructor(
        private dinoService: DinoService,
        private caveService: CaveService
    ) {}

    private calculateEventCount(dino: any, zone: HuntingZone): number {
        let count = HUNTING_ZONES[zone].baseEventCount;
        
        // Bonus basé sur le niveau
        count += Math.floor((dino.level - 1) / 2);
        
        // Ne pas dépasser le maximum
        return Math.min(count, HUNTING_ZONES[zone].maxEvents);
    }

    private selectRandomEvents(dino: any, zone: HuntingZone): Array<Prey | Danger> {
        const zoneConfig = HUNTING_ZONES[zone];
        const eventCount = this.calculateEventCount(dino, zone);
        const events: Array<Prey | Danger> = [];

        // Calculer les chances de chaque type d'événement basé sur les stats du dino
        const dangerChance = Math.max(0.1, 0.3 - (dino.level * 0.05));
        const neutralChance = Math.max(0.1, 0.4 - (dino.intelligence * 0.01));
        const preyChance = 1 - dangerChance - neutralChance;

        for (let i = 0; i < eventCount; i++) {
            const roll = Math.random();
            if (roll < dangerChance) {
                // Sélectionner un danger aléatoire
                const danger = zoneConfig.dangers[Math.floor(Math.random() * zoneConfig.dangers.length)];
                events.push(danger);
            } else if (roll < dangerChance + neutralChance) {
                // Événement neutre (pour l'instant, on skip)
                continue;
            } else {
                // Sélectionner une proie aléatoire en tenant compte de la rareté
                // Plus la rareté est proche de 100, plus la proie est rare
                const adjustedPreys = zoneConfig.preys.map(prey => ({
                    ...prey,
                    adjustedRarity: 100 - prey.rarity // Inverse la rareté
                }));
                
                const totalRarity = adjustedPreys.reduce((sum, prey) => sum + prey.adjustedRarity, 0);
                let roll = Math.random() * totalRarity;
                let selectedPrey: Prey | null = null;
                
                for (const prey of adjustedPreys) {
                    roll -= prey.adjustedRarity;
                    if (roll <= 0) {
                        selectedPrey = {
                            name: prey.name,
                            rarity: prey.rarity,
                            xpGain: prey.xpGain,
                            weightGain: prey.weightGain,
                            isLegendary: prey.isLegendary
                        };
                        break;
                    }
                }
                
                if (selectedPrey) events.push(selectedPrey);
            }
        }

        return events;
    }

    async hunt(dinoId: number, zone: HuntingZone) {
        const dino = await this.dinoService.findOne(dinoId);
        
        // Vérifications
        if (!dino) {
            throw new NotFoundException('Dinosaure non trouvé');
        }

     //   if (!dino.canHunt) {
       //     throw new BadRequestException('Vous ne pouvez chasser qu\'une fois par jour');
        //}

        const zoneConfig = HUNTING_ZONES[zone];
        if (!zoneConfig) {
            throw new NotFoundException('Zone de chasse non trouvée');
        }

        if (dino.level < zoneConfig.minLevel) {
            throw new BadRequestException(`Niveau ${zoneConfig.minLevel} minimum requis pour cette zone`);
        }

        if (zoneConfig.quest && !dino.completedQuests?.includes(zoneConfig.quest)) {
            throw new BadRequestException(`Vous devez d'abord compléter la quête : ${zoneConfig.quest}`);
        }

        // Sélectionner les événements
        const events = this.selectRandomEvents(dino, zone);

        // Appliquer les résultats
        let totalXP = 0;
        let totalWeightGain = 0;
        let totalHealthLoss = 0;
        let totalManaLoss = 0;

        const results = events.map(event => {
            if ('xpGain' in event) { // C'est une proie
                totalXP += event.xpGain;
                totalWeightGain += event.weightGain;
                return {
                    type: 'prey',
                    name: event.name,
                    xpGain: event.xpGain,
                    weightGain: event.weightGain,
                    isLegendary: event.isLegendary
                };
            } else { // C'est un danger
                totalHealthLoss += event.healthDamage;
                if (event.manaDamage) totalManaLoss += event.manaDamage;
                return {
                    type: 'danger',
                    name: event.name,
                    description: event.description,
                    healthDamage: event.healthDamage,
                    manaDamage: event.manaDamage
                };
            }
        });

        // Mettre à jour le dino
        dino.health = Math.max(0, dino.health - totalHealthLoss);
       //dino.experience += totalXP;
        dino.weight += totalWeightGain;
        dino.canHunt = false;  // Le dino ne peut plus chasser aujourd'hui
        dino.lastAction = new Date();
        dino.isActive = true;

        // Ajouter les proies à l'inventaire de la grotte
        for (const event of events) {
            if ('xpGain' in event) { // C'est une proie
                await this.caveService.addToInventory(
                    dino.cave.id,
                    event.name,
                    1,
                    event.weightGain,
                    event.xpGain
                );
            }
        }

        // Sauvegarder les changements
        await this.dinoService.update(dinoId, dino);

        return {
            events: results,
        };
    }
} 