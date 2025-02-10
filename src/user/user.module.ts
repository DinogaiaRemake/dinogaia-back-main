import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { DinoModule } from '../dino/dino.module';
import { WhitelistService } from './whitelist.service';
import { memoryStorage } from 'multer';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'votre_secret_jwt',
            signOptions: { expiresIn: '1h' },
        }),
        forwardRef(() => DinoModule),
        MulterModule.register({
            storage: memoryStorage()
        }),
    ],
    controllers: [UserController],
    providers: [UserService, WhitelistService],
    exports: [UserService, JwtModule]
})
export class UserModule {}