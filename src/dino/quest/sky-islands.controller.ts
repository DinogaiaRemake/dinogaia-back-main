import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { SkyIslandsQuestService } from './sky-islands.service';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('quests/sky-islands')
@UseGuards(AuthGuard)
export class SkyIslandsQuestController {
    constructor(private skyIslandsQuestService: SkyIslandsQuestService) {}

    @Get(':dinoId')
    async getQuestDetails(@Param('dinoId') dinoId: string) {
        return await this.skyIslandsQuestService.getQuestDetails(Number(dinoId));
    }

    @Get(':dinoId/requirements')
    async checkRequirements(@Param('dinoId') dinoId: string) {
        return await this.skyIslandsQuestService.checkRequirements(Number(dinoId));
    }

    @Post(':dinoId/craft')
    async craftWings(@Param('dinoId') dinoId: string) {
        return await this.skyIslandsQuestService.craftWings(Number(dinoId));
    }
} 