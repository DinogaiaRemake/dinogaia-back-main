import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Topic } from './topic.entity';

@Entity()
export class TopicReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  // Relation vers une réponse parente (permet les threads)
  @ManyToOne(() => TopicReply, (reply: TopicReply) => reply.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentReply?: TopicReply;

  // Réponses enfants d’une réponse (threading)
  @OneToMany(() => TopicReply, (reply: TopicReply) => reply.parentReply)
  children?: TopicReply[];

  // Pièces jointes (ex: URLs d’images) encodées sous forme de tableau JSON simple
  @Column({ type: 'simple-json', nullable: true })
  attachments?: string[];

  @ManyToOne(() => User, user => user.topicReplies)
  author: User;

  @ManyToOne(() => Topic, topic => topic.replies)
  topic: Topic;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 