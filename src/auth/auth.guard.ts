import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        if (!request.cookies) {
            throw new UnauthorizedException('No cookies present');
        }

        const token = request.cookies['jwt'];
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'votre_secret_jwt'
            });
            request.user = { id: payload.id };
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
} 