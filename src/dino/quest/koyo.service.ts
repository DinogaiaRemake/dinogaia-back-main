import { Injectable, OnModuleInit, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KoyoQuest, KoyoQuestStatus } from './koyo.entity';
import { CaveService } from '../cave.service';
import { DinoService } from '../dino.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KoyoQuestService implements OnModuleInit {
    private readonly SPAWN_CHANCE = 1 / 96; // 1 chance sur 96 chaque heure
    private readonly SPAWN_DURATION_MS = 60 * 60 * 1000; // 1 heure
    private readonly logger = new Logger(KoyoQuestService.name);

    constructor(
        @InjectRepository(KoyoQuest)
        private koyoRepository: Repository<KoyoQuest>,
        private caveService: CaveService,
        private dinoService: DinoService
    ) {}

    async onModuleInit() {
        await this.initializeQuestsForExistingDinos();

        // Migration des anciennes valeurs NOT_COMPLETED => NOT_STARTED
        const outdated = await this.koyoRepository.find({ where: { status: KoyoQuestStatus.NOT_COMPLETED as any } });
        if (outdated.length) {
            outdated.forEach(q => (q.status = KoyoQuestStatus.NOT_STARTED));
            await this.koyoRepository.save(outdated);
            this.logger.log(`Migration KoyoQuest: ${outdated.length} lignes mises à jour (NOT_COMPLETED → NOT_STARTED)`);
        }
    }

    private async initializeQuestsForExistingDinos() {
        const dinos = await this.dinoService.findAll();
        const existing = await this.koyoRepository.find();
        const existingIds = existing.map(q => q.dinoId);

        const toCreate = dinos
            .filter(d => !existingIds.includes(d.id))
            .map(d => ({ dinoId: d.id, status: KoyoQuestStatus.NOT_STARTED }));

        if (toCreate.length) {
            await this.koyoRepository.save(toCreate);
        }
    }

    private async getOrCreateQuest(dinoId: number): Promise<KoyoQuest> {
        let quest = await this.koyoRepository.findOne({ where: { dinoId } });
        if (!quest) {
            quest = this.koyoRepository.create({ dinoId, status: KoyoQuestStatus.NOT_STARTED });
            await this.koyoRepository.save(quest);
        }
        return quest;
    }

    async getQuestDetails(dinoId: number) {
        await this.checkSpawn(dinoId); // Met à jour l'état d'apparition si besoin
        const quest = await this.getOrCreateQuest(dinoId);
        return {
            title: 'Koyo le véloce',
            description: "Un étrange individu rôde à Gaïa-West, reste attentif.",
            status: quest.status,
            spawn: await this.getSpawnStatus(dinoId)
        };
    }

    async getSpawnStatus(dinoId: number) {
        const quest = await this.getOrCreateQuest(dinoId);
        const now = new Date();
        if (quest.status === KoyoQuestStatus.COMPLETED) {
            return { present: false };
        }
        if (quest.expiresAt && quest.expiresAt > now) {
            return { present: true, expiresAt: quest.expiresAt };
        }
        return { present: false };
    }

    async checkSpawn(dinoId: number) {
        const quest = await this.getOrCreateQuest(dinoId);
        const now = new Date();

        // Si la quête est terminée, rien à faire
        if (quest.status === KoyoQuestStatus.COMPLETED) return;

        // Si Koyo est déjà présent
        if (quest.expiresAt && quest.expiresAt > now) return;

        // Si l'apparition est expirée, on réinitialise
        if (quest.expiresAt && quest.expiresAt <= now) {
            quest.spawnedAt = null;
            quest.expiresAt = null;
            await this.koyoRepository.save(quest);
        }

        // Tentative de faire apparaître Koyo
        const random = Math.random();
        if (random < this.SPAWN_CHANCE) {
            quest.spawnedAt = now;
            quest.expiresAt = new Date(now.getTime() + this.SPAWN_DURATION_MS);
            await this.koyoRepository.save(quest);
        }
    }

    async catchKoyo(dinoId: number) {
        const quest = await this.getOrCreateQuest(dinoId);
        const now = new Date();

        if (!quest.expiresAt || quest.expiresAt < now) {
            throw new BadRequestException("Koyo n'est pas présent actuellement");
        }
        if (quest.status === KoyoQuestStatus.COMPLETED) {
            throw new BadRequestException('Quête déjà complétée');
        }

        // Donner l'objet de quête
        const cave = await this.caveService.findByDinoId(dinoId);
        await this.caveService.addToInventory(cave.id, 'ufo', 1);

        // Marquer la quête comme complétée
        quest.status = KoyoQuestStatus.COMPLETED;
        quest.spawnedAt = null;
        quest.expiresAt = null;
        await this.koyoRepository.save(quest);

        // Marquer la quête dans les quêtes complétées du dino
        const dino = await this.dinoService.findOne(dinoId);
        if (!dino.completedQuests) dino.completedQuests = [];
        if (!dino.completedQuests.includes('koyo_veloce')) {
            dino.completedQuests.push('koyo_veloce');
            await this.dinoService.update(dinoId, dino);
        }

        return { message: 'Vous avez repéré Koyo ! Vous obtenez l\'UFO' };
    }

    /*
     * Cron exécuté chaque heure pile
     * - Réinitialise les apparitions expirées
     * - Tente de faire apparaître Koyo pour chaque dino n’ayant pas encore terminé la quête
     *   selon la probabilité définie.
     * Les statistiques de l’exécution sont loguées explicitement.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async handleHourlySpawn() {
        this.logger.log('=== CRON KOYO SPAWN START ===');
        const quests = await this.koyoRepository.find({ where: { status: KoyoQuestStatus.NOT_STARTED } });
        const now = new Date();
        let resets = 0;
        let spawns = 0;

        for (const quest of quests) {
            // Réinitialiser si apparition expirée
            if (quest.expiresAt && quest.expiresAt <= now) {
                resets++;
                quest.spawnedAt = null;
                quest.expiresAt = null;
            }

            // Tenter apparition si Koyo absent
            if (!quest.expiresAt) {
                if (Math.random() < this.SPAWN_CHANCE) {
                    spawns++;
                    quest.spawnedAt = now;
                    quest.expiresAt = new Date(now.getTime() + this.SPAWN_DURATION_MS);
                }
            }
        }

        await this.koyoRepository.save(quests);

        this.logger.log(`Quêtes analysées : ${quests.length} | réinitialisées : ${resets} | nouvelles apparitions : ${spawns}`);
        this.logger.log('=== CRON KOYO SPAWN END ===');
    }
} 