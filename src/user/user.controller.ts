import { Body, Controller, Post, Get, Param, Put, UseGuards, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { DinoService } from '../dino/dino.service';
import { CreateDinoDto } from '../dino/dto/create-dino.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private dinoService: DinoService
    ) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<any> {
        try {
            console.log('Début register - RegisterDto reçu:', registerDto);

            if (!/^[a-zA-Z0-9]+$/.test(registerDto.name)) {
                throw new BadRequestException('Vous ne pouvez pas utiliser de caractères spéciaux dans votre nom');
            }

            // Créer l'utilisateur
            console.log('Création de l\'utilisateur...');
            const user = await this.userService.create({
                email: registerDto.email,
                password: registerDto.password,
                name: registerDto.name
            });
            console.log('Utilisateur créé:', user);

            // Créer le dinosaure
            console.log('Préparation du CreateDinoDto...');
            const createDinoDto = new CreateDinoDto();
            createDinoDto.name = registerDto.dinoName;
            createDinoDto.species = registerDto.dinoSpecies;
            createDinoDto.sex = registerDto.dinoSex;
            console.log('CreateDinoDto préparé:', createDinoDto);

            console.log('Création du dinosaure...');
            const dino = await this.dinoService.create(createDinoDto, user.id);
            console.log('Dinosaure créé:', dino);

            // Générer le token JWT
            const token = this.jwtService.sign({ id: user.id });

            return {
                message: 'Inscription réussie',
                jwt: token,
                user: user,
                dino: dino,
                status: "OK"
            };
        } catch (error) {
            console.error('Erreur dans register:', error);
            throw error;
        }
    }

    @Get()
    @UseGuards(AuthGuard)
    async getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getUser(@Param('id') id: number): Promise<User> {
        const user = await this.userService.findOne({ id });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async updateUser(@Param('id') id: number, @Body() userData: Partial<User>): Promise<User> {
        return this.userService.update(id, userData);
    }
}