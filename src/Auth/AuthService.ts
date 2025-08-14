import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../clients/Users/UserService';
import * as jwt from 'jsonwebtoken';
import AuthRepository from './AuthRepository';
import PasswordHasher from 'src/Shared/Utils/Secutiry/PasswordHasher';
import RefreshToken from 'src/EntityModels/RefreshToken';

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

    async generateTokens(user: any): Promise<{ accessToken: string; refreshTokenGenerated: string }> {
        const accessToken = this.generateToken(user);
        const refreshTokenGenerated = this.generateRefreshToken(user);
        const refreshToken = new RefreshToken();
        refreshToken.idUser = Number(user.id);
        refreshToken.refresh_token = refreshTokenGenerated;
        const result = await this.repository.saveRefreshToken(refreshToken);

        if (!result.isSuccess) {
            throw new Error('Falha ao salvar o refresh token.');
        }

        return { accessToken, refreshTokenGenerated };
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
            if (!decoded || !decoded.sub) throw new UnauthorizedException();

            const isRefreshTokenValid = await this.repository.isRefreshTokenValid(refreshToken, Number(decoded.sub));
            if (!isRefreshTokenValid) throw new UnauthorizedException();

            const user = await this.userService.findUserById(decoded.sub);
            if (!user) throw new UnauthorizedException();
            
            const newAccessToken = this.generateToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            const refreshTokenModel = new RefreshToken();
            refreshTokenModel.idUser = Number(user.id);
            refreshTokenModel.refresh_token = newRefreshToken;
            await this.repository.saveRefreshToken(refreshTokenModel);

            return { accessToken: newAccessToken, newRefreshToken };

        } catch (err) {
            console.error('Falha no refresh do token:', err);
            throw new UnauthorizedException();
        }
    }

    async validateUser(username: string, password: string) {
        const userEntity = await this.userService.findByUsername(username);
        if (userEntity && (await PasswordHasher.compare(password, userEntity.password))) {
            return { id: userEntity.id, username: userEntity.username };
        }
        return null;
    }

    async getUserFromToken(token: string | undefined): Promise<any> {
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            if (!this.jwtSecret) throw new UnauthorizedException();
            const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;

            if (!decoded || !decoded.sub) throw new UnauthorizedException();
            const user = await this.userService.findUserById(decoded.sub);
            if (!user) {
                throw new UnauthorizedException();
            }
            return { id: user.id, username: user.username, name: user.name };
        } catch (error) {
            console.error('Erro ao verificar o token:', error);
            throw new UnauthorizedException();
        }
    }

    async revokeRefreshToken(refreshToken: string) {
        return await this.repository.deleteRefreshTokenByRefreshToken(refreshToken)
    }
}
