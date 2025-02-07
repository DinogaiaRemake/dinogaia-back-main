import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  @MinLength(1)
  content: string;
} 