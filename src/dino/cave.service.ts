import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cave } from './cave.entity';
import { ITEMS_CONFIG, ItemType, ItemConfig } from './dto/item.enum';
import { DinoService } from './dino.service';
import { TREX_LEVELS, VELOCIRAPTOR_LEVELS, PTERODACTYLE_LEVELS, MEGALODON_LEVELS, LevelRequirements } from './dto/level-requirements';

@Injectable()
export class CaveService {
    constructor(
        @InjectRepository(Cave)
        private caveRepository: Repository<Cave>,
        @Inject(forwardRef(() => DinoService))
        private dinoService: DinoService
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
        return cave;
    }

    async update(id: number, updateData: Partial<Cave>): Promise<Cave> {
        const cave = await this.findOne(id);
        Object.assign(cave, updateData);
        return await this.caveRepository.save(cave);
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

        return await this.caveRepository.save(cave);
    }

    async removeFromInventory(id: number, itemKey: string, quantity: number): Promise<Cave> {
        const cave = await this.findOne(id);
        if (!cave.inventory[itemKey] || cave.inventory[itemKey].quantity < quantity) {
            throw new NotFoundException(`Pas assez de ${itemKey} dans l'inventaire`);
        }
        cave.inventory[itemKey].quantity -= quantity;

        // Si la quantité atteint 0, on peut supprimer l'item de l'inventaire
        if (cave.inventory[itemKey].quantity === 0) {
            delete cave.inventory[itemKey];
        }

        return await this.caveRepository.save(cave);
    }

    async getInventory(id: number): Promise<any> {
        const cave = await this.findOne(id);
        return cave.inventory;
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

        if (itemConfig.type !== ItemType.SKILL) {
            throw new BadRequestException(`Cet item n'est pas un boost de compétences`);
        }

        if (!itemConfig.skillBonus) {
            throw new BadRequestException(`Ce livre n'a pas de bonus de compétence configuré`);
        }

        // Appliquer les bonus de compétences au dinosaure
        const dino = cave.dino;
        let message = `${quantity}x ${itemConfig.name} utilisé(s). `;

        // Récupérer les requirements une seule fois
        const requirements = await this.dinoService.getLevelRequirements(dino.species, dino.level + 1);
        
        // Vérifier si l'utilisation dépasserait les limites
        if (itemConfig.skillBonus.intelligence && 
            dino.intelligence + itemConfig.skillBonus.intelligence * quantity > requirements.maxIntelligence) {
            throw new BadRequestException(`L'utilisation dépasserait la limite d'intelligence de ${requirements.maxIntelligence}`);
        }
        if (itemConfig.skillBonus.agility && 
            dino.agility + itemConfig.skillBonus.agility * quantity > requirements.maxAgility) {
            throw new BadRequestException(`L'utilisation dépasserait la limite d'agilité de ${requirements.maxAgility}`);
        }
        if (itemConfig.skillBonus.strength && 
            dino.strength + itemConfig.skillBonus.strength * quantity > requirements.maxForce) {
            throw new BadRequestException(`L'utilisation dépasserait la limite de force de ${requirements.maxForce}`);
        }
        if (itemConfig.skillBonus.endurance && 
            dino.endurance + itemConfig.skillBonus.endurance * quantity > requirements.maxEndurance) {
            throw new BadRequestException(`L'utilisation dépasserait la limite d'endurance de ${requirements.maxEndurance}`);
        }

        // Si on arrive ici, on peut appliquer les bonus
        if (itemConfig.skillBonus.intelligence) {
            dino.intelligence += itemConfig.skillBonus.intelligence * quantity;
            message += `Intelligence +${itemConfig.skillBonus.intelligence * quantity}. `;
        }
        if (itemConfig.skillBonus.agility) {
            dino.agility += itemConfig.skillBonus.agility * quantity;
            message += `Agilité +${itemConfig.skillBonus.agility * quantity}. `;
        }
        if (itemConfig.skillBonus.strength) {
            dino.strength += itemConfig.skillBonus.strength * quantity;
            message += `Force +${itemConfig.skillBonus.strength * quantity}. `;
        }
        if (itemConfig.skillBonus.endurance) {
            dino.endurance += itemConfig.skillBonus.endurance * quantity;
            message += `Endurance +${itemConfig.skillBonus.endurance * quantity}. `;
        }

        // Sauvegarder les changements du dinosaure
        await this.dinoService.update(dino.id, dino);

        // Retirer les items utilisés de l'inventaire
        await this.removeFromInventory(id, itemKey, quantity);

        return {
            message,
            cave: await this.findOne(id)
        };
    }
} 
