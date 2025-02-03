import { Controller, Post, Get, Body, Param, UseGuards, Request, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { DuelService } from './duel.service';
import { CreateDuelDto } from './dto/create-duel.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AttackZone } from './duel.entity';

@Controller('duels')
@UseGuards(AuthGuard)
export class DuelController {
    constructor(private readonly duelService: DuelService) {}

    @Post(':dinoId/challenge')
    async createDuel(
        @Request() req,
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Body() createDuelDto: CreateDuelDto
    ) {
        return await this.duelService.createDuel(dinoId, createDuelDto, req.user.id);
    }

    @Post(':dinoId/duels/:duelId/accept')
    async acceptDuel(
        @Request() req,
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Param('duelId', ParseIntPipe) duelId: number,
        @Body() moves: { attacks: AttackZone[], defenses: AttackZone[] }
    ) {
        return await this.duelService.acceptDuel(duelId, dinoId, moves, req.user.id);
    }

    @Post(':dinoId/duels/:duelId/reject')
    async rejectDuel(
        @Request() req,
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Param('duelId', ParseIntPipe) duelId: number
    ) {
        return await this.duelService.rejectDuel(duelId, dinoId, req.user.id);
    }

    @Get(':dinoId/sent')
    async getPendingSentDuels(
        @Request() req,
        @Param('dinoId', ParseIntPipe) dinoId: number
    ) {
        return await this.duelService.getPendingSentDuels(dinoId, req.user.id);
    }

    @Get(':dinoId/received')
    async getPendingReceivedDuels(
        @Request() req,
        @Param('dinoId', ParseIntPipe) dinoId: number
    ) {
        return await this.duelService.getPendingReceivedDuels(dinoId, req.user.id);
    }

    @Get(':dinoId/history')
    async getDuelHistory(
        @Request() req,
        @Param('dinoId', ParseIntPipe) dinoId: number
    ) {
        return await this.duelService.getDuelHistory(dinoId, req.user.id);
    }
} 
