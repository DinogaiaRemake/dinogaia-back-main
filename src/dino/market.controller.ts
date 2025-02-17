import { Controller, Post, Get, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe, ParseEnumPipe } from '@nestjs/common';
import { MarketService } from './market.service';
import { AuthGuard } from '../auth/auth.guard';
import { ItemType } from './dto/item.enum';

@Controller('market')
@UseGuards(AuthGuard)
export class MarketController {
    constructor(private readonly marketService: MarketService) {}

    @Post(':dinoId/list')
    async createListing(
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Body() listingData: {
            itemKey: string;
            quantity: number;
            pricePerUnit: number;
        }
    ) {
        return await this.marketService.createListing(
            dinoId,
            listingData.itemKey,
            listingData.quantity,
            listingData.pricePerUnit
        );
    }

    @Post(':dinoId/buy/:listingId')
    async buyListing(
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Param('listingId', ParseIntPipe) listingId: number,
        @Body('quantity', ParseIntPipe) quantity: number
    ) {
        await this.marketService.buyListing(listingId, dinoId, quantity);
        return { message: 'Achat effectué avec succès' };
    }

    @Post(':dinoId/cancel/:listingId')
    async cancelListing(
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Param('listingId', ParseIntPipe) listingId: number
    ) {
        await this.marketService.cancelListing(listingId, dinoId);
        return { message: 'Annonce annulée avec succès' };
    }

    @Get('listings')
    async getActiveListings(
        @Query('type') type?: ItemType,
        @Query('page', new DefaultValuePipe(1)) page: string = '1',
        @Query('limit', new DefaultValuePipe(10)) limit: string = '10',
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('sortBy', new DefaultValuePipe('date')) sortBy: string = 'date',
        @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: string = 'DESC'
    ) {
        return await this.marketService.getActiveListings(
            type,
            parseInt(page),
            parseInt(limit),
            minPrice ? parseInt(minPrice) : undefined,
            maxPrice ? parseInt(maxPrice) : undefined,
            sortBy as 'price' | 'date',
            sortOrder as 'ASC' | 'DESC'
        );
    }

    @Get(':dinoId/my-listings')
    async getMyListings(
        @Param('dinoId', ParseIntPipe) dinoId: number
    ) {
        return await this.marketService.getMyListings(dinoId);
    }
} 