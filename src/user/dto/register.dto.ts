import { IsNotEmpty, IsEmail, MinLength, IsEnum, IsString } from 'class-validator';
import { DinoSpecies } from '../../dino/dto/create-dino.dto';

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    // Informations du dinosaure
    @IsNotEmpty()
    @IsString()
    dinoName: string;

    @IsNotEmpty()
    @IsEnum(DinoSpecies, {
        message: 'L\'espèce doit être l\'une des suivantes : T-Rex, Velociraptor, Pterodactyl, Megalodon'
    })
    dinoSpecies: DinoSpecies;

    @IsNotEmpty()
    @IsEnum(['male', 'female'])
    dinoSex: string;
} 