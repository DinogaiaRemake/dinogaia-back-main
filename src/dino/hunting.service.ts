import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DinoService } from './dino.service';
import { HuntingZone, HUNTING_ZONES, Prey, Danger } from './dto/hunting.dto';
import { CaveService } from './cave.service';
import { ItemType, ITEMS_CONFIG } from './dto/item.enum';
import { HuntingResult, HuntingResponse, RaidResult } from './dto/hunting-result.dto';

interface InventoryItem {
    quantity: number;
    type: string;
    displayName: string;
    weightGain?: number;
    xpGain?: number;
}

@Injectable()
export class HuntingService {
    constructor(
        private dinoService: DinoService,
        private caveService: CaveService
    ) {}

    private calculateEventCount(dino: any, zone: HuntingZone): number {
        const zoneConfig = HUNTING_ZONES[zone];
        const baseCount = zoneConfig.baseEventCount;
        const maxEvents = zoneConfig.maxEvents;

        // Les chasseurs professionnels peuvent avoir jusqu'à 2 événements supplémentaires
        const bonusEvents = dino.job === 'chasseur_professionnel' ? Math.floor(Math.random() * 3) : 0;

        return Math.min(baseCount + bonusEvents, maxEvents);
    }

    private selectRandomEvents(dino: any, zone: HuntingZone): Array<Prey | Danger> {
        const zoneConfig = HUNTING_ZONES[zone];
        const eventCount = this.calculateEventCount(dino, zone);
        const events: Array<Prey | Danger> = [];

        // Vérifier si le dino a une arme équipée
        const weapon = Object.values(dino.cave.inventory).find(item => 
            (item as any).type === ItemType.WEAPON && (item as any).quantity > 0
        );

        for (let i = 0; i < eventCount; i++) {
            const isPreyEvent = Math.random() > 0.3; // 70% de chance d'avoir une proie

            if (isPreyEvent) {
                const availablePreys = zoneConfig.preys;
                const prey = this.selectRandomPrey(availablePreys);
                
                // Si une arme est équipée, augmenter le nombre de proies
                if (weapon) {
                    const weaponStats = (weapon as any).weaponStats;
                    const extraPreys = Math.floor(Math.random() * (weaponStats.maxPreys - weaponStats.minPreys + 1)) + weaponStats.minPreys;
                    for (let j = 0; j < extraPreys - 1; j++) {
                        events.push(prey);
                    }
                }
                
                events.push(prey);
            } else {
                const availableDangers = zoneConfig.dangers;
                const danger = availableDangers[Math.floor(Math.random() * availableDangers.length)];
                events.push(danger);
            }
        }

        return events;
    }

    private selectRandomPrey(preys: Prey[]): Prey {
        // Vérifier que la somme des raretés est égale à 100
        const totalRarity = preys.reduce((sum, prey) => sum + prey.rarity, 0);
        if (Math.abs(totalRarity - 100) > 0.01) {
            console.warn(`La somme des raretés (${totalRarity}) n'est pas égale à 100 pour cette zone !`);
        }

        // Utiliser directement la rareté comme probabilité
        let random = Math.random() * 100;
        
        for (const prey of preys) {
            if (random <= prey.rarity) {
                return prey;
            }
            random -= prey.rarity;
        }
        
        // Si par un cas improbable on arrive ici, on retourne la dernière proie
        return preys[preys.length - 1];
    }

    private getItemKeyFromPreyName(preyName: string): string {
        return preyName.toLowerCase().replace(/ /g, '_');
    }

