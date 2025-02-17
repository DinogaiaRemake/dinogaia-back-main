import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Dino } from './dino.entity';
import { ItemType } from './dto/item.enum';

@Entity()
export class MarketListing {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dino)
    seller: Dino;

    @Column()
    itemKey: string;

    @Column()
    quantity: number;

    @Column()
    pricePerUnit: number;

    @Column({
        type: 'enum',
        enum: ItemType
    })
    itemType: ItemType;

    @CreateDateColumn()
    listedAt: Date;

    @Column({ default: true })
    isActive: boolean;
} 