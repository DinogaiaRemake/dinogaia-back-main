import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkyIslandsQuest, SkyIslandsQuestStatus } from './sky-islands.entity';
import { CaveService } from '../cave.service';
import { DinoService } from '../dino.service';

const QUEST_HINTS = {
    CRAB_LOCATION: "Le crabe royal se trouve souvent dans les îles du ciel...",
    OWL_LOCATION: "Les hiboux hurleurs peuvent être trouvés dans la jungle la nuit...",
    WINGS_CREATION: "Une fois tous les ingrédients rassemblés, vous pourrez fabriquer les ailes divines..."
};

@Injectable()
export class SkyIslandsQuestService implements OnModuleInit {
    constructor(
        @InjectRepository(SkyIslandsQuest)
        private skyIslandsQuestRepository: Repository<SkyIslandsQuest>,
        private caveService: CaveService,
        private dinoService: DinoService
    ) {}

    async onModuleInit() {
        console.log('Initialisation des quêtes Îles Célestes...');
        await this.initializeQuestsForExistingDinos();
    }

    private async initializeQuestsForExistingDinos() {
        // Récupérer tous les dinos
        const allDinos = await this.dinoService.findAll();
        
        // Récupérer toutes les quêtes existantes
        const existingQuests = await this.skyIslandsQuestRepository.find();
        const existingQuestDinoIds = existingQuests.map(q => q.dinoId);

        // Créer les quêtes manquantes
        const questsToCreate = allDinos
            .filter(dino => !existingQuestDinoIds.includes(dino.id))
            .map(dino => ({
                dinoId: dino.id,
                status: SkyIslandsQuestStatus.NOT_STARTED
            }));

        if (questsToCreate.length > 0) {
            console.log(`Création de ${questsToCreate.length} nouvelles quêtes Îles Célestes`);
            await this.skyIslandsQuestRepository.save(questsToCreate);
        }
    }

    async getOrCreateQuest(dinoId: number): Promise<SkyIslandsQuest> {
        let quest = await this.skyIslandsQuestRepository.findOne({ where: { dinoId } });
        
        if (!quest) {
            quest = this.skyIslandsQuestRepository.create({
                dinoId,
                status: SkyIslandsQuestStatus.NOT_STARTED
            });
            await this.skyIslandsQuestRepository.save(quest);
        }

        return quest;
    }

    async getQuestDetails(dinoId: number) {
        const quest = await this.getOrCreateQuest(dinoId);
        const requirements = await this.checkRequirements(dinoId);

        return {
            title: "Les îles du ciel",
            description: "Même un ptérodactyle ne saurait y accéder tel quel. En effet, quiconque ne dispose pas d'ailes divines n'est pas en mesure d'atteindre un tel corps céleste. C'est pourtant facile. Une vingtaine d'ailes classiques tirées d'animaux de la jungle devraient faire l'affaire. Ajoutez à cela une touche féérique, tirée de cet animal royal qui rampe latéralement le long du sable. Enfin, délectez vous de l'excursion paradisiaque.",
            status: quest.status,
            requirements: requirements
        };
    }

    async checkRequirements(dinoId: number): Promise<{ 
        canCraft: boolean; 
        requirements: { 
            crab: boolean; 
            owls: { current: number; required: number; } 
        } 
    }> {
        const cave = await this.caveService.findByDinoId(dinoId);

        const crabCount = cave.inventory['crabe_royal']?.quantity || 0;
        const owlCount = cave.inventory['hibou_hurleur']?.quantity || 0;

        const canCraft = crabCount >= 1 && owlCount >= 10;

        return {
            canCraft,
            requirements: {
                crab: crabCount >= 1,
                owls: {
                    current: owlCount,
                    required: 10
                }
            }
        };
    }

    async craftWings(dinoId: number): Promise<{ message: string }> {
        const quest = await this.getOrCreateQuest(dinoId);
        const cave = await this.caveService.findByDinoId(dinoId);
        const dino = await this.dinoService.findOne(dinoId);

        // Vérifier si la quête n'est pas déjà complétée
        if (quest.status === SkyIslandsQuestStatus.COMPLETED) {
            throw new BadRequestException("Vous avez déjà fabriqué les ailes divines");
        }

        // Vérifier les ressources
        const requirements = await this.checkRequirements(dinoId);
        if (!requirements.canCraft) {
            throw new BadRequestException("Ressources insuffisantes pour fabriquer les ailes divines");
        }

        // Consommer les ressources
        await this.caveService.removeFromInventory(cave.id, 'crabe_royal', 1);
        await this.caveService.removeFromInventory(cave.id, 'hibou_hurleur', 10);

        // Créer les ailes
        await this.caveService.addToInventory(cave.id, 'ailes_divines', 1);

        // Marquer la quête comme complétée
        quest.status = SkyIslandsQuestStatus.COMPLETED;
        await this.skyIslandsQuestRepository.save(quest);

        // Ajouter la quête aux quêtes complétées du dino
        if (!dino.completedQuests) {
            dino.completedQuests = [];
        }
        if (!dino.completedQuests.includes('iles_ciel')) {
            dino.completedQuests.push('iles_ciel');
            await this.dinoService.update(dinoId, dino);
        }

        return {
            message: "Vous avez fabriqué les ailes divines ! Les îles célestes vous sont maintenant accessibles."
        };
    }
} 