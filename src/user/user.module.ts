import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { DinoModule } from '../dino/dino.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'votre_secret_jwt',
            signOptions: { expiresIn: '1h' },
        }),
        forwardRef(() => DinoModule)
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService, JwtModule]
})
export class UserModule {}