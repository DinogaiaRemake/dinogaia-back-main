import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class UserService {
    private readonly uploadsPath = path.join(process.cwd(), 'uploads', 'profiles');

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        // Créer les dossiers nécessaires
        if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
            fs.mkdirSync(path.join(process.cwd(), 'uploads'));
        }
        if (!fs.existsSync(this.uploadsPath)) {
            fs.mkdirSync(this.uploadsPath);
        }
    }

    async create(userData: Partial<User>): Promise<User> {
        if (!userData.password) {
            throw new Error('Password is required');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({ ...userData, password: hashedPassword });
        return this.userRepository.save(user);
    }

    async findOne(condition: FindOptionsWhere<User>): Promise<User> {
        const user = await this.userRepository.findOne({
            where: condition,
            select: ['id', 'email', 'password', 'name', 'role']
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async update(id: number, userData: Partial<User>): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.userRepository.update(id, userData);
        return this.userRepository.findOne({ where: { id } }) as Promise<User>;
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        return user;
    }

    async updateProfilePicture(userId: number, file: Express.Multer.File): Promise<User> {
        console.log('Début updateProfilePicture - Détails du fichier:', {
            originalname: file?.originalname,
            mimetype: file?.mimetype,
            size: file?.size,
            buffer: file?.buffer ? 'Buffer présent' : 'Buffer manquant'
        });
        
        if (!file) {
            console.error('Fichier manquant');
            throw new Error('Aucun fichier n\'a été reçu');
        }

        if (!file.buffer) {
            console.error('Buffer manquant dans le fichier');
            throw new Error('Le contenu du fichier est manquant');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }

        // Supprimer l'ancienne photo si elle existe
        if (user.profilePicture) {
            const oldPath = path.join(process.cwd(), user.profilePicture);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                    console.log('Ancienne photo supprimée:', oldPath);
                } catch (error) {
                    console.error('Erreur lors de la suppression de l\'ancienne photo:', error);
                }
            }
        }

        // Déterminer l'extension du fichier en fonction du type MIME
        let extension = '.jpg';
        if (file.mimetype === 'image/gif') {
            extension = '.gif';
        } else if (file.mimetype === 'image/png') {
            extension = '.png';
        }

        // Générer un nom de fichier unique avec la bonne extension
        const fileName = `profile-${userId}-${Date.now()}${extension}`;
        const filePath = path.join('uploads', 'profiles', fileName);
        const fullPath = path.join(process.cwd(), filePath);

        console.log('Traitement de l\'image...', {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            destination: fullPath,
            bufferLength: file.buffer.length
        });

        try {
            // Vérifier que le buffer est valide
            if (!Buffer.isBuffer(file.buffer)) {
                console.error('Buffer invalide');
                throw new Error('Le fichier reçu n\'est pas un buffer valide');
            }

            // S'assurer que le dossier existe
            if (!fs.existsSync(this.uploadsPath)) {
                console.log('Création du dossier uploads/profiles');
                fs.mkdirSync(this.uploadsPath, { recursive: true });
            }

            // Traitement différent selon le type de fichier
            if (file.mimetype === 'image/gif') {
                // Pour les GIF, sauvegarder directement sans modification
                await fs.promises.writeFile(fullPath, file.buffer);
            } else {
                // Pour les autres images, redimensionner et optimiser
                const format = file.mimetype === 'image/png' ? 'png' : 'jpeg';
                await sharp(file.buffer)
                    .resize(500, 500, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .toFormat(format)
                    .toFile(fullPath);
            }

            console.log('Image traitée avec succès');

            // Mettre à jour le chemin dans la base de données
            user.profilePicture = filePath;
            const savedUser = await this.userRepository.save(user);
            console.log('Chemin de l\'image sauvegardé en base de données:', filePath);
            
            return savedUser;
        } catch (error) {
            console.error('Erreur détaillée lors du traitement de l\'image:', error);
            // Nettoyer le fichier si il a été créé
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
            throw new Error(`Erreur lors du traitement de l'image: ${error.message}`);
        }
    }

    async getProfilePicture(userId: number): Promise<string> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || !user.profilePicture) {
            throw new NotFoundException('Photo de profil non trouvée');
        }
        return user.profilePicture;
    }

    async updateRole(userId: number, newRole: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.role = newRole;
        return this.userRepository.save(user);
    }
} 