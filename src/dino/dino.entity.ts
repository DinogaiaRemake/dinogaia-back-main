import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { DinoSpecies } from './dto/create-dino.dto';
import { Cave } from './cave.entity';

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

    @Column({ nullable: true })
    clan: string;

    @Column({ type: 'enum', enum: ['male', 'female'] })
    sex: string;

    @Column({ default: 1 })
    weight: number;

    @Column({ default: 1 })
    height: number;

    @Column({ default: 10 })
    intelligence: number;

    @Column({ default: 10 })
    agility: number;

    @Column({ default: 10 })
    strength: number;

    @Column({ default: 10 })
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
} 
