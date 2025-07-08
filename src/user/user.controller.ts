import { Body, Controller, Post, Get, Param, Put, UseGuards, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException, UseInterceptors, UploadedFile, Res, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { DinoService } from '../dino/dino.service';
import { CreateDinoDto } from '../dino/dto/create-dino.dto';
import { JwtService } from '@nestjs/jwt';
import { WhitelistService } from './whitelist.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { memoryStorage } from 'multer';

@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private dinoService: DinoService,
        private whitelistService: WhitelistService
    ) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<any> {
        try {
            console.log('Début register - RegisterDto reçu:', registerDto);

            // Vérifier si l'email est dans la whitelist
            const isWhitelisted = await this.whitelistService.isEmailWhitelisted(registerDto.email);
            if (!isWhitelisted) {
                throw new ForbiddenException('Votre email n\'est pas autorisé à s\'inscrire. Veuillez contacter l\'administrateur.');
            }

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

    // Changer le rôle d’un utilisateur (admin uniquement)
    @Put(':id/role')
    @UseGuards(AuthGuard)
    async updateUserRole(
        @Param('id') id: number,
        @Body('role') role: string,
        @Request() req,
    ): Promise<User> {
        const requester = await this.userService.findOne({ id: req.user.id });

        if (requester.role === 'admin') {
            // Admin peut tout faire
            return this.userService.updateRole(+id, role);
        }

        if (requester.role === 'moderator') {
            // Modérateur ne peut que bannir les utilisateurs simples
            if (role !== 'banned') {
                throw new ForbiddenException('Les modérateurs ne peuvent que bannir');
            }
            const target = await this.userService.findOne({ id: +id });
            if (target.role !== 'user') {
                throw new ForbiddenException('Impossible de bannir cet utilisateur');
            }
            return this.userService.updateRole(+id, 'banned');
        }

        throw new ForbiddenException('Action non autorisée');
    }

    @Post(':id/profile-picture')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 2MB
            },
            fileFilter: (req, file, callback) => {
                console.log('FileFilter - Fichier reçu:', {
                    originalname: file?.originalname,
                    mimetype: file?.mimetype,
                    fieldname: file?.fieldname
                });
                
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return callback(new Error('Seuls les fichiers image sont autorisés!'), false);
                }
                if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
                    return callback(new Error('Type de fichier non valide'), false);
                }
                callback(null, true);
            },
        })
    )
    async uploadProfilePicture(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        console.log('Début de l\'upload - Headers:', {
            contentType: file?.mimetype,
            fileName: file?.originalname,
            fieldName: file?.fieldname,
            size: file?.size
        });
        
        if (!file) {
            console.log('Aucun fichier dans la requête');
            throw new BadRequestException('Aucun fichier n\'a été envoyé');
        }

        try {
            const user = await this.userService.updateProfilePicture(id, file);
            console.log('Upload réussi pour l\'utilisateur:', id);
            return {
                message: 'Photo de profil mise à jour avec succès',
                profilePicture: user.profilePicture
            };
        } catch (error) {
            console.error('Erreur détaillée lors de l\'upload:', error);
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id/profile-picture')
    async getProfilePicture(
        @Param('id') id: number,
        @Res() res: Response
    ) {
        const filePath = await this.userService.getProfilePicture(id);
        return res.sendFile(path.resolve(filePath));
    }
}