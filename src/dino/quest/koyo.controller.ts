import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { KoyoQuestService } from './koyo.service';

@Controller('quests/koyo')
@UseGuards(AuthGuard)
export class KoyoQuestController {
    constructor(private readonly koyoService: KoyoQuestService) {}

    @Get(':dinoId')
    async getQuest(@Param('dinoId') dinoId: string) {
        return await this.koyoService.getQuestDetails(Number(dinoId));
    }

    @Get(':dinoId/status')
    async getStatus(@Param('dinoId') dinoId: string) {
        await this.koyoService.checkSpawn(Number(dinoId));
        return await this.koyoService.getSpawnStatus(Number(dinoId));
    }

    @Post(':dinoId/catch')
    async catch(@Param('dinoId') dinoId: string) {
        return await this.koyoService.catchKoyo(Number(dinoId));
    }
} 