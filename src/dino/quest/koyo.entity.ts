import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Dino } from '../dino.entity';

export enum KoyoQuestStatus {
    NOT_STARTED = 'NOT_STARTED',
    // Valeur historique conservée temporairement pour migration automatique
    NOT_COMPLETED = 'NOT_COMPLETED',
    COMPLETED = 'COMPLETED'
}

@Entity()
export class KoyoQuest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dino)
    dino: Dino;

    @Column()
    dinoId: number;

    @Column({
        type: 'enum',
        enum: KoyoQuestStatus,
        default: KoyoQuestStatus.NOT_STARTED
    })
    status: KoyoQuestStatus;

    // Date d'apparition de Koyo (null si non apparu)
    @Column({ type: 'timestamp', nullable: true })
    spawnedAt: Date | null;

    // Date d'expiration de l'apparition (null si non apparu)
    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;
} 