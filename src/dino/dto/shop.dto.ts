import { ItemType } from './item.enum';
import { IsEnum } from 'class-validator';

export class GetShopItemsDto {
    @IsEnum(ItemType)
    type: ItemType;
} 