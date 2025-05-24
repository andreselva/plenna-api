import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../Users/UserService';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import AuthRepository from './AuthRepository';

@Injectable()
export class AuthService {
    private readonly jwtSecret = process.env.JWT_SECRET;
    private readonly refreshSecret = process.env.JWT_REFRESH_SECRET;

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private repository: AuthRepository
    ) {
        if (!this.jwtSecret || !this.refreshSecret) {
            throw new Error('Segredos JWT (JWT_SECRET, JWT_REFRESH_SECRET) não foram definidos.');
        }
    }

    async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

        const result = await this.repository.saveRefreshToken(Number(user.id), refreshToken);

        if (!result.isSuccess) {
            throw new Error('Falha ao salvar o refresh token.');
        }

        return { accessToken, refreshToken };
    }

    generateToken(user: any): string {
        const payload = { sub: user.id, username: user.username };
        return this.jwtService.sign(payload, { secret: this.jwtSecret, expiresIn: '1h' });
    }

    generateRefreshToken(user: any): string {
        const payload = { sub: user.id, username: user.username };
        return this.jwtService.sign(payload, { secret: this.refreshSecret, expiresIn: '7d' });
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            const decoded = await this.jwtService.verifyAsync<jwt.JwtPayload>(refreshToken, {
                secret: this.refreshSecret,
            });
            if (!decoded || !decoded.sub) throw new UnauthorizedException('Token inválido');

            const isRefreshTokenValid = await this.repository.isRefreshTokenValid(refreshToken, Number(decoded.sub));
            if (!isRefreshTokenValid) throw new UnauthorizedException('Refresh token inválido ou revogado!');

            const user = await this.userService.findUserById(decoded.sub);
            if (!user) throw new UnauthorizedException('Usuário não encontrado');
            
            const newAccessToken = this.generateToken(user);
            const newRefreshToken = this.generateRefreshToken(user);
            await this.repository.updateRefreshToken(newRefreshToken, Number(user.getId()));
            return { accessToken: newAccessToken, newRefreshToken };

        } catch (err) {
            console.error('Falha no refresh do token:', err);
            throw new UnauthorizedException('Refresh token inválido ou expirado.');
        }
    }

    async validateUser(username: string, password: string) {
        const userEntity = await this.userService.findByUsername(username);
        if (
            userEntity &&
            (await bcrypt.compare(password, userEntity.getPassword()))
        ) {
            return { id: userEntity.getId(), username: userEntity.getUserName() };
        }
        return null;
    }

    async getUserFromToken(token: string | undefined): Promise<any> {
        if (!token) {
            throw new UnauthorizedException('Token não fornecido');
        }

        try {
            if (!this.jwtSecret) throw new Error('JWT_SECRET não definido.');
            const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;

            if (!decoded || !decoded.sub) throw new UnauthorizedException('Token inválido');
            const user = await this.userService.findUserById(decoded.sub);
            if (!user) {
                throw new UnauthorizedException('Usuário não encontrado');
            }
            return { id: user.getId(), username: user.getUserName(), name: user.getName() };
        } catch (error) {
            console.error('Erro ao verificar o token:', error);
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }

    async revokeRefreshToken(refreshToken: string) {
        return await this.repository.deleteRefreshTokenByRefreshToken(refreshToken)
    }
}
