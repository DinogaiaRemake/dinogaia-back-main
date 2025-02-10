import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Dino } from '../dino/dino.entity';
import { Topic } from '../forum/topic.entity';
import { TopicReply } from '../forum/topic-reply.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Column()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @Column()
    @IsNotEmpty()
    name: string;
    
    //role
    @Column({ default: 'user' })
    role: string;

    @Column({ nullable: true })
    profilePicture: string;

    @OneToMany(() => Dino, dino => dino.user)
    dinos: Dino[];

    @OneToMany(() => Topic, topic => topic.author)
    topics: Topic[];

    @OneToMany(() => TopicReply, reply => reply.author)
    topicReplies: TopicReply[];
} 