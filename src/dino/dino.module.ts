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

@Module({
    imports: [
        TypeOrmModule.forFeature([Dino, User, Cave, Duel, SkyIslandsQuest]),
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
        SkyIslandsQuestController
    ],
    providers: [
        DinoService,
        CaveService,
        HuntingService,
        JobService,
        ShopService,
        DuelService,
        SkyIslandsQuestService
    ],
    exports: [
        DinoService,
        CaveService,
        HuntingService,
        JobService,
        ShopService,
        DuelService,
        SkyIslandsQuestService
    ]
})
export class DinoModule {}
