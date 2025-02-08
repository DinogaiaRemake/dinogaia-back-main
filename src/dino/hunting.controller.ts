import { Controller, Post, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { HuntingService } from './hunting.service';
import { AuthGuard } from '../auth/auth.guard';
import { HuntingZone } from './dto/hunting.dto';
import { HuntingResponse } from './dto/hunting-result.dto';

class HuntDto {
    dinoId: number;
    zone: HuntingZone;
    weaponKey?: string;
}

class RaidDto {
    attackerDinoId: number;
}

@Controller('hunting')
export class HuntingController {
    constructor(private readonly huntingService: HuntingService) {}

    @Post()
    @UseGuards(AuthGuard)
    async hunt(
        @Body('dinoId', ParseIntPipe) dinoId: number,
        @Body('zone') zone: HuntingZone,
        @Body('weaponKey') weaponKey?: string
    ): Promise<HuntingResponse> {
        return await this.huntingService.hunt(dinoId, zone, weaponKey);
    }

    @Post('raid')
    @UseGuards(AuthGuard)
    async raid(
        @Body('attackerDinoId', ParseIntPipe) attackerDinoId: number
    ) {
        return await this.huntingService.raid(attackerDinoId);
    }
} 