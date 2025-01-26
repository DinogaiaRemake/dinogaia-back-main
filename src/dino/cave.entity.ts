import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Dino } from './dino.entity';

@Entity()
export class Cave {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 100 })
    hygiene: number;

    @Column({ default: 100 })
    security: number;

    @Column({ default: true })
    isClean: boolean;

    @Column('simple-json')
    inventory: {
        [key: string]: {
            quantity: number;
            weightGain: number;
            xpGain: number;
        };
    };

    @OneToOne(() => Dino)
    @JoinColumn()
    dino: Dino;

    @Column()
    dinoId: number;
} 