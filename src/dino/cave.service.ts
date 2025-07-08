import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cave } from './cave.entity';
import { ITEMS_CONFIG, ItemType, ItemConfig } from './dto/item.enum';
import { DinoService } from './dino.service';
import { TREX_LEVELS, VELOCIRAPTOR_LEVELS, PTERODACTYLE_LEVELS, MEGALODON_LEVELS, LevelRequirements } from './dto/level-requirements';
import { Dino } from './dino.entity';

@Injectable()
export class CaveService {
    constructor(
        @InjectRepository(Cave)
        private caveRepository: Repository<Cave>,
        @Inject(forwardRef(() => DinoService))
        private dinoService: DinoService,
        @InjectRepository(Dino)
        private dinoRepository: Repository<Dino>
    ) {}

    async create(dinoId: number): Promise<Cave> {
        const cave = this.caveRepository.create({
            dinoId,
            inventory: {}
        });
        return await this.caveRepository.save(cave);
    }

    async findOne(id: number): Promise<Cave> {
        const cave = await this.caveRepository.findOne({ 
            where: { id },
            relations: ['dino']
        });
        if (!cave) {
            throw new NotFoundException(`Grotte avec l'ID ${id} non trouvée`);
        }
        // Nettoyer l'inventaire avant de retourner la grotte
        this.cleanInventory(cave);
        await this.caveRepository.save(cave);
        return cave;
    }

    async findByDinoId(dinoId: number): Promise<Cave> {
        const cave = await this.caveRepository.findOne({ 
            where: { dinoId },
            relations: ['dino']
        });
        if (!cave) {
            throw new NotFoundException(`Grotte pour le dino ${dinoId} non trouvée`);
        }
        // Nettoyer l'inventaire avant de retourner la grotte
        this.cleanInventory(cave);
        await this.caveRepository.save(cave);
        return cave;
    }

    async update(id: number, updateData: Partial<Cave>): Promise<Cave> {
        const cave = await this.findOne(id);
        Object.assign(cave, updateData);
        // Nettoyer l'inventaire avant de sauvegarder
        this.cleanInventory(cave);
        return await this.caveRepository.save(cave);
    }

    private cleanInventory(cave: Cave): void {
        // Créer un nouvel objet pour stocker l'inventaire nettoyé
        const cleanedInventory = {};
        
        // Ne copier que les items avec une quantité > 0
        for (const [key, item] of Object.entries(cave.inventory)) {
            // Forcer la conversion en nombre
            const quantity = Number(item.quantity);
            if (!isNaN(quantity) && quantity > 0) {
                const itemConfig = ITEMS_CONFIG[key];

                cleanedInventory[key] = {
                    ...item,
                    quantity: quantity,
                    description: itemConfig?.description || ''
                };
            }
        }
        
        // Remplacer l'inventaire par la version nettoyée
        cave.inventory = cleanedInventory;
    }

    async addToInventory(id: number, itemKey: string, quantity: number): Promise<Cave> {
        const cave = await this.findOne(id);
        const itemConfig = ITEMS_CONFIG[itemKey];
        
        if (!itemConfig) {
            throw new NotFoundException(`Item ${itemKey} non trouvé`);
        }

        // Conversion explicite en nombre
        const numericQuantity = Number(quantity);
        if (isNaN(numericQuantity)) {
            throw new BadRequestException(`La quantité doit être un nombre valide`);
        }

        if (!cave.inventory[itemKey]) {
            cave.inventory[itemKey] = {
                quantity: 0,
                type: itemConfig.type,
                displayName: itemConfig.name,
                weightGain: itemConfig.weightGain,
                xpGain: itemConfig.xpGain,
                securityBonus: itemConfig.securityBonus,
                hygieneBonus: itemConfig.hygieneBonus,
                skillBonus: itemConfig.skillBonus,
                weaponStats: itemConfig.weaponStats
            };
        }

        // Utilisation de la quantité convertie
        cave.inventory[itemKey].quantity = Number(cave.inventory[itemKey].quantity || 0) + numericQuantity;

        // Mise à jour des bonus de sécurité et d'hygiène
        if (itemConfig.type === ItemType.SECURITY && itemConfig.securityBonus) {
            cave.security = Math.min(100, cave.security + itemConfig.securityBonus);
        }
        if (itemConfig.type === ItemType.HYGIENE && itemConfig.hygieneBonus) {
            cave.hygiene = Math.min(100, cave.hygiene + itemConfig.hygieneBonus);
        }

        // Nettoyer l'inventaire avant de sauvegarder
        this.cleanInventory(cave);

        return await this.caveRepository.save(cave);
    }

    async removeFromInventory(id: number, itemKey: string, quantity: number): Promise<Cave> {
        const cave = await this.findOne(id);
        if (!cave.inventory[itemKey] || cave.inventory[itemKey].quantity < quantity) {
            throw new NotFoundException(`Pas assez de ${itemKey} dans l'inventaire`);
        }
        cave.inventory[itemKey].quantity -= quantity;

        // Nettoyer l'inventaire avant de sauvegarder
        this.cleanInventory(cave);

        return await this.caveRepository.save(cave);
    }

    async getInventory(id: number): Promise<any> {
        const cave = await this.findOne(id);
        return cave.inventory;
    }

    async getWeapons(id: number): Promise<any> {
        const cave = await this.findOne(id);
        const weapons = {};
        
        for (const [itemKey, item] of Object.entries(cave.inventory)) {
            if (ITEMS_CONFIG[itemKey]?.type === ItemType.WEAPON) {
                weapons[itemKey] = item;
            }
        }
        
        return weapons;
    }

