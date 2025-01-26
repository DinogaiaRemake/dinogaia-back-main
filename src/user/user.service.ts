import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(userData: Partial<User>): Promise<User> {
        if (!userData.password) {
            throw new Error('Password is required');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({ ...userData, password: hashedPassword });
        return this.userRepository.save(user);
    }

    async findOne(condition: Partial<User>): Promise<User> { //retourne un user sans le password
        const user = await this.userRepository.findOne({ where: condition });
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
} 