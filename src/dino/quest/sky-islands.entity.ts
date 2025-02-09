import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Dino } from '../dino.entity';

export enum SkyIslandsQuestStatus {
    NOT_STARTED = 'NOT_STARTED',
    COMPLETED = 'COMPLETED'
}

@Entity()
export class SkyIslandsQuest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dino)
    dino: Dino;

    @Column()
    dinoId: number;

    @Column({
        type: 'enum',
        enum: SkyIslandsQuestStatus,
        default: SkyIslandsQuestStatus.NOT_STARTED
    })
    status: SkyIslandsQuestStatus;

    @CreateDateColumn()
    createdAt: Date;
} 