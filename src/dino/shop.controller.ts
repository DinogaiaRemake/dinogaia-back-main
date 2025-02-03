import { Controller, Get, Post, Query, Body, Param, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ShopService } from './shop.service';
import { GetShopItemsDto } from './dto/shop.dto';
import { ItemConfig } from './dto/item.enum';
import { AuthGuard } from '../auth/auth.guard';
import { IsString } from 'class-validator';
import { ForbiddenException } from '@nestjs/common';
import { DinoService } from './dino.service';

class BuyItemDto {
    @IsString()
    itemKey: string;
}

@Controller('shop')
@UseGuards(AuthGuard)
export class ShopController {
    constructor(
        private readonly shopService: ShopService,
        private readonly dinoService: DinoService
    ) {}

    @Get()
    getShopItems(@Query() query: GetShopItemsDto): ItemConfig[] {
        return this.shopService.getItemsByType(query.type);
    }

    @Get('all')
    getAllItems(): ItemConfig[] {
        return this.shopService.getAllItems();
    }

    @Post('buy/:dinoId')
    async buyItem(
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Body() buyItemDto: BuyItemDto,
        @Request() req
    ): Promise<void> {
        console.log("User ID from JWT:", req.user.id);
        const dino = await this.dinoService.findOne(dinoId);
        if (dino.userId !== req.user.id) {
            throw new ForbiddenException('Vous n\'êtes pas le propriétaire de ce dinosaure');
        }
        return await this.shopService.buyItem(buyItemDto.itemKey, dinoId);
    }
} 