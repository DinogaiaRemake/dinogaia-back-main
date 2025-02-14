import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DinoService } from './dino.service';
import { CaveService } from './cave.service';
import { SLOT_MACHINES, SCRATCH_TICKETS, SlotMachineConfig, ScratchTicketConfig } from './dto/casino.enum';
import { ITEMS_CONFIG } from './dto/item.enum';

@Injectable()
export class CasinoService {
    constructor(
        private dinoService: DinoService,
        private caveService: CaveService
    ) {}

    async playSlotMachine(dinoId: number, machineKey: string): Promise<{
        message: string;
        combination: string[];
        winnings?: {
            emeralds?: number;
            items?: { key: string; name: string; quantity: number; }[];
        };
    }> {
        const dino = await this.dinoService.findOne(dinoId);
        const machine = SLOT_MACHINES[machineKey];

        if (!machine) {
            throw new NotFoundException('Machine à sous non trouvée');
        }

        if (dino.emeralds < machine.cost) {
            throw new BadRequestException('Pas assez d\'émeraudes');
        }

        // Déduire le coût
        dino.emeralds -= machine.cost;
        await this.dinoService.update(dinoId, dino);


        // Calculer la somme totale des chances
        const totalChance = Object.values(machine.payouts).reduce((sum, payout) => sum + payout.chance, 0);
        
        // Générer un nombre aléatoire entre 0 et la somme totale des chances
        const random = Math.random() * 100;
        
        // Si le nombre est supérieur à la somme totale des chances, c'est une combinaison perdante
        if (random > totalChance) {
            return {
                message: 'Pas de chance ! Essayez encore !',
                combination: this.generateLosingSlotCombination(machine)
            };
        }

        // Sélectionner une combinaison gagnante
        let cumulativeChance = 0;
        let selectedCombination: string[] | null = null;
        let selectedPayout: any = null;

        // Trier les combinaisons par chance décroissante pour éviter les biais
        const sortedPayouts = Object.entries(machine.payouts)
            .sort(([, a], [, b]) => b.chance - a.chance);

        for (const [combination, payout] of sortedPayouts) {
            cumulativeChance += payout.chance;
            if (random <= cumulativeChance && !selectedCombination) {
                selectedCombination = combination.split(',');
                selectedPayout = payout;
                break;
            }
        }

        // Si aucune combinaison n'est sélectionnée (ne devrait pas arriver), retourner une combinaison perdante
        if (!selectedCombination || !selectedPayout) {
            return {
                message: 'Pas de chance ! Essayez encore !',
                combination: this.generateLosingSlotCombination(machine)
            };
        }

        // Appliquer les gains
        if (selectedPayout.emeralds) {
            dino.emeralds += selectedPayout.emeralds;
            await this.dinoService.update(dinoId, dino);
        }

        if (selectedPayout.items) {
            for (const item of selectedPayout.items) {
                await this.caveService.addToInventory(dino.cave.id, item.key, item.quantity);
            }
        }

        // Ajouter les noms des items pour le retour
        const winningsWithNames = {
            emeralds: selectedPayout.emeralds,
            items: selectedPayout.items?.map(item => ({
                ...item,
                name: ITEMS_CONFIG[item.key].name
            }))
        };

        return {
            message: 'Félicitations ! Vous avez gagné !',
            combination: selectedCombination,
            winnings: winningsWithNames
        };
    }

    async playScratchTicket(dinoId: number, ticketKey: string): Promise<{
        message: string;
        symbols?: string[];
        prize?: {
            emeralds?: number;
            items?: { key: string; name: string; quantity: number; }[];
        };
    }> {
        const dino = await this.dinoService.findOne(dinoId);
        const ticket = SCRATCH_TICKETS[ticketKey];

        if (!ticket) {
            throw new NotFoundException('Ticket non trouvé');
        }

        if (dino.emeralds < ticket.cost) {
            throw new BadRequestException('Pas assez d\'émeraudes');
        }

        // Déduire le coût
        dino.emeralds -= ticket.cost;
        await this.dinoService.update(dinoId, dino);

        // Déterminer le prix gagné et la combinaison
        const result = this.selectPrizeAndCombination(ticket);

        if (!result) {
            // Générer une combinaison perdante aléatoire
            const losingSymbols = this.generateLosingScratchCombination(ticket);
            return {
                message: 'Pas de chance ! Essayez encore !',
                symbols: losingSymbols
            };
        }

        // Appliquer les gains
        if (result.prize.emeralds) {
            dino.emeralds += result.prize.emeralds;
            await this.dinoService.update(dinoId, dino);
        }

        if (result.prize.items) {
            for (const item of result.prize.items) {
                await this.caveService.addToInventory(dino.cave.id, item.key, item.quantity);
            }
        }

        // Ajouter les noms des items pour le retour
        const prizeWithNames = {
            ...result.prize,
            items: result.prize.items?.map(item => ({
                ...item,
                name: ITEMS_CONFIG[item.key].name
            }))
        };

        return {
            message: 'Félicitations ! Vous avez gagné !',
            symbols: result.combination,
            prize: prizeWithNames
        };
    }

    private selectPrizeAndCombination(ticket: ScratchTicketConfig): {
        combination: string[];
        prize: {
            emeralds?: number;
            items?: { key: string; quantity: number; }[];
        };
    } | null {
        const random = Math.random() * 100;
        let cumulativeChance = 0;

        for (const prize of ticket.prizes) {
            cumulativeChance += prize.chance;
            if (random < cumulativeChance) {
                return {
                    combination: prize.combination,
                    prize: {
                        emeralds: prize.emeralds,
                        items: prize.items
                    }
                };
            }
        }

        return null;
    }

    private generateLosingSlotCombination(machine: SlotMachineConfig): string[] {
        const symbols = machine.symbols;
        let combination;
        do {
            combination = [];
            for (let i = 0; i < 3; i++) {
                combination.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
        } while (machine.payouts[combination.join(',')]); // Régénérer si c'est une combinaison gagnante

        return combination;
    }

    private generateLosingScratchCombination(ticket: ScratchTicketConfig): string[] {
        const symbols = ticket.symbols;
        let combination;
        do {
            combination = [];
            for (let i = 0; i < 3; i++) {
                combination.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
        } while (ticket.prizes.some(prize => 
            JSON.stringify(prize.combination) === JSON.stringify(combination)
        ));

        return combination;
    }

    getAvailableGames() {
        return {
            slotMachines: SLOT_MACHINES,
            scratchTickets: SCRATCH_TICKETS
        };
    }
} 