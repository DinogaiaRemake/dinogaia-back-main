import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CasinoService } from './casino.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('casino')
@UseGuards(AuthGuard)
export class CasinoController {
    constructor(private readonly casinoService: CasinoService) {}

    @Get('games')
    async getAvailableGames() {
        return this.casinoService.getAvailableGames();
    }

    @Post(':dinoId/slot-machine/:machineKey')
    async playSlotMachine(
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Param('machineKey') machineKey: string
    ) {
        return this.casinoService.playSlotMachine(dinoId, machineKey);
    }

    @Post(':dinoId/scratch-ticket/:ticketKey')
    async playScratchTicket(
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Param('ticketKey') ticketKey: string
    ) {
        return this.casinoService.playScratchTicket(dinoId, ticketKey);
    }

    @Get(':dinoId/free-plays')
    async getFreePlays(@Param('dinoId', ParseIntPipe) dinoId: number) {
        return this.casinoService.getFreePlays(dinoId);
    }
} 