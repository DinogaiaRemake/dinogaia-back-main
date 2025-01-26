import { PartialType } from '@nestjs/mapped-types';
import { CreateDinoDto } from './create-dino.dto';

export class UpdateDinoDto extends PartialType(CreateDinoDto) {} 