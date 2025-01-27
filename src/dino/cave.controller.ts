import { Controller, Post, Body, Param, UseGuards, ParseIntPipe, Get } from '@nestjs/common';
import { CaveService } from './cave.service';
import { AuthGuard } from '../auth/auth.guard';
import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';
import { ITEMS_CONFIG } from './dto/item.enum';
import { UseItemDto } from './dto/use-item.dto';

class AddInventoryItemDto {
    @IsString()
    itemKey: string;

    @IsNumber()
    @Type(() => Number)
    @Min(1)
    quantity: number;
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
            itemData.itemKey,
            itemData.quantity
        );
    }

    @Post(':id/use-item')
    @UseGuards(AuthGuard)
    async useItem(
        @Param('id', ParseIntPipe) id: number,
        @Body() itemData: UseItemDto
    ) {
        return await this.caveService.useItem(
            id,
            itemData.itemKey,
            itemData.quantity
        );
    }

    @Get('items')
    async getAvailableItems() {
        return ITEMS_CONFIG;
    }
} 