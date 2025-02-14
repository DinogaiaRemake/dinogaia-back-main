import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DinoController } from './dino.controller';
import { DinoService } from './dino.service';
import { Dino } from './dino.entity';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { Cave } from './cave.entity';
import { CaveService } from './cave.service';
import { CaveController } from './cave.controller';
import { HuntingService } from './hunting.service';
import { HuntingController } from './hunting.controller';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { Duel } from './duel.entity';
import { DuelService } from './duel.service';
import { DuelController } from './duel.controller';
import { SkyIslandsQuest } from './quest/sky-islands.entity';
import { SkyIslandsQuestService } from './quest/sky-islands.service';
import { SkyIslandsQuestController } from './quest/sky-islands.controller';
import { DragonCaveQuest } from './quest/dragon-cave.entity';
import { DragonCaveQuestService } from './quest/dragon-cave.service';
import { DragonCaveQuestController } from './quest/dragon-cave.controller';
import { CasinoService } from './casino.service';
import { CasinoController } from './casino.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dino, User, Cave, Duel, SkyIslandsQuest, DragonCaveQuest]),
        forwardRef(() => UserModule),
        forwardRef(() => DinoModule)
    ],
    controllers: [
        DinoController,
        CaveController,
        HuntingController,
        JobController,
        ShopController,
        DuelController,
        SkyIslandsQuestController,
        DragonCaveQuestController,
        CasinoController
    ],
    providers: [
        DinoService,
        CaveService,
        HuntingService,
        JobService,
        ShopService,
        DuelService,
        SkyIslandsQuestService,
        DragonCaveQuestService,
        CasinoService
    ],
    exports: [
        DinoService,
        CaveService,
        HuntingService,
        JobService,
        ShopService,
        DuelService,
        SkyIslandsQuestService,
        DragonCaveQuestService,
        CasinoService
    ]
})
export class DinoModule {}
