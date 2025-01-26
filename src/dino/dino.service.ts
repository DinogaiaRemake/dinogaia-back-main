// TODO: Implement DinoService
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dino } from './dino.entity';
import { CreateDinoDto } from './dto/create-dino.dto';
import { UserService } from '../user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CaveService } from './cave.service';
import { Cave } from './cave.entity';
import { getRandomClanForSpecies } from './dto/clan.enum';

@Injectable()
export class DinoService {
    constructor(
        @InjectRepository(Dino)
        private dinoRepository: Repository<Dino>,
        private userService: UserService,
        private caveService: CaveService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async updateDinosAtMidnight() {
        console.log('Mise à jour des dinos à minuit...');
        const allDinos = await this.dinoRepository.find();
        
        for (const dino of allDinos) {
            
            if (dino.hunger && dino.thirst) {
                dino.height += 1;
            }

            if (dino.cave.isClean) {
                const random = Math.random();
                if (random < 0.1) {
                    // TODO: Dino is sick
                }
            }

            dino.hunger = false;
            dino.thirst = false;
            dino.cave.isClean = false;
            
            await this.dinoRepository.save(dino);
        }
        
        console.log('Mise à jour des dinos terminée !');
    }

    // Créer un nouveau dinosaure
    async create(createDinoDto: CreateDinoDto, userId: number): Promise<Dino> {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }

        // Attribuer un clan aléatoire en fonction de l'espèce
        const clan = getRandomClanForSpecies(createDinoDto.species);

        const dino = this.dinoRepository.create({
            ...createDinoDto,
            clan,
            user
        });

        const savedDino = await this.dinoRepository.save(dino);
        
        // Créer une grotte pour le nouveau dino
        await this.caveService.create(savedDino.id);

        return savedDino;
    }

    // Récupérer tous les dinosaures
    async findAll(): Promise<Dino[]> {
        return await this.dinoRepository.find({
            relations: ['cave', 'user']
        });
    }

    // Récupérer un dinosaure par son ID
    async findOne(id: number): Promise<Dino> {
        const dino = await this.dinoRepository.findOne({ 
            where: { id },
            relations: ['cave', 'user']
        });
        if (!dino) {
            throw new NotFoundException(`Dinosaure avec l'ID ${id} non trouvé`);
        }
        return dino;
    }

    // Mettre à jour un dinosaure
    async update(id: number, updateData: Partial<Dino>): Promise<Dino> {
        const dino = await this.findOne(id);
        Object.assign(dino, updateData);
        return await this.dinoRepository.save(dino);
    }

    // Supprimer un dinosaure
    async remove(id: number): Promise<void> {
        const result = await this.dinoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Dinosaure avec l'ID ${id} non trouvé`);
        }
    }

    // Nourrir un dinosaure
    async feed(id: number, food: string): Promise<Dino> {
        const dino = await this.findOne(id);
        if (dino.cave.inventory[food] > 0) {
            dino.hunger = true;
            dino.cave.inventory[food] -= 1;
            return await this.dinoRepository.save(dino);
        } else {
            throw new NotFoundException(`${food} non trouvé dans la grotte du dino ${id}`);
        }
    }

    // Faire boire un dinosaure
    async drink(id: number): Promise<Dino> {
        const dino = await this.findOne(id);
        dino.thirst = true;
        return await this.dinoRepository.save(dino);
    }

    // Gagner de l'expérience
    async gainXP(id: number, amount: number): Promise<Dino> {
        const dino = await this.findOne(id);
        dino.experience += amount;      
        
        return await this.dinoRepository.save(dino);
    }

    // Trouver les dinosaures par clan
    async findByClan(clan: string): Promise<Dino[]> {
        return await this.dinoRepository.find({ where: { clan } });
    }

    async findByUserId(userId: number): Promise<Dino[]> {
        return await this.dinoRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'cave']
        });
    }

    // Nouvelle méthode pour récupérer la cave d'un dino
    async getDinoCave(dinoId: number): Promise<Cave> {
        const dino = await this.findOne(dinoId);
        if (!dino.cave) {
            throw new NotFoundException(`Pas de grotte trouvée pour le dino ${dinoId}`);
        }
        return dino.cave;
    }
}