import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Dino } from './dino.entity';

export enum AttackZone {
    HEAD = 'head',
    BODY = 'body',
    LEGS = 'legs'
}

export enum DuelStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    COMPLETED = 'completed'
}

export interface DuelRound {
    round: number;
    challengerAttack: AttackZone;
    challengerDefense: AttackZone;
    opponentAttack: AttackZone;
    opponentDefense: AttackZone;
    challengerDamage: number;
    opponentDamage: number;
}

export interface DuelResult {
    winner: number;
    challengerDamage: number;
    opponentDamage: number;
    rounds: DuelRound[];
    remainingHP: {
        challenger: number;
        opponent: number;
    };
}

@Entity()
export class Duel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dino)
    challenger: Dino;

    @ManyToOne(() => Dino)
    opponent: Dino;

    @Column({
        type: 'enum',
        enum: DuelStatus,
        default: DuelStatus.PENDING
    })
    status: DuelStatus;

    @Column('simple-json')
    challengerMoves: {
        attacks: AttackZone[];
        defenses: AttackZone[];
    };

    @Column('simple-json', { nullable: true })
    opponentMoves: {
        attacks: AttackZone[];
        defenses: AttackZone[];
    };

    @Column('simple-json', { nullable: true })
    result: DuelResult;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 