    async hunt(dinoId: number, zone: HuntingZone): Promise<HuntingResponse> {
        const dino = await this.dinoService.findOne(dinoId);

        

        if (!dino) {
            throw new NotFoundException(`Dinosaure avec l'ID ${dinoId} non trouvé`);
        }

        if (!dino.canHunt) {
            throw new BadRequestException(`Le dinosaure ${dino.name} ne peut pas chasser il a déjà chassé aujourd'hui`);
        }

        const zoneConfig = HUNTING_ZONES[zone];
        if (!zoneConfig) {
            throw new NotFoundException(`Zone de chasse ${zone} non trouvée`);
        }

        if (dino.level < zoneConfig.minLevel) {
            throw new NotFoundException(`Niveau insuffisant pour chasser dans cette zone`);
        }

        if (zoneConfig.quest && (!dino.completedQuests || !dino.completedQuests.includes(zoneConfig.quest))) {
            throw new NotFoundException(`Quête ${zoneConfig.quest} requise pour accéder à cette zone`);
        }

        const events = this.selectRandomEvents(dino, zone);
        const results: HuntingResult[] = [];

        // Traiter chaque événement
        for (const event of events) {
            if ('xpGain' in event) { // C'est une proie
                const itemConfig = ITEMS_CONFIG[event.name];
                if (!itemConfig) {
                    throw new NotFoundException(`Item ${event.name} non configuré dans le système`);
                }

                results.push({
                    type: 'prey',
                    name: event.name,
                    displayName: itemConfig.name,
                    xpGain: 0,
                    weightGain: event.weightGain,
                    price: itemConfig.price,
                    description: itemConfig.description,
                    isLegendary: event.isLegendary
                });

                // Ajouter la proie à l'inventaire
                await this.caveService.addToInventory(
                    dino.cave.id,
                    event.name,
                    1
                );

                // Mettre à jour les stats du dino
            } else { // C'est un danger
                results.push({
                    type: 'danger',
                    name: event.name,
                    description: event.description,
                    healthDamage: event.healthDamage,
                    manaDamage: event.manaDamage,
                    emeraldLoss: event.emeraldLoss
                });

                if (event.healthDamage) {
                    dino.health = Math.max(0, dino.health - event.healthDamage);
                }
                if (event.emeraldLoss) {
                    dino.emeralds = Math.max(0, dino.emeralds - event.emeraldLoss);
                }
            }
        }

        // Sauvegarder les changements
        dino.canHunt = false;
        await this.dinoService.update(dinoId, dino);

        return {
            events: results,
        };
    }

    private async selectRandomTarget(attackerId: number): Promise<any> {
        // Récupérer tous les dinos sauf l'attaquant
        const allDinos = await this.dinoService.findAll();
        const potentialTargets = allDinos.filter(dino => 
            dino.id !== attackerId && 
            dino.cave && // S'assurer que le dino a une grotte
            Object.keys(dino.cave.inventory).length > 0 // S'assurer qu'il a des items
        );

        if (potentialTargets.length === 0) {
            throw new BadRequestException('Aucune cible disponible pour le pillage');
        }

        // Sélectionner une cible au hasard
        return potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    }

    private selectRandomItem(inventory: Record<string, InventoryItem>): { itemKey: string; item: InventoryItem } {
        // Récupérer tous les items avec une quantité > 0
        const availableItems = Object.entries(inventory)
            .filter(([_, item]) => item.quantity > 0);

        if (availableItems.length === 0) {
            throw new BadRequestException('Aucun item disponible dans l\'inventaire de la cible');
        }

        // Sélectionner un item au hasard
        const [itemKey, item] = availableItems[Math.floor(Math.random() * availableItems.length)];
        return { itemKey, item };
    }

    async raid(attackerDinoId: number): Promise<RaidResult> {
        // Récupérer l'attaquant
        const attacker = await this.dinoService.findOne(attackerDinoId);

        // Vérifications
        if (!attacker) {
            throw new NotFoundException('Dinosaure non trouvé');
        }

        if (!attacker.canHunt) {
            throw new BadRequestException('Vous avez déjà chassé aujourd\'hui');
        }

        // Sélectionner une cible aléatoire
        const target = await this.selectRandomTarget(attackerDinoId);

        // Sélectionner un item aléatoire de l'inventaire de la cible
        const targetCave = await this.caveService.findOne(target.cave.id);
        const { itemKey, item: targetItem } = this.selectRandomItem(targetCave.inventory);

        // 30% de chance d'échec avec perte de HP
        const raidSuccess = Math.random() > 0.3;
        
        // Désactiver la chasse pour l'attaquant
        attacker.canHunt = false;
        await this.dinoService.update(attackerDinoId, attacker);

        if (!raidSuccess) {
            // Échec du raid : perte de 20-40 HP
            const healthDamage = Math.floor(Math.random() * 21) + 20; // 20-40
            attacker.health = Math.max(0, attacker.health - healthDamage);
            await this.dinoService.update(attackerDinoId, attacker);

            return {
                success: false,
                healthDamage,
                targetDino: {
                    id: target.id,
                    name: target.name
                },
                message: `Le pillage contre ${target.name} a échoué ! Vous avez perdu ${healthDamage} points de vie.`
            };
        }

        // Succès du raid
        const stolenQuantity = targetItem.quantity; // On vole tout
        
        // Retirer l'item de l'inventaire de la cible
        await this.caveService.removeFromInventory(target.cave.id, itemKey, stolenQuantity);
        
        // Ajouter l'item à l'inventaire de l'attaquant
        await this.caveService.addToInventory(attacker.cave.id, itemKey, stolenQuantity);

        return {
            success: true,
            stolenItems: [{
                itemKey,
                displayName: targetItem.displayName,
                quantity: stolenQuantity
            }],
            targetDino: {
                id: target.id,
                name: target.name
            },
            message: `Pillage réussi contre ${target.name} ! Vous avez volé ${stolenQuantity}x ${targetItem.displayName}.`
        };
    }
} 