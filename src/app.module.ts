import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DinoModule } from './dino/dino.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ 
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'dinogaia',
      database: 'dinogaia_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    DinoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
