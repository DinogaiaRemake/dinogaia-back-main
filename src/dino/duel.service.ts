import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Duel, DuelStatus, AttackZone, DuelResult, DuelRound } from './duel.entity';
import { Dino } from './dino.entity';
import { CreateDuelDto } from './dto/create-duel.dto';
import { Brackets } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DuelService {
    constructor(
        @InjectRepository(Duel)
        private duelRepository: Repository<Duel>,
        @InjectRepository(Dino)
        private dinoRepository: Repository<Dino>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_11PM)
    async cleanupDuelsAtMidnight() {
        console.log('Suppression de tous les duels à minuit...');
        try {
            await this.duelRepository.clear();
            console.log('Tous les duels ont été supprimés avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression des duels:', error);
        }
    }

    private async verifyDinoOwnership(dinoId: number, userId: number): Promise<Dino> {
        const dino = await this.dinoRepository.findOne({ 
            where: { id: dinoId, userId: userId }
        });

        if (!dino) {
            throw new ForbiddenException('Ce dinosaure ne vous appartient pas');
        }

        return dino;
    }

    async createDuel(challengerId: number, createDuelDto: CreateDuelDto, userId: number): Promise<Duel> {
        const challenger = await this.verifyDinoOwnership(challengerId, userId);
        const opponent = await this.dinoRepository.findOne({ where: { id: createDuelDto.opponentId } });

        if (!opponent) {
            throw new NotFoundException('Opposant non trouvé');
        }

        if (challenger.id === opponent.id) {
            throw new ForbiddenException('Un dinosaure ne peut pas se battre contre lui-même');
        }

        // Vérifier et réinitialiser les compteurs si nécessaire

        // Vérifier les limites
        if (challenger.dailySentDuels >= 10) {
            throw new ForbiddenException('Vous avez atteint la limite de 10 demandes de duel par jour');
        }

        if (opponent.dailyReceivedDuels >= 10) {
            throw new ForbiddenException('Cet opposant a déjà atteint la limite de 10 demandes de duel par jour');
        }

        // Vérification des mouvements
        if (createDuelDto.attacks.length !== 3 || createDuelDto.defenses.length !== 3) {
            throw new ForbiddenException('Il faut exactement 3 attaques et 3 défenses');
        }

        // Incrémenter les compteurs
        challenger.dailySentDuels++;
        opponent.dailyReceivedDuels++;
        await this.dinoRepository.save([challenger, opponent]);

        const duel = this.duelRepository.create({
            challenger,
            opponent,
            challengerMoves: {
                attacks: createDuelDto.attacks,
                defenses: createDuelDto.defenses
            },
            isSeenByChallenger: true,
            isSeenByOpponent: false
        });

        return await this.duelRepository.save(duel);
    }

    async acceptDuel(duelId: number, dinoId: number, opponentMoves: { attacks: AttackZone[], defenses: AttackZone[] }, userId: number): Promise<Duel> {
        await this.verifyDinoOwnership(dinoId, userId);

        const duel = await this.duelRepository.findOne({ 
            where: { id: duelId },
            relations: ['challenger', 'opponent']
        });

        if (!duel) {
            throw new NotFoundException('Duel non trouvé');
        }

        if (duel.opponent.id !== dinoId) {
            throw new ForbiddenException('Vous ne pouvez pas accepter un duel qui ne vous est pas destiné');
        }

        if (duel.status !== DuelStatus.PENDING) {
            throw new ForbiddenException('Ce duel ne peut plus être accepté');
        }

        duel.status = DuelStatus.ACCEPTED;
        duel.opponentMoves = opponentMoves;

        const result = await this.calculateDuelResult(duel);
        duel.result = result;
        duel.status = DuelStatus.COMPLETED;
        // Quand le duel est terminé, les deux participants doivent revoir le résultat
        duel.isSeenByChallenger = false;
        duel.isSeenByOpponent = false;

        return await this.duelRepository.save(duel);
    }

    async rejectDuel(duelId: number, dinoId: number, userId: number): Promise<Duel> {
        await this.verifyDinoOwnership(dinoId, userId);

        const duel = await this.duelRepository.findOne({ 
            where: { id: duelId },
            relations: ['challenger', 'opponent']
        });

        if (!duel) {
            throw new NotFoundException('Duel non trouvé');
        }

        if (duel.opponent.id !== dinoId) {
            throw new ForbiddenException('Vous ne pouvez pas rejeter un duel qui ne vous est pas destiné');
        }

        if (duel.status !== DuelStatus.PENDING) {
            throw new ForbiddenException('Ce duel ne peut plus être rejeté');
        }

        duel.status = DuelStatus.REJECTED;
        
        // Décrémenter les compteurs pour les deux dinosaures
        const [challenger, opponent] = await Promise.all([
            this.dinoRepository.findOne({ where: { id: duel.challenger.id } }),
            this.dinoRepository.findOne({ where: { id: dinoId } })
        ]);

        if (challenger) {
            challenger.dailySentDuels = Math.max(0, challenger.dailySentDuels - 1);
            await this.dinoRepository.save(challenger);
        }
        if (opponent) {
            opponent.dailyReceivedDuels = Math.max(0, opponent.dailyReceivedDuels - 1);
            await this.dinoRepository.save(opponent);
        }

        return await this.duelRepository.save(duel);
    }

    async getPendingSentDuels(dinoId: number, userId: number): Promise<Duel[]> {
        await this.verifyDinoOwnership(dinoId, userId);

        return await this.duelRepository
            .createQueryBuilder('duel')
            .leftJoinAndSelect('duel.challenger', 'challenger')
            .leftJoinAndSelect('duel.opponent', 'opponent')
            .where('duel.status = :status', { status: DuelStatus.PENDING })
            .andWhere('challenger.id = :dinoId', { dinoId })
            .orderBy('duel.createdAt', 'DESC')
            .getMany();
    }

    async getPendingReceivedDuels(dinoId: number, userId: number): Promise<Duel[]> {
        await this.verifyDinoOwnership(dinoId, userId);

        return await this.duelRepository
            .createQueryBuilder('duel')
            .leftJoinAndSelect('duel.challenger', 'challenger')
            .leftJoinAndSelect('duel.opponent', 'opponent')
            .where('duel.status = :status', { status: DuelStatus.PENDING })
            .andWhere('opponent.id = :dinoId', { dinoId })
            .orderBy('duel.createdAt', 'DESC')
            .getMany();
    }

    async getUnseenDuelsCount(dinoId: number, userId: number): Promise<{ received: number, completed: number }> {
        await this.verifyDinoOwnership(dinoId, userId);

        // Duels reçus non vus (seulement pour l'opposant)
        const unreadReceivedCount = await this.duelRepository
            .createQueryBuilder('duel')
            .leftJoinAndSelect('duel.opponent', 'opponent')
            .where('duel.status = :status', { status: DuelStatus.PENDING })
            .andWhere('opponent.id = :dinoId', { dinoId })
            .andWhere('duel.isSeenByOpponent = :isSeen', { isSeen: false })
            .getCount();

        // Duels terminés non vus (pour les deux participants)
        const unreadCompletedCount = await this.duelRepository
            .createQueryBuilder('duel')
            .leftJoinAndSelect('duel.challenger', 'challenger')
            .leftJoinAndSelect('duel.opponent', 'opponent')
            .where('duel.status = :status', { status: DuelStatus.COMPLETED })
            .andWhere(new Brackets(qb => {
                qb.where('challenger.id = :dinoId AND duel.isSeenByChallenger = :isSeen')
                  .orWhere('opponent.id = :dinoId AND duel.isSeenByOpponent = :isSeen');
            }))
            .setParameters({ dinoId, isSeen: false, status: DuelStatus.COMPLETED })
            .getCount();

        return {
            received: unreadReceivedCount,
            completed: unreadCompletedCount
        };
    }

    async markDuelsAsSeen(dinoId: number, userId: number): Promise<void> {
        await this.verifyDinoOwnership(dinoId, userId);

        // Marquer les duels reçus comme vus (seulement pour l'opposant)
        await this.duelRepository
            .createQueryBuilder('duel')
            .update(Duel)
            .set({ isSeenByOpponent: true })
            .where('duel.opponentId = :dinoId', { dinoId })
            .andWhere('duel.status = :status', { status: DuelStatus.PENDING })
            .andWhere('duel.isSeenByOpponent = :isSeen', { isSeen: false })
            .execute();

        // Marquer les duels terminés comme vus (pour les deux participants)
        await this.duelRepository
            .createQueryBuilder('duel')
            .update(Duel)
            .set({ 
                isSeenByChallenger: () => 'CASE WHEN duel.challengerId = :dinoId THEN true ELSE isSeenByChallenger END',
                isSeenByOpponent: () => 'CASE WHEN duel.opponentId = :dinoId THEN true ELSE isSeenByOpponent END'
            })
            .where('(duel.challengerId = :dinoId OR duel.opponentId = :dinoId)', { dinoId })
            .andWhere('duel.status = :status', { status: DuelStatus.COMPLETED })
            .execute();
    }

    async getDuelHistory(dinoId: number, userId: number): Promise<Duel[]> {
        await this.verifyDinoOwnership(dinoId, userId);

        return await this.duelRepository
            .createQueryBuilder('duel')
            .leftJoinAndSelect('duel.challenger', 'challenger')
            .leftJoinAndSelect('duel.opponent', 'opponent')
            .where('duel.status = :status', { status: DuelStatus.COMPLETED })
            .andWhere(
                '(challenger.id = :dinoId OR opponent.id = :dinoId)',
                { dinoId }
            )
            .orderBy('duel.createdAt', 'DESC')
            .getMany();
    }

    async getDailyDuelCounters(dinoId: number, userId: number): Promise<{ sent: number, received: number }> {
        const dino = await this.verifyDinoOwnership(dinoId, userId);
        return {
            sent: dino.dailySentDuels,
            received: dino.dailyReceivedDuels
        };
    }

    private async calculateRewards(winner: Dino, loser: Dino): Promise<{ xp: number, emeralds: number }> {
        // Calcul du ratio de niveau
        const levelRatio = Math.min(2, Math.max(0.5, loser.level / winner.level));

        // Calcul du ratio de stats totales
        const winnerStats = winner.strength + winner.agility + winner.intelligence + winner.endurance;
        const loserStats = loser.strength + loser.agility + loser.intelligence + loser.endurance;
        const statsRatio = Math.min(2, Math.max(0.5, loserStats / winnerStats));

        // Calcul de l'XP (entre 1 et 8)
        const baseXP = 4; // Valeur de base médiane
        const xpMultiplier = levelRatio * statsRatio;
        const finalXP = Math.max(1, Math.min(8, Math.round(baseXP * xpMultiplier)));

        // Calcul des émeraudes (entre 1 et 6)
        const baseEmeralds = 3; // Valeur de base médiane
        const emeraldMultiplier = (levelRatio + statsRatio) / 2;
        const finalEmeralds = Math.max(1, Math.min(6, Math.round(baseEmeralds * emeraldMultiplier)));

        //distribute the xp and emeralds to the winner 
        winner.experience += finalXP;
        winner.emeralds += finalEmeralds;

        //save the winner and the loser
        await this.dinoRepository.save(winner);
        await this.dinoRepository.save(loser);

        return {
            xp: finalXP,
            emeralds: finalEmeralds
        };
    }

    private async calculateDuelResult(duel: Duel): Promise<DuelResult> {
        const rounds: DuelRound[] = [];
        let challengerDamage = 0;
        let opponentDamage = 0;

        // Utiliser la vie actuelle des dinosaures
        let challengerHP = duel.challenger.health;
        let opponentHP = duel.opponent.health;

        const startingHP = {
            challenger: challengerHP,
            opponent: opponentHP
        };

        for (let i = 0; i < 3 && (challengerHP > 0 && opponentHP > 0); i++) {
            const round: DuelRound = {
                round: i + 1,
                challengerAttack: duel.challengerMoves.attacks[i],
                challengerDefense: duel.challengerMoves.defenses[i],
                opponentAttack: duel.opponentMoves.attacks[i],
                opponentDefense: duel.opponentMoves.defenses[i],
                challengerDamage: 0,
                opponentDamage: 0
            };

            // Le challenger attaque en premier
            if (challengerHP > 0) {
                round.opponentDamage = this.calculateDamage(
                    duel.challenger,
                    duel.opponent,
                    round.challengerAttack,
                    round.opponentDefense
                );
                opponentHP -= round.opponentDamage;
            }

            // L'opposant attaque seulement s'il est encore en vie
            if (opponentHP > 0) {
                round.challengerDamage = this.calculateDamage(
                    duel.opponent,
                    duel.challenger,
                    round.opponentAttack,
                    round.challengerDefense
                );
                challengerHP -= round.challengerDamage;
            }

            challengerDamage += round.challengerDamage;
            opponentDamage += round.opponentDamage;

            rounds.push(round);
        }

        // Détermination du vainqueur et du perdant
        let winner: number;
        let winnerDino: Dino;
        let loserDino: Dino;

        // Calcul de la vie restante
        const challengerRemainingHP = startingHP.challenger - challengerDamage;
        const opponentRemainingHP = startingHP.opponent - opponentDamage;

        if (challengerHP <= 0 && opponentHP <= 0) {
            // En cas de double KO, celui qui a le plus de vie restante gagne
            if (challengerRemainingHP >= opponentRemainingHP) {
                winner = duel.challenger.id;
                winnerDino = duel.challenger;
                loserDino = duel.opponent;
            } else {
                winner = duel.opponent.id;
                winnerDino = duel.opponent;
                loserDino = duel.challenger;
            }
        } else if (challengerHP <= 0) {
            winner = duel.opponent.id;
            winnerDino = duel.opponent;
            loserDino = duel.challenger;
        } else if (opponentHP <= 0) {
            winner = duel.challenger.id;
            winnerDino = duel.challenger;
            loserDino = duel.opponent;
        } else {
            // Celui qui a le plus de vie restante gagne
            if (challengerRemainingHP >= opponentRemainingHP) {
                winner = duel.challenger.id;
                winnerDino = duel.challenger;
                loserDino = duel.opponent;
            } else {
                winner = duel.opponent.id;
                winnerDino = duel.opponent;
                loserDino = duel.challenger;
            }
        }

        // Calcul des récompenses
        const rewards = await this.calculateRewards(winnerDino, loserDino);

        return {
            winner,
            challengerDamage,
            opponentDamage,
            rounds,
            startingHP,
            remainingHP: {
                challenger: Math.max(0, challengerHP),
                opponent: Math.max(0, opponentHP)
            },
            rewards
        };
    }

    private calculateDamage(
        attacker: Dino,
        defender: Dino,
        attackZone: AttackZone,
        defenseZone: AttackZone
    ): number {
        // Calcul des stats d'attaque selon la zone
        const attackStats = this.getZoneStats(attacker, attackZone, true);
        const defenseStats = this.getZoneStats(defender, defenseZone, false);

        // Calcul du ratio d'efficacité
        let effectiveness = 1.0;
        if (attackZone === defenseZone) {
            effectiveness = 0.5; // Défense parfaite
        } else {
            // Système de bonus type pierre-papier-ciseaux
            effectiveness = this.getZoneEffectiveness(attackZone, defenseZone);
        }

        // Calcul du ratio attaque/défense avec une formule logarithmique pour réduire les écarts
        const statRatio = Math.log10(attackStats / defenseStats + 1);

        // Formule de dégâts révisée
        const baseDamage = 15 * statRatio * effectiveness;
        
        // Facteur de niveau atténué
        const levelFactor = Math.pow(attacker.level / defender.level, 0.2); // Exposant 0.2 pour réduire l'impact du niveau
        
        // Facteur aléatoire très réduit (entre 0.95 et 1.05)
        const randomFactor = 0.95 + Math.random() * 0.1;

        // Calcul final des dégâts
        const finalDamage = baseDamage * levelFactor * randomFactor;

        // Limites de dégâts plus strictes
        return Math.max(5, Math.min(25, Math.round(finalDamage)));
    }

    private getZoneStats(dino: Dino, zone: AttackZone, isAttack: boolean): number {
        switch (zone) {
            case AttackZone.HEAD:
                return isAttack 
                    ? (dino.intelligence * 0.7 + dino.agility * 0.3)
                    : (dino.intelligence * 0.6 + dino.endurance * 0.4);
            case AttackZone.BODY:
                return isAttack
                    ? (dino.strength * 0.7 + dino.endurance * 0.3)
                    : (dino.endurance * 0.7 + dino.strength * 0.3);
            case AttackZone.LEGS:
                return isAttack
                    ? (dino.agility * 0.7 + dino.strength * 0.3)
                    : (dino.agility * 0.6 + dino.endurance * 0.4);
            default:
                return 0;
        }
    }

    private getZoneEffectiveness(attackZone: AttackZone, defenseZone: AttackZone): number {
        const effectiveness = {
            [AttackZone.HEAD]: { [AttackZone.LEGS]: 1.3, [AttackZone.BODY]: 0.8 },
            [AttackZone.BODY]: { [AttackZone.HEAD]: 1.3, [AttackZone.LEGS]: 0.8 },
            [AttackZone.LEGS]: { [AttackZone.BODY]: 1.3, [AttackZone.HEAD]: 0.8 }
        };

        return effectiveness[attackZone]?.[defenseZone] || 1.0;
    }

    async cancelDuel(duelId: number, dinoId: number, userId: number): Promise<Duel> {
        await this.verifyDinoOwnership(dinoId, userId);

        const duel = await this.duelRepository.findOne({ 
            where: { id: duelId },
            relations: ['challenger', 'opponent']
        });

        if (!duel) {
            throw new NotFoundException('Duel non trouvé');
        }

        if (duel.challenger.id !== dinoId) {
            throw new ForbiddenException('Vous ne pouvez pas annuler un duel que vous n\'avez pas initié');
        }

        if (duel.status !== DuelStatus.PENDING) {
            throw new ForbiddenException('Ce duel ne peut plus être annulé');
        }

        duel.status = DuelStatus.REJECTED;
        duel.isSeenByOpponent = true;

        // Décrémenter les compteurs pour permettre de nouveaux duels
        const [challenger, opponent] = await Promise.all([
            this.dinoRepository.findOne({ where: { id: dinoId } }),
            this.dinoRepository.findOne({ where: { id: duel.opponent.id } })
        ]);

        if (challenger) {
            challenger.dailySentDuels = Math.max(0, challenger.dailySentDuels - 1);
            await this.dinoRepository.save(challenger);
        }
        if (opponent) {
            opponent.dailyReceivedDuels = Math.max(0, opponent.dailyReceivedDuels - 1);
            await this.dinoRepository.save(opponent);
        }
        
        return await this.duelRepository.save(duel);
    }
} 
