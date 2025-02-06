import { Body, Controller, Post, UnauthorizedException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }, @Res({ passthrough: true }) response: Response) {
        const user = await this.userService.findOne({ email: loginDto.email });
        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({ id: user.id });
        response.cookie('jwt', token, { httpOnly: true, secure: false });
        return { message: 'Login successful', jwt: token, user: user, status: "OK" };
    }
} 