import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DragonCaveQuest, DragonCaveQuestStatus } from './dragon-cave.entity';
import { CaveService } from '../cave.service';
import { DinoService } from '../dino.service';

@Injectable()
export class DragonCaveQuestService implements OnModuleInit {
    constructor(
        @InjectRepository(DragonCaveQuest)
        private dragonCaveQuestRepository: Repository<DragonCaveQuest>,
        private caveService: CaveService,
        private dinoService: DinoService
    ) {}

    async onModuleInit() {
        console.log('Initialisation des quêtes Caverne du Dragon...');
        await this.initializeQuestsForExistingDinos();
    }

    private async initializeQuestsForExistingDinos() {
        const allDinos = await this.dinoService.findAll();
        const existingQuests = await this.dragonCaveQuestRepository.find();
        const existingQuestDinoIds = existingQuests.map(q => q.dinoId);

        const questsToCreate = allDinos
            .filter(dino => !existingQuestDinoIds.includes(dino.id))
            .map(dino => ({
                dinoId: dino.id,
                status: DragonCaveQuestStatus.NOT_STARTED
            }));

        if (questsToCreate.length > 0) {
            console.log(`Création de ${questsToCreate.length} nouvelles quêtes Caverne du Dragon`);
            await this.dragonCaveQuestRepository.save(questsToCreate);
        }
    }

    async getOrCreateQuest(dinoId: number): Promise<DragonCaveQuest> {
        let quest = await this.dragonCaveQuestRepository.findOne({ where: { dinoId } });
        
        if (!quest) {
            quest = this.dragonCaveQuestRepository.create({
                dinoId,
                status: DragonCaveQuestStatus.NOT_STARTED
            });
            await this.dragonCaveQuestRepository.save(quest);
        }

        return quest;
    }

    async getQuestDetails(dinoId: number) {
        const quest = await this.getOrCreateQuest(dinoId);
        const requirements = await this.checkRequirements(dinoId);

        return {
            title: "La caverne du dragon",
            description: "Il vous est souvent arrivé de passer devant cette caverne résonante où vivait autrefois un dragon. Elle est maintenant abandonnée de tous et une grande grille en fer forgé fermée à clef en clôture l'accès. Au centre de cette grille demeure une serrure. Tu ne pourras pénétrer dans ce lieu mystérieux qu'avec une grosse clé dorée.",
            status: quest.status,
            requirements: requirements
        };
    }

    async checkRequirements(dinoId: number): Promise<{ 
        canComplete: boolean; 
        requirements: { 
            hasKey: boolean;
        } 
    }> {
        const cave = await this.caveService.findByDinoId(dinoId);
        const hasKey = cave.inventory['cle_doree']?.quantity > 0;

        return {
            canComplete: hasKey,
            requirements: {
                hasKey
            }
        };
    }

    async useKey(dinoId: number): Promise<{ message: string }> {
        const quest = await this.getOrCreateQuest(dinoId);
        const cave = await this.caveService.findByDinoId(dinoId);
        const dino = await this.dinoService.findOne(dinoId);

        // Vérifier si la quête n'est pas déjà complétée
        if (quest.status === DragonCaveQuestStatus.COMPLETED) {
            throw new BadRequestException("Vous avez déjà terminé cette quête");
        }

        // Vérifier la clé
        const requirements = await this.checkRequirements(dinoId);
        if (!requirements.canComplete) {
            throw new BadRequestException("Vous n'avez pas la clé dorée");
        }

        // Consommer la clé
        await this.caveService.removeFromInventory(cave.id, 'cle_doree', 1);

        // Marquer la quête comme complétée
        quest.status = DragonCaveQuestStatus.COMPLETED;
        await this.dragonCaveQuestRepository.save(quest);

        // Ajouter la quête aux quêtes complétées du dino
        if (!dino.completedQuests) {
            dino.completedQuests = [];
        }
        if (!dino.completedQuests.includes('caverne_dragon')) {
            dino.completedQuests.push('caverne_dragon');
            await this.dinoService.update(dinoId, dino);
        }

        return {
            message: "Vous avez utilisé la clé dorée ! La caverne du dragon vous est maintenant accessible."
        };
    }
} 