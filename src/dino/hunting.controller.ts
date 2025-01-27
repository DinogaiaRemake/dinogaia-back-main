import { Controller, Post, Param, UseGuards, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { HuntingService } from './hunting.service';
import { AuthGuard } from '../auth/auth.guard';
import { HuntingZone } from './dto/hunting.dto';

@Controller('hunting')
export class HuntingController {
    constructor(private readonly huntingService: HuntingService) {}

    @Post(':dinoId/:zone')
    @UseGuards(AuthGuard)
    async hunt(
        @Param('dinoId', ParseIntPipe) dinoId: number,
        @Param('zone', new ParseEnumPipe(HuntingZone)) zone: HuntingZone
    ) {
        return await this.huntingService.hunt(dinoId, zone);
    }
} 