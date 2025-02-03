import { IsNotEmpty, IsEnum, IsNumber, IsString, Min, IsOptional, IsDate } from 'class-validator';

export enum DinoSpecies {
    TREX = 'T-Rex',
    VELOCIRAPTOR = 'Velociraptor',
    PTERODACTYL = 'Pterodactyl',
    MEGALODON = 'Megalodon'
}

export class CreateDinoDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(DinoSpecies, {
        message: 'L\'espèce doit être l\'une des suivantes : T-Rex, Velociraptor, Pterodactyl, Megalodon'
    })
    species: DinoSpecies;

    @IsString()
    @IsOptional()
    clan?: string;

    @IsNotEmpty()
    @IsEnum(['male', 'female'])
    sex: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    weight: number = 100;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    height: number = 100;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    intelligence: number = 1;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    agility: number = 1;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    strength: number = 1;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    endurance: number = 1;

    @IsNotEmpty()
    @IsDate()
    createdAt: Date = new Date();
} 
