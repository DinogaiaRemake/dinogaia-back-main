// TODO: Implement DinoService
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dino } from './dino.entity';
import { CreateDinoDto, DinoSpecies } from './dto/create-dino.dto';
import { UserService } from '../user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CaveService } from './cave.service';
import { Cave } from './cave.entity';
import { getRandomClanForSpecies } from './dto/clan.enum';
import { TREX_LEVELS, VELOCIRAPTOR_LEVELS, PTERODACTYLE_LEVELS, MEGALODON_LEVELS } from './dto/level-requirements';

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

    @Cron(CronExpression.EVERY_MINUTE)
    async updateDinosAtMinute() {
        console.log('Mise à jour des dinos à chaque minute...');
        const allDinos = await this.dinoRepository.find();
        for (const dino of allDinos) {
            if (dino.lastAction < new Date(Date.now() - 10 * 60 * 1000)) {
                dino.isActive = false;
            }
            await this.dinoRepository.save(dino);
        }
    }
    
    async setLastAction(id: number) {
        const dino = await this.findOne(id);
        dino.lastAction = new Date();
        return await this.dinoRepository.save(dino);
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

    async levelUp(dinoId: number): Promise<Dino> {
        const dino = await this.findOne(dinoId);
        switch (dino.level) {
            case 1:
                if (dino.experience == 20 && dino.intelligence >= 10 && dino.agility >= 10 && dino.strength >= 10 && dino.endurance >= 10) {
                    dino.level = 2;
                }
                break;
        }
        return await this.dinoRepository.save(dino);
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
        
        // Vérifier si le dino a faim
        if (!dino.hunger) {
            throw new NotFoundException(`Le dinosaure n'a pas faim pour le moment`);
        }

        const cave = dino.cave;

        if (!cave.inventory[food] || cave.inventory[food].quantity <= 0) {
            throw new NotFoundException(`${food} non trouvé dans la grotte du dino ${id}`);
        }

        dino.hunger = false;
        dino.weight += Number(cave.inventory[food].weightGain);
        dino.experience += Number(cave.inventory[food].xpGain);

        cave.inventory[food].quantity = Number(cave.inventory[food].quantity) - 1;

        await this.caveService.update(cave.id, cave);
        
        // Mettre à jour la dernière action
        dino.lastAction = new Date();
        dino.isActive = true;

        return await this.dinoRepository.save(dino);
    }

    // Faire boire un dinosaure
    async drink(id: number): Promise<Dino> {
        const dino = await this.findOne(id);
        dino.thirst = true;
        
        // Mettre à jour la dernière action
        dino.lastAction = new Date();
        dino.isActive = true;
        
        return await this.dinoRepository.save(dino);
    }

    // Gagner de l'expérience
    async gainXP(id: number, amount: number): Promise<Dino> {
        const dino = await this.findOne(id);
        dino.experience += amount;      
        
        // Mettre à jour la dernière action
        dino.lastAction = new Date();
        dino.isActive = true;
        
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

    async getLevelRequirements(species: DinoSpecies, level: number) {
        let requirements;
        switch (species) {
            case DinoSpecies.TREX:
                requirements = TREX_LEVELS[level];
                break;
            case DinoSpecies.VELOCIRAPTOR:
                requirements = VELOCIRAPTOR_LEVELS[level];
                break;
            case DinoSpecies.PTERODACTYL:
                requirements = PTERODACTYLE_LEVELS[level];
                break;
            case DinoSpecies.MEGALODON:
                requirements = MEGALODON_LEVELS[level];
                break;
            default:
                throw new NotFoundException(`Espèce ${species} non trouvée`);
        }

        if (!requirements) {
            throw new NotFoundException(`Niveau ${level} non trouvé pour l'espèce ${species}`);
        }

        return requirements;
    }
}