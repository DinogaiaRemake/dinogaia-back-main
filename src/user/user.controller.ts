import { Body, Controller, Post, Get, Param, Put, UseGuards, UnauthorizedException, BadRequestException, NotFoundException, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UserController {
    constructor(private userService: UserService, private jwtService: JwtService) {}

    @Post('register')
    async register(@Body() userData: { email: string; password: string; name: string }): Promise<User> {
        if (!/^[a-zA-Z0-9]+$/.test(userData.name)) {
            throw new BadRequestException('You are not allowed to use non alphanumeric characters in your name');
        }
        return this.userService.create(userData);
    }

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }, @Res({ passthrough: true }) response: Response) {
        const user = await this.userService.findOne({ email: loginDto.email });
        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({ id: user.id });
        response.cookie('jwt', token, { httpOnly: true, secure: false });
        return { message: 'Login successful' };
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