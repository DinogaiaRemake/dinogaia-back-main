import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DinoController } from './dino.controller';
import { DinoService } from './dino.service';
import { Dino } from './dino.entity';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { Cave } from './cave.entity';
import { CaveService } from './cave.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dino, User, Cave]),
        UserModule
    ],
    controllers: [DinoController],
    providers: [DinoService, CaveService],
    exports: [DinoService, CaveService]
})
export class DinoModule {}
