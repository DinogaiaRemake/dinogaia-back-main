import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Dino } from './dino.entity';

@Entity()
@Unique(['dinoId', 'date'])
export class CasinoDailyStat {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dino)
    dino: Dino;

    @Column()
    dinoId: number;

    // Date au format YYYY-MM-DD pour faciliter l’unicité quotidienne
    @Column()
    date: string;

    @Column({ default: 0 })
    slotPlaysUsed: number;

    @Column({ default: 0 })
    scratchPlaysUsed: number;
} 