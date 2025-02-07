import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsNotEmpty()
  @MinLength(10)
  content: string;
} 