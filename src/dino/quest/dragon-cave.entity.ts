import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Dino } from '../dino.entity';

export enum DragonCaveQuestStatus {
    NOT_STARTED = 'NOT_STARTED',
    COMPLETED = 'COMPLETED'
}

@Entity()
export class DragonCaveQuest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dino)
    dino: Dino;

    @Column()
    dinoId: number;

    @Column({
        type: 'enum',
        enum: DragonCaveQuestStatus,
        default: DragonCaveQuestStatus.NOT_STARTED
    })
    status: DragonCaveQuestStatus;

    @CreateDateColumn()
    createdAt: Date;
} 