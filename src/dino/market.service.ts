import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketListing } from './market-listing.entity';
import { DinoService } from './dino.service';
import { CaveService } from './cave.service';
import { ITEMS_CONFIG, ItemType } from './dto/item.enum';

@Injectable()
export class MarketService {
    private readonly ALLOWED_TYPES = [
        ItemType.PREY,
        ItemType.SKILL,
        ItemType.HEALING,
        ItemType.WEAPON
    ];

    constructor(
        @InjectRepository(MarketListing)
        private marketListingRepository: Repository<MarketListing>,
        private dinoService: DinoService,
        private caveService: CaveService
    ) {}

    async createListing(
        dinoId: number,
        itemKey: string,
        quantity: number,
        pricePerUnit: number
    ): Promise<MarketListing> {
        const dino = await this.dinoService.findOne(dinoId);
        const cave = await this.caveService.findByDinoId(dinoId);
        const itemConfig = ITEMS_CONFIG[itemKey];

        if (!itemConfig) {
            throw new NotFoundException('Item non trouvé');
        }

        if (!this.ALLOWED_TYPES.includes(itemConfig.type)) {
            throw new BadRequestException('Ce type d\'item ne peut pas être vendu sur le marché');
        }

        if (!cave.inventory[itemKey] || cave.inventory[itemKey].quantity < quantity) {
            throw new BadRequestException('Vous n\'avez pas assez d\'items à vendre');
        }

        if (pricePerUnit <= 0) {
            throw new BadRequestException('Le prix doit être supérieur à 0');
        }

        // Retirer les items de l'inventaire
        await this.caveService.removeFromInventory(cave.id, itemKey, quantity);

        const listing = this.marketListingRepository.create({
            seller: dino,
            itemKey,
            quantity,
            pricePerUnit,
            itemType: itemConfig.type,
            isActive: true
        });

        return await this.marketListingRepository.save(listing);
    }

    async buyListing(listingId: number, buyerId: number, quantity: number): Promise<void> {
        const listing = await this.marketListingRepository.findOne({
            where: { id: listingId, isActive: true },
            relations: ['seller']
        });

        if (!listing) {
            throw new NotFoundException('Annonce non trouvée');
        }

        if (quantity > listing.quantity) {
            throw new BadRequestException('Quantité demandée non disponible');
        }

        const buyer = await this.dinoService.findOne(buyerId);
        const totalCost = quantity * listing.pricePerUnit;

        if (buyer.emeralds < totalCost) {
            throw new BadRequestException('Pas assez d\'émeraudes');
        }

        // Effectuer la transaction
        buyer.emeralds -= totalCost;
        await this.dinoService.update(buyer.id, buyer);

        const seller = await this.dinoService.findOne(listing.seller.id);
        seller.emeralds += totalCost;
        await this.dinoService.update(seller.id, seller);

        // Ajouter les items à l'inventaire de l'acheteur
        await this.caveService.addToInventory(buyer.cave.id, listing.itemKey, quantity);

        // Mettre à jour la quantité de l'annonce
        listing.quantity -= quantity;
        if (listing.quantity === 0) {
            listing.isActive = false;
        }
        await this.marketListingRepository.save(listing);
    }

    async cancelListing(listingId: number, dinoId: number): Promise<void> {
        const listing = await this.marketListingRepository.findOne({
            where: { id: listingId, isActive: true },
            relations: ['seller']
        });

        if (!listing) {
            throw new NotFoundException('Annonce non trouvée');
        }

        if (listing.seller.id !== dinoId) {
            throw new ForbiddenException('Vous ne pouvez pas annuler cette annonce');
        }

        // Rendre les items au vendeur
        const cave = await this.caveService.findByDinoId(dinoId);
        await this.caveService.addToInventory(cave.id, listing.itemKey, listing.quantity);

        listing.isActive = false;
        await this.marketListingRepository.save(listing);
    }

    async getActiveListings(
        type?: ItemType,
        page: number = 1,
        limit: number = 10,
        minPrice?: number,
        maxPrice?: number,
        sortBy: 'price' | 'date' = 'date',
        sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Promise<{ listings: MarketListing[], total: number }> {
        // Sous-requête pour obtenir l'ID de l'annonce la moins chère pour chaque itemKey
        const subQuery = this.marketListingRepository
            .createQueryBuilder('sub')
            .select('MIN(sub.id)', 'id')
            .addSelect('sub.itemKey', 'itemKey')
            .where('sub.isActive = :isActive', { isActive: true })
            .groupBy('sub.itemKey');

        // Requête principale
        const queryBuilder = this.marketListingRepository
            .createQueryBuilder('listing')
            .leftJoinAndSelect('listing.seller', 'seller')
            .where('listing.isActive = :isActive', { isActive: true });

        // Filtrer par type si spécifié
        if (type) {
            queryBuilder.andWhere('listing.itemType = :type', { type });
            subQuery.andWhere('sub.itemType = :type', { type });
        }

        // Filtrer par prix si spécifié
        if (minPrice) {
            queryBuilder.andWhere('listing.pricePerUnit >= :minPrice', { minPrice });
            subQuery.andWhere('sub.pricePerUnit >= :minPrice', { minPrice });
        }
        if (maxPrice) {
            queryBuilder.andWhere('listing.pricePerUnit <= :maxPrice', { maxPrice });
            subQuery.andWhere('sub.pricePerUnit <= :maxPrice', { maxPrice });
        }

        // Obtenir les IDs des annonces les moins chères
        const cheapestListings = await subQuery.getRawMany();
        const cheapestIds = cheapestListings.map(item => item.id);

        // Ajouter le filtre pour ne sélectionner que les annonces les moins chères
        queryBuilder.andWhereInIds(cheapestIds);

        // Appliquer le tri
        if (sortBy === 'price') {
            queryBuilder.orderBy('listing.pricePerUnit', sortOrder);
        } else {
            queryBuilder.orderBy('listing.listedAt', sortOrder);
        }

        // Appliquer la pagination
        const [listings, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        // Enrichir les données avec les informations des items
        const enrichedListings = listings.map(listing => ({
            ...listing,
            itemInfo: ITEMS_CONFIG[listing.itemKey]
        }));

        return { 
            listings: enrichedListings, 
            total: Object.keys(
                listings.reduce((acc, listing) => {
                    acc[listing.itemKey] = true;
                    return acc;
                }, {})
            ).length // Le total est maintenant le nombre d'items uniques
        };
    }

    async getMyListings(dinoId: number): Promise<MarketListing[]> {
        return await this.marketListingRepository.find({
            where: {
                seller: { id: dinoId },
                isActive: true
            },
            relations: ['seller']
        });
    }
} 