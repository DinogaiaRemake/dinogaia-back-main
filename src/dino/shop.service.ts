import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ItemType, ITEMS_CONFIG, ItemConfig } from './dto/item.enum';
import { DinoService } from './dino.service';
import { CaveService } from './cave.service';

@Injectable()
export class ShopService {
    constructor(
        private dinoService: DinoService,
        private caveService: CaveService
    ) {}

    getItemsByType(type: ItemType): ItemConfig[] {
        return Object.values(ITEMS_CONFIG).filter(item => 
            item.type === type && 
            (item.visibleInShop === undefined || item.visibleInShop === true)
        );
    }

    getAllItems(): ItemConfig[] {
        return Object.values(ITEMS_CONFIG).filter(item => 
            item.visibleInShop === undefined || item.visibleInShop === true
        );
    }

    //buyItem 
    async buyItem(itemKey: string, dinoId: number): Promise<void> {
        // Vérifier si l'item existe
        const item = ITEMS_CONFIG[itemKey];
        if (!item) {
            throw new NotFoundException(`Item ${itemKey} non trouvé dans la boutique`);
        }

        console.log(`Buying item: ${item.name}`);
        
        // Récupérer le dino et sa grotte
        const dino = await this.dinoService.findOne(dinoId);
        const cave = await this.caveService.findByDinoId(dinoId);

        // Vérifier si le dino a assez d'émeraudes
        if (dino.emeralds < item.price) {
            throw new BadRequestException(`Pas assez d'émeraudes. Prix: ${item.price}, Solde: ${dino.emeralds}`);
        }

        // Déduire le prix
        dino.emeralds -= item.price;
        await this.dinoService.update(dinoId, dino);

        // Ajouter l'item à l'inventaire
        await this.caveService.addToInventory(cave.id, itemKey, 1);
    }
} 