import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Duel, DuelStatus, AttackZone, DuelResult, DuelRound } from './duel.entity';
import { Dino } from './dino.entity';
import { CreateDuelDto } from './dto/create-duel.dto';

@Injectable()
export class DuelService {
    constructor(
        @InjectRepository(Duel)
        private duelRepository: Repository<Duel>,
        @InjectRepository(Dino)
        private dinoRepository: Repository<Dino>,
    ) {}

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

        const duel = this.duelRepository.create({
            challenger,
            opponent,
            challengerMoves: {
                attacks: createDuelDto.attacks,
                defenses: createDuelDto.defenses
            }
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

        const result = this.calculateDuelResult(duel);
        duel.result = result;
        duel.status = DuelStatus.COMPLETED;

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

    private calculateDuelResult(duel: Duel): DuelResult {
        const rounds: DuelRound[] = [];
        let challengerDamage = 0;
        let opponentDamage = 0;

        // Points de vie simulés (ne seront pas sauvegardés)
        let challengerHP = duel.challenger.health;
        let opponentHP = duel.opponent.health;

        // Calculer les dégâts pour chaque round
        for (let i = 0; i < 3; i++) {
            const round = {
                round: i + 1,
                challengerAttack: duel.challengerMoves.attacks[i],
                challengerDefense: duel.challengerMoves.defenses[i],
                opponentAttack: duel.opponentMoves.attacks[i],
                opponentDefense: duel.opponentMoves.defenses[i],
                challengerDamage: 0,
                opponentDamage: 0
            };

            // Les deux attaquent simultanément
            const challengerDamageThisRound = this.calculateDamage(
                duel.challenger,
                duel.opponent,
                round.challengerAttack,
                round.opponentDefense
            );

            const opponentDamageThisRound = this.calculateDamage(
                duel.opponent,
                duel.challenger,
                round.opponentAttack,
                round.challengerDefense
            );

            // Appliquer les dégâts simultanément
            round.challengerDamage = opponentDamageThisRound;
            round.opponentDamage = challengerDamageThisRound;
            
            challengerDamage += opponentDamageThisRound;
            opponentDamage += challengerDamageThisRound;
            
            challengerHP -= opponentDamageThisRound;
            opponentHP -= challengerDamageThisRound;

            rounds.push(round);

            // Vérifier si l'un des deux est KO
            if (challengerHP <= 0 || opponentHP <= 0) {
                break;
            }
        }

        // Déterminer le gagnant en fonction des points de vie restants
        const winner = challengerHP <= 0 && opponentHP <= 0 ? (opponentDamage > challengerDamage ? duel.challenger.id : duel.opponent.id) :
                      challengerHP <= 0 ? duel.opponent.id :
                      opponentHP <= 0 ? duel.challenger.id :
                      challengerHP > opponentHP ? duel.challenger.id : duel.opponent.id;

        return {
            winner,
            challengerDamage,
            opponentDamage,
            rounds,
            remainingHP: {
                challenger: Math.max(0, challengerHP),
                opponent: Math.max(0, opponentHP)
            }
        };
    }

    private calculateDamage(attacker: Dino, defender: Dino, attackZone: AttackZone, defenseZone: AttackZone): number {
        // Calculer le ratio d'attaque basé sur les stats et la zone d'attaque
        let attackRatio = 0;
        switch (attackZone) {
            case AttackZone.HEAD:
                // Attaque à la tête : intelligence + agilité
                attackRatio = (attacker.intelligence * 0.6 + attacker.agility * 0.4);
                break;
            case AttackZone.BODY:
                // Attaque au corps : force + endurance
                attackRatio = (attacker.strength * 0.6 + attacker.endurance * 0.4);
                break;
            case AttackZone.LEGS:
                // Attaque aux jambes : agilité + force
                attackRatio = (attacker.agility * 0.6 + attacker.strength * 0.4);
                break;
        }

        // Calculer le ratio de défense basé sur les stats et la zone de défense
        let defenseRatio = 0;
        switch (defenseZone) {
            case AttackZone.HEAD:
                // Défense de la tête : intelligence + endurance
                defenseRatio = (defender.intelligence * 0.6 + defender.endurance * 0.4);
                break;
            case AttackZone.BODY:
                // Défense du corps : endurance + force
                defenseRatio = (defender.endurance * 0.6 + defender.strength * 0.4);
                break;
            case AttackZone.LEGS:
                // Défense des jambes : agilité + endurance
                defenseRatio = (defender.agility * 0.6 + defender.endurance * 0.4);
                break;
        }

        // Calculer les dégâts de base
        let baseDamage = 15 * (attackRatio / defenseRatio) * (attacker.level / defender.level);//5 10.4

        // Bonus/Malus selon la correspondance attaque/défense
        if (attackZone === defenseZone) {
            // Défense parfaite : réduction importante des dégâts
            baseDamage *= 0.3;
        } else {
            // Bonus selon les zones
            switch (attackZone) {
                case AttackZone.HEAD:
                    if (defenseZone === AttackZone.LEGS) baseDamage *= 1.2; // Bonus contre les jambes
                    break;
                case AttackZone.BODY:
                    if (defenseZone === AttackZone.HEAD) baseDamage *= 1.2; // Bonus contre la tête
                    break;
                case AttackZone.LEGS:
                    if (defenseZone === AttackZone.BODY) baseDamage *= 1.2; // Bonus contre le corps
                    break;
            }
        }

        // Facteur aléatoire réduit pour plus de prévisibilité
        const randomFactor = 0.9 + Math.random() * 0.2; // Entre 0.9 et 1.1
        baseDamage *= randomFactor;

        // Limiter les dégâts entre 5 et 35 pour équilibrer
        return Math.max(5, Math.min(35, Math.round(baseDamage)));
    }
} 
