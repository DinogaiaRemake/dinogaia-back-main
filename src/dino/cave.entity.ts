import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Dino } from './dino.entity';
import { ItemType } from './dto/item.enum';

interface InventoryItem {
    quantity: number;
    type: ItemType;
    displayName: string;
    weightGain?: number;
    xpGain?: number;
    securityBonus?: number;
    hygieneBonus?: number;
    skillBonus?: {
        intelligence?: number;
        agility?: number;
        strength?: number;
        endurance?: number;
    };
    weaponStats?: {
        minPreys: number;
        maxPreys: number;
    };
}

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
        [key: string]: InventoryItem;
    };

    @OneToOne(() => Dino)
    @JoinColumn()
    dino: Dino;

    @Column()
    dinoId: number;
} 