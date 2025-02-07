import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { Topic } from './topic.entity';
import { TopicReply } from './topic-reply.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic, TopicReply]),
    AuthModule
  ],
  controllers: [ForumController],
  providers: [ForumService],
})
export class ForumModule {} 