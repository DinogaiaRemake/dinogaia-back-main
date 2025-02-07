import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { PaginationDto } from './dto/pagination.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('topics')
  @UseGuards(AuthGuard)
  async createTopic(@Body() createTopicDto: CreateTopicDto, @Request() req) {
    return this.forumService.createTopic(createTopicDto, req.user);
  }

  @Get('topics')
  async getAllTopics(@Query() pagination: PaginationDto) {
    return this.forumService.getAllTopics(pagination);
  }

  @Get('topics/:id')
  async getTopicById(
    @Param('id') id: number,
    @Query() pagination: PaginationDto
  ) {
    return this.forumService.getTopicById(id, pagination);
  }

  @Post('topics/:id/replies')
  @UseGuards(AuthGuard)
  async createReply(
    @Param('id') topicId: number,
    @Body() createReplyDto: CreateReplyDto,
    @Request() req,
  ) {
    return this.forumService.createReply(topicId, createReplyDto, req.user);
  }

  @Post('topics/:id/like')
  @UseGuards(AuthGuard)
  async likeTopic(@Param('id') id: number) {
    return this.forumService.likeTopic(id);
  }

  @Post('replies/:id/like')
  @UseGuards(AuthGuard)
  async likeReply(@Param('id') id: number) {
    return this.forumService.likeReply(id);
  }

  @Get('search')
  async searchTopics(@Query('keyword') keyword: string) {
    return this.forumService.searchTopics(keyword || '');
  }
} 