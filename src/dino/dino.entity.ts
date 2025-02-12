import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { DinoSpecies } from './dto/create-dino.dto';
import { Cave } from './cave.entity';
import { Job } from './dto/job.enum';
import { Disease } from './dto/disease.enum';

@Entity()
export class Dino {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: DinoSpecies
    })
    species: DinoSpecies;

    @Column({
        type: 'enum',
        enum: Job,
        default: Job.CHOMEUR
    })
    job: Job;

    @Column({ default: 0 })
    emeralds: number;

    @Column({ nullable: true })
    clan: string;

    @Column({ type: 'enum', enum: ['male', 'female'] })
    sex: string;

    @Column({ default: 1 })
    weight: number;

    @Column({ default: 1 })
    height: number;

    @Column({ default: 1 })
    intelligence: number;

    @Column({ default: 1 })
    agility: number;

    @Column({ default: 1 })
    strength: number;

    @Column({ default: 1 })
    endurance: number;

    @Column({ default: 100 })
    health: number;

    @Column({ default: true })
    hunger: boolean;

    @Column({ default: true })
    thirst: boolean;

    @Column({ default: 0 })
    experience: number;

    @ManyToOne(() => User, user => user.dinos)
    user: User;

    @Column()
    userId: number;

    @Column({default : 1})
    level: number;

    @OneToOne(() => Cave, cave => cave.dino)
    cave: Cave;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastAction: Date;
    
    @Column({ default: true })
    isActive: boolean;

    @Column('simple-array', { nullable: true })
    completedQuests: string[];

    @Column({ default: true })
    canHunt: boolean;

    @Column({ default: 0 })
    dailySentDuels: number;

    @Column({ default: 0 })
    dailyReceivedDuels: number;

    @Column({ type: 'enum', enum: Disease, nullable: true })
    disease: Disease | null;

    @Column({ type: 'timestamp', nullable: true })
    diseaseStartDate: Date | null;
} 