    async useItem(id: number, itemKey: string, quantity: number): Promise<{ message: string; cave: Cave }> {
        const cave = await this.findOne(id);
        const itemConfig = ITEMS_CONFIG[itemKey];
        
        if (!itemConfig) {
            throw new NotFoundException(`Item ${itemKey} non trouvé`);
        }

        if (!cave.inventory[itemKey] || cave.inventory[itemKey].quantity < quantity) {
            throw new BadRequestException(`Pas assez de ${itemConfig.name} dans l'inventaire`);
        }

        let message = `${quantity}x ${itemConfig.name} utilisé(s). `;

        if (itemConfig.type === ItemType.HEALING || (itemConfig.type === ItemType.PREY && itemConfig.healingPower)) {
            // Gestion des items de soin
            if (itemConfig.healingPower) {
                cave.dino.health = Math.min(100, cave.dino.health + itemConfig.healingPower * quantity);
                message += `PV restaurés: +${itemConfig.healingPower * quantity}. `;
            }

            // Si l'item peut soigner une maladie spécifique
            if (itemConfig.cureDisease && cave.dino.disease === itemConfig.cureDisease) {
                cave.dino.disease = null;
                cave.dino.diseaseStartDate = null;
                message += `La maladie a été soignée. `;
            } else if (itemConfig.cureDisease && cave.dino.disease !== itemConfig.cureDisease) {
                throw new BadRequestException(`Ce médicament ne peut pas soigner la maladie actuelle du dinosaure`);
            }

            // Sauvegarder les changements du dinosaure
            await this.dinoRepository.save(cave.dino);
        } else if (itemConfig.type === ItemType.PREY) {
            // Si c'est une proie sans healingPower, on la traite comme avant
            cave.dino.hunger = false;
            cave.dino.weight += Number(itemConfig.weightGain) * quantity;
            await this.dinoService.update(cave.dino.id, cave.dino);
        } else if (itemConfig.type === ItemType.SKILL) {
            // Code existant pour les items de compétence
            if (!itemConfig.skillBonus) {
                throw new BadRequestException(`Cet item n'a pas de bonus de compétence configuré`);
            }

            const requirements = await this.dinoService.getLevelRequirements(cave.dino.species, cave.dino.level + 1);
            
            if (itemConfig.skillBonus.intelligence && 
                cave.dino.intelligence + itemConfig.skillBonus.intelligence * quantity > requirements.maxIntelligence) {
                throw new BadRequestException(`L'utilisation dépasserait la limite d'intelligence de ${requirements.maxIntelligence}`);
            }
            if (itemConfig.skillBonus.agility && 
                cave.dino.agility + itemConfig.skillBonus.agility * quantity > requirements.maxAgility) {
                throw new BadRequestException(`L'utilisation dépasserait la limite d'agilité de ${requirements.maxAgility}`);
            }
            if (itemConfig.skillBonus.strength && 
                cave.dino.strength + itemConfig.skillBonus.strength * quantity > requirements.maxForce) {
                throw new BadRequestException(`L'utilisation dépasserait la limite de force de ${requirements.maxForce}`);
            }
            if (itemConfig.skillBonus.endurance && 
                cave.dino.endurance + itemConfig.skillBonus.endurance * quantity > requirements.maxEndurance) {
                throw new BadRequestException(`L'utilisation dépasserait la limite d'endurance de ${requirements.maxEndurance}`);
            }

            if (itemConfig.skillBonus.intelligence) {
                cave.dino.intelligence += itemConfig.skillBonus.intelligence * quantity;
                message += `Intelligence +${itemConfig.skillBonus.intelligence * quantity}. `;
            }
            if (itemConfig.skillBonus.agility) {
                cave.dino.agility += itemConfig.skillBonus.agility * quantity;
                message += `Agilité +${itemConfig.skillBonus.agility * quantity}. `;
            }
            if (itemConfig.skillBonus.strength) {
                cave.dino.strength += itemConfig.skillBonus.strength * quantity;
                message += `Force +${itemConfig.skillBonus.strength * quantity}. `;
            }
            if (itemConfig.skillBonus.endurance) {
                cave.dino.endurance += itemConfig.skillBonus.endurance * quantity;
                message += `Endurance +${itemConfig.skillBonus.endurance * quantity}. `;
            }

            await this.dinoService.update(cave.dino.id, cave.dino);
        } else {
            throw new BadRequestException(`Cet item ne peut pas être utilisé directement`);
        }

        // Retirer les items utilisés de l'inventaire
        await this.removeFromInventory(id, itemKey, quantity);

        return {
            message,
            cave: await this.findOne(id)
        };
    }

    async cleanCave(caveId: number, userId: number): Promise<Cave> {
        const cave = await this.caveRepository.findOne({
            where: { id: caveId },
            relations: ['dino', 'dino.user']
        });

        if (!cave) {
            throw new NotFoundException('Grotte non trouvée');
        }

        if (cave.dino.user.id !== userId) {
            throw new ForbiddenException('Cette grotte ne vous appartient pas');
        }

        if (cave.isClean) {
            throw new ForbiddenException('La grotte est déjà propre');
        }

        // Coût du nettoyage en émeraudes
        cave.isClean = true;

        // Sauvegarder le dinosaure avec les émeraudes mises à jour
        await this.dinoRepository.save(cave.dino);

        return await this.caveRepository.save(cave);
    }
} 
