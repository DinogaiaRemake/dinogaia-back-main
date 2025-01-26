import { Controller, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CaveService } from './cave.service';
import { AuthGuard } from '../auth/auth.guard';
import { Type } from 'class-transformer';
import { IsNumber, IsString, Min , IsOptional} from 'class-validator';

class AddInventoryItemDto {
    @IsString()
    item: string;

    @IsNumber()
    @Type(() => Number)
    @Min(1)
    quantity: number;

    @IsNumber()
    @Type(() => Number)
    weightGain?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    xpGain?: number;
}

@Controller('caves')
export class CaveController {
    constructor(private readonly caveService: CaveService) {}

    @Post(':id/inventory')
    @UseGuards(AuthGuard)
    async addToInventory(
        @Param('id', ParseIntPipe) id: number,
        @Body() itemData: AddInventoryItemDto
    ) {
        return await this.caveService.addToInventory(
            id,
            itemData.item,
            itemData.quantity,
            itemData.weightGain || 0,
            itemData.xpGain || 0
        );
    }
} 