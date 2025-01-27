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

@Module({
    imports: [
        TypeOrmModule.forFeature([Dino, User, Cave]),
        UserModule,
        forwardRef(() => DinoModule)
    ],
    controllers: [DinoController, CaveController, HuntingController, JobController],
    providers: [DinoService, CaveService, HuntingService, JobService],
    exports: [DinoService, CaveService, HuntingService, JobService]
})
export class DinoModule {}
