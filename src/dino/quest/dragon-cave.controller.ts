import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { DragonCaveQuestService } from './dragon-cave.service';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('quests/dragon-cave')
@UseGuards(AuthGuard)
export class DragonCaveQuestController {
    constructor(private dragonCaveQuestService: DragonCaveQuestService) {}

    @Get(':dinoId')
    async getQuestDetails(@Param('dinoId') dinoId: string) {
        return await this.dragonCaveQuestService.getQuestDetails(Number(dinoId));
    }

    @Get(':dinoId/requirements')
    async checkRequirements(@Param('dinoId') dinoId: string) {
        return await this.dragonCaveQuestService.checkRequirements(Number(dinoId));
    }

    @Post(':dinoId/use-key')
    async useKey(@Param('dinoId') dinoId: string) {
        return await this.dragonCaveQuestService.useKey(Number(dinoId));
    }
} 