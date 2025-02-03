import { IsNotEmpty, IsArray, IsEnum, ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { AttackZone } from '../duel.entity';

export class CreateDuelDto {
    @IsNotEmpty()
    opponentId: number;

    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    @IsEnum(AttackZone, { each: true })
    attacks: AttackZone[];

    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    @IsEnum(AttackZone, { each: true })
    defenses: AttackZone[];
} 