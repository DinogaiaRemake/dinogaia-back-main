import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cave } from './cave.entity';

@Injectable()
export class CaveService {
    constructor(
        @InjectRepository(Cave)
        private caveRepository: Repository<Cave>
    ) {}

    async create(dinoId: number): Promise<Cave> {
        const cave = this.caveRepository.create({
            dinoId,
            inventory: {
            }
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

    async addToInventory(id: number, item: string, quantity: number, weightGain: number = 0, xpGain: number = 0): Promise<Cave> {
        const cave = await this.findOne(id);
        if (!cave.inventory[item]) {
            cave.inventory[item] = {
                quantity: 0,
                weightGain: Number(weightGain),
                xpGain: Number(xpGain)
            };
        }
        cave.inventory[item].quantity = Number(cave.inventory[item].quantity) + Number(quantity);
        
        cave.inventory[item] = {
            quantity: Number(cave.inventory[item].quantity),
            weightGain: Number(cave.inventory[item].weightGain),
            xpGain: Number(cave.inventory[item].xpGain)
        };
        
        return await this.caveRepository.save(cave);
    }

    async removeFromInventory(id: number, item: string, quantity: number): Promise<Cave> {
        const cave = await this.findOne(id);
        if (!cave.inventory[item] || cave.inventory[item].quantity < quantity) {
            throw new NotFoundException(`Pas assez de ${item} dans l'inventaire`);
        }
        cave.inventory[item].quantity -= quantity;
        return await this.caveRepository.save(cave);
    }

    async getInventory(id: number): Promise<any> {
        const cave = await this.findOne(id);
        return cave.inventory;
    }
} 
