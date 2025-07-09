// TODO: Implement DinoService
import { Injectable, NotFoundException, Inject, forwardRef, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dino } from './dino.entity';
import { CreateDinoDto, DinoSpecies } from './dto/create-dino.dto';
import { UserService } from '../user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CaveService } from './cave.service';
import { Cave } from './cave.entity';
import { getRandomClanForSpecies } from './dto/clan.enum';
import { TREX_LEVELS, VELOCIRAPTOR_LEVELS, PTERODACTYLE_LEVELS, MEGALODON_LEVELS, LevelRequirements } from './dto/level-requirements';
import { Not } from 'typeorm';
import { Job, JOB_CONFIG } from './dto/job.enum';
import { Disease, DISEASE_CONFIG, DiseaseConfig } from './dto/disease.enum';
import { ITEMS_CONFIG } from './dto/item.enum';

@Injectable()
export class DinoService {
    constructor(
        @InjectRepository(Dino)
        private dinoRepository: Repository<Dino>,
        private userService: UserService,
        @Inject(forwardRef(() => CaveService))
        private caveService: CaveService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_11PM)
    async updateDinosAtMidnight() {
        console.log('Mise à jour des dinos à minuit...');
        const allDinos = await this.dinoRepository.find({
            relations: ['cave']
        });
        
        for (const dino of allDinos) {
            console.log("dino + cave de : " + dino.name + " " +dino.cave);
            dino.dailySentDuels = 0;
            dino.dailyReceivedDuels = 0;
            
            // Mise à jour du salaire
            const jobConfig = JOB_CONFIG[dino.job];
            if (jobConfig) {
                dino.emeralds += jobConfig.salaire;
                switch (dino.job) {
                    case Job.GARDE_ROYAL:
                        const potDeVin = Math.floor(Math.random() * 2) + 1;
                        dino.emeralds += potDeVin;
                        break;
                    case Job.CAPITAINE_GARDE_ROYAL:
                        const potsDeVin = Math.floor(Math.random() * 6) + 1;
                        dino.emeralds += potsDeVin;
                        break;
                    case Job.POMPIER:
                        dino.health = Math.min(100, dino.health + 5);
                        break;
                }
                console.log("dino salaire : " + dino.name + " " + dino.emeralds);
            }

            // Mise à jour des stats
            if (!dino.hunger && !dino.thirst) {
                console.log("dino " + dino.name + " is not hungry or thirsty" + " and height : " + dino.height);
                dino.height += 1;
                dino.health = Math.min(100, dino.health + 10);
                console.log("dino " + dino.name + " health : " + dino.health);
            }

            // Gestion des maladies
            if (dino.disease) {
                const diseaseConfig = DISEASE_CONFIG[dino.disease];
                dino.health = Math.max(0, dino.health - diseaseConfig.dailyDamage);
                console.log(`${dino.name} a perdu ${diseaseConfig.dailyDamage} points de vie à cause de ${diseaseConfig.name}`);
            }

            // Chance de tomber malade si la grotte est sale
            if (!dino.cave?.isClean && !dino.disease) {
                const random = Math.random();
                if (random < 0.1) { // 10% de chance de tomber malade
                    const diseases = Object.values(Disease);
                    dino.disease = diseases[Math.floor(Math.random() * diseases.length)];
                    dino.diseaseStartDate = new Date();
                    console.log(`${dino.name} est tombé malade : ${dino.disease}`);
                }
            }

            dino.hunger = true;
            dino.thirst = true;
            dino.canHunt = true;
            console.log("dino " + dino.name + " can hunt : " + dino.canHunt);

            // Mettre à jour et sauvegarder la grotte
            if (dino.cave) {
                dino.cave.isClean = false;
                await this.caveService.update(dino.cave.id, dino.cave);
                console.log(`La grotte de ${dino.name} a été mise à jour - isClean: false`);
            }

            let savedDino = await this.dinoRepository.save(dino);
            console.log("dino " + savedDino.name + " saved");
        }
        
        console.log('Mise à jour des dinos terminée !');
    }

