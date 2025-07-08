import { IsNotEmpty, MinLength, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  @MinLength(1)
  content: string;

  // Permet de répondre à une réponse spécifique
  @IsOptional()
  @IsNumber()
  parentReplyId?: number;

  // Liste d’URLs d’images ou autres pièces jointes
  @IsOptional()
  @IsArray()
  attachments?: string[];
} 