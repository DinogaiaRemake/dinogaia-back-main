import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Topic } from './topic.entity';
import { TopicReply } from './topic-reply.entity';
import { User } from '../user/user.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(TopicReply)
    private replyRepository: Repository<TopicReply>,
  ) {}

  async createTopic(createTopicDto: CreateTopicDto, user: User): Promise<Topic> {
    const topic = this.topicRepository.create({
      ...createTopicDto,
      author: user,
    });
    return this.topicRepository.save(topic);
  }

  async getAllTopics(): Promise<Topic[]> {
    return this.topicRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTopicById(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['author', 'replies', 'replies.author'],
    });
    if (!topic) {
      throw new NotFoundException(`Topic #${id} not found`);
    }
    topic.views += 1;
    return this.topicRepository.save(topic);
  }

  async createReply(topicId: number, createReplyDto: CreateReplyDto, user: User): Promise<TopicReply> {
    const topic = await this.topicRepository.findOne({ where: { id: topicId } });
    if (!topic) {
      throw new NotFoundException(`Topic #${topicId} not found`);
    }

    const reply = this.replyRepository.create({
      ...createReplyDto,
      author: user,
      topic,
    });
    return this.replyRepository.save(reply);
  }

  async likeTopic(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic #${id} not found`);
    }
    topic.likes += 1;
    return this.topicRepository.save(topic);
  }

  async likeReply(id: number): Promise<TopicReply> {
    const reply = await this.replyRepository.findOne({ where: { id } });
    if (!reply) {
      throw new NotFoundException(`Reply #${id} not found`);
    }
    reply.likes += 1;
    return this.replyRepository.save(reply);
  }

  async searchTopics(keyword: string): Promise<Topic[]> {
    // Diviser la phrase en mots-clés individuels et supprimer les mots vides
    const keywords = keyword
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 2);

    if (keywords.length === 0) {
      return [];
    }

    // Créer les conditions de recherche pour chaque mot-clé
    const conditions = keywords.map(word => [
      { title: ILike(`%${word}%`) },
      { content: ILike(`%${word}%`) }
    ]).flat();

    // Rechercher les topics
    const topics = await this.topicRepository.find({
      where: conditions,
      relations: ['author'],
    });

    // Calculer le score de pertinence pour chaque topic
    const scoredTopics = topics.map(topic => {
      let score = 0;
      const topicText = `${topic.title} ${topic.content}`.toLowerCase();
      
      // Augmenter le score pour chaque mot-clé trouvé
      keywords.forEach(keyword => {
        // Score plus élevé pour les correspondances dans le titre
        const titleMatches = (topic.title.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
        score += titleMatches * 2;
        
        // Score pour les correspondances dans le contenu
        const contentMatches = (topicText.match(new RegExp(keyword, 'g')) || []).length;
        score += contentMatches;
      });

      return { ...topic, searchScore: score };
    });

    // Filtrer les topics avec au moins une correspondance et trier par score puis par date
    return scoredTopics
      .filter(topic => topic.searchScore > 0)
      .sort((a, b) => {
        if (b.searchScore !== a.searchScore) {
          return b.searchScore - a.searchScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
} 