    //test cron 10s
    @Cron(CronExpression.EVERY_10_SECONDS)
    async testCron() {
        //console.log('Test cron 10s...');
        //canHunt = true
        /*const allDinos = await this.dinoRepository.find({
            relations: ['cave']
        });
        
        for (const dino of allDinos) {
             dino.hunger = true;
            dino.canHunt = true;
            await this.dinoRepository.save(dino);
        }

       
       this.feed(6, "crabe doré");*/
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async updateDinosAtMinute() {
        console.log('Mise à jour des dinos à chaque minute...');
        const allDinos = await this.dinoRepository.find();
        for (const dino of allDinos) {
            if (dino.lastAction < new Date(Date.now() - 2 * 60 * 1000)) {
                dino.isActive = false;
            }
            await this.dinoRepository.save(dino);
        }
    }
    
    async setLastAction(id: number) {
        const dino = await this.findOne(id);
        dino.lastAction = new Date();
        dino.isActive = true;
        console.log("dino " + dino.name + " is active");
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
            user,
            emeralds: 100 // Initialisation des émeraudes à 100
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
        const requirements = await this.getLevelRequirements(dino.species, dino.level + 1);
        
        if (dino.experience == requirements.maxExperience && 
            dino.intelligence == requirements.maxIntelligence && 
            dino.agility == requirements.maxAgility && 
            dino.strength == requirements.maxForce && 
            dino.endurance == requirements.maxEndurance) {
            
            console.log("requirements are met");
            
            // Vérifier les quêtes seulement si elles sont requises
            if (!requirements.quest || 
                (dino.completedQuests && requirements.quest.every(q => dino.completedQuests.includes(q)))) {
                console.log("quests are completed or not required");
                dino.level += 1;
            }
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

        const itemConfig = ITEMS_CONFIG[food];
        
        dino.hunger = false;
        dino.weight += Number(cave.inventory[food].weightGain);
        
        // Appliquer le soin si la proie a une propriété healingPower
        if (itemConfig.healingPower) {
            dino.health = Math.min(100, dino.health + itemConfig.healingPower);
        }
        
        //Gain xp but limit to the max of the level (should be replace as max xp is fight dependent not feed)
        dino.experience = Math.min((await this.getLevelRequirements(dino.species, dino.level + 1)).maxExperience, dino.experience+Number(cave.inventory[food].xpGain));
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
        dino.thirst = false;
        
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

    async getLevelRequirements(species: DinoSpecies, level: number): Promise<LevelRequirements> {
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

    //get all dinos active
    async getAllActiveDinos(): Promise<Dino[]> {
        return await this.dinoRepository.find({
            where: { isActive: true }
        });
    }
    
    async findAllPaginatedExceptUser(
        userId: number,
        page: number = 1,
        limit: number = 10
    ): Promise<{ dinos: Dino[], total: number }> {
        const [dinos, total] = await this.dinoRepository.findAndCount({
            where: {
                userId: Not(userId),
                dailyReceivedDuels: Not(10) // Exclure les dinos qui ont déjà reçu 10 duels
            },
            order: {
                lastAction: 'DESC'
            },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['user', 'cave']
        });

        return { dinos, total };
    }

    // Nouvelle méthode pour soigner un dinosaure
    async treatDisease(id: number): Promise<Dino> {
        const dino = await this.findOne(id);
        
        if (!dino.disease) {
            throw new NotFoundException('Ce dinosaure n\'est pas malade');
        }

        const diseaseConfig = DISEASE_CONFIG[dino.disease];

        dino.disease = null;
        dino.diseaseStartDate = null;
        
        // Mettre à jour la dernière action
        dino.lastAction = new Date();
        dino.isActive = true;

        return await this.dinoRepository.save(dino);
    }

    // Nouvelle méthode pour obtenir les informations sur la maladie actuelle
    async getDiseaseInfo(id: number): Promise<DiseaseConfig | null> {
        const dino = await this.findOne(id);
        
        if (!dino.disease) {
            return null;
        }

        return DISEASE_CONFIG[dino.disease];
    }

    /**
     * Récupère le classement des dinos selon une catégorie.
     * @param category Catégorie de classement (age, height, weight, xp, emeralds)
     * @param limit    Nombre de résultats à retourner
     * @param order    Ordre de tri ('asc' | 'desc')
     */
    async getRanking(
        category: string,
        limit: number = 10,
        order: 'asc' | 'desc' = 'desc'
    ): Promise<Dino[]> {
        // Normaliser l'entrée
        const cat = category?.toLowerCase();

        // Déterminer la colonne et le sens de tri
        let orderObj: Record<string, 'ASC' | 'DESC'>;

        switch (cat) {
            case 'age':
                // Pour l'âge, plus vieux d'abord => createdAt ASC
                orderObj = { createdAt: order === 'desc' ? 'ASC' : 'DESC' };
                break;
            case 'taille':
            case 'height':
                orderObj = { height: order.toUpperCase() as 'ASC' | 'DESC' };
                break;
            case 'poids':
            case 'weight':
                orderObj = { weight: order.toUpperCase() as 'ASC' | 'DESC' };
                break;
            case 'xp':
            case 'experience':
                orderObj = { experience: order.toUpperCase() as 'ASC' | 'DESC' };
                break;
            case 'richesse':
            case 'emeralds':
            case 'wealth':
                orderObj = { emeralds: order.toUpperCase() as 'ASC' | 'DESC' };
                break;
            default:
                throw new BadRequestException('Catégorie de classement invalide');
        }

        return this.dinoRepository.find({
            order: orderObj,
            take: limit,
            relations: ['user']
        });
    }
}