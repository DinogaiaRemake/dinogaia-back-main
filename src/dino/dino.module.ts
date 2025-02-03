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

@Module({
    imports: [
        TypeOrmModule.forFeature([Dino, User, Cave, Duel]),
        forwardRef(() => UserModule),
        forwardRef(() => DinoModule)
    ],
    controllers: [
        DinoController,
        CaveController,
        HuntingController,
        JobController,
        ShopController,
        DuelController
    ],
    providers: [
        DinoService,
        CaveService,
        HuntingService,
        JobService,
        ShopService,
        DuelService
    ],
    exports: [
        DinoService,
        CaveService,
        HuntingService,
        JobService,
        ShopService,
        DuelService
    ]
})
export class DinoModule {}
