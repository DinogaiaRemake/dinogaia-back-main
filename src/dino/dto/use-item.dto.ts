import { IsString, IsNumber } from 'class-validator';

export class UseItemDto {
    @IsString()
    itemKey: string;

    @IsNumber()
    quantity: number;
} 