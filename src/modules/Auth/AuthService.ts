import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import AuthRepository, { RefreshTokenMetadata } from './AuthRepository';
import PasswordHasher from 'src/Shared/Utils/Secutiry/PasswordHasher';
import RefreshToken from 'src/EntityModels/RefreshToken';
import { UsersService } from 'src/modules/management/Users/UserService';
import TokenHasher from 'src/Shared/Utils/Secutiry/TokenHasher';

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

    async generateTokens(user: any, metadata: RefreshTokenMetadata = {}): Promise<{ accessToken: string; refreshTokenGenerated: string }> {
        const accessToken = this.generateToken(user);
        const refreshTokenGenerated = this.generateRefreshToken(user);
        const refreshToken = new RefreshToken();
        refreshToken.idUser = Number(user.id);
        refreshToken.refresh_token = await TokenHasher.hash(refreshTokenGenerated);
        const result = await this.repository.saveRefreshToken(refreshToken, metadata);

        if (!result.isSuccess) {
            throw new Error('Falha ao salvar o refresh token.');
        }

        return { accessToken, refreshTokenGenerated };
    }

    generateToken(user: any): string {
        const payload = { sub: user.id, username: user.username, role: user.role, clientId: user.clientId, name: user.name };
        return this.jwtService.sign(payload, { secret: this.jwtSecret, expiresIn: '1h' });
    }

    generateRefreshToken(user: any): string {
        const payload = { sub: user.id, clientId: user.clientId };
        return this.jwtService.sign(payload, { secret: this.refreshSecret, expiresIn: '7d' });
    }

    generateCsrfToken(): string {
        return randomBytes(32).toString('hex');
    }

    async refreshAccessToken(refreshToken: string, metadata: RefreshTokenMetadata = {}) {
        try {
            const decoded = await this.jwtService.verifyAsync<jwt.JwtPayload>(refreshToken, {
                secret: this.refreshSecret,
            });
            if (!decoded || !decoded.sub) throw new UnauthorizedException();

            const storedToken = await this.repository.findRefreshTokenByUserId(Number(decoded.sub));
            if (!storedToken) {
                throw new UnauthorizedException();
            }

            const isRefreshTokenValid = await TokenHasher.compare(refreshToken, storedToken.refresh_token);
            if (!isRefreshTokenValid) {
                await this.repository.deleteRefreshToken(Number(decoded.sub));
                throw new UnauthorizedException();
            }

            await this.repository.updateRefreshTokenMetadata(Number(decoded.sub), metadata);

            const user = await this.userService.findUserById(decoded.sub, decoded.clientId);
            if (!user) throw new UnauthorizedException();

            const newAccessToken = this.generateToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            const refreshTokenModel = new RefreshToken();
            refreshTokenModel.idUser = Number(user.id);
            refreshTokenModel.refresh_token = await TokenHasher.hash(newRefreshToken);
            await this.repository.saveRefreshToken(refreshTokenModel, metadata);

            return { accessToken: newAccessToken, newRefreshToken };

        } catch (err) {
            console.error('Falha no refresh do token:', err);
            throw new UnauthorizedException();
        }
    }

    async validateUser(username: string, password: string) {
        const userEntity = await this.userService.findByUsername(username);
        if (userEntity && (await PasswordHasher.compare(password, userEntity.password))) {
            return { id: userEntity.id, username: userEntity.username, role: userEntity.role, clientId: userEntity.clientId, name: userEntity.name };
        }
        return null;
    }

    async getUserFromToken(token: string | undefined): Promise<any> {
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            if (!this.jwtSecret) throw new UnauthorizedException();

            const decoded = await this.jwtService.verifyAsync<jwt.JwtPayload>(token, { secret: this.jwtSecret });

            if (!decoded || !decoded.sub) {
                throw new UnauthorizedException();
            }

            return {
                id: decoded.sub,
                username: decoded.username,
                role: decoded.role,
                clientId: decoded.clientId,
                name: decoded.name
            };

        } catch (error) {
            console.error('Erro ao verificar o token:', error);
            throw new UnauthorizedException();
        }
    }

    async revokeRefreshToken(refreshToken: string) {
        try {
            const decoded = await this.jwtService.verifyAsync<jwt.JwtPayload>(refreshToken, { secret: this.refreshSecret });
            if (!decoded || !decoded.sub) {
                return;
            }
            await this.repository.deleteRefreshToken(Number(decoded.sub));
        } catch (error) {
            console.warn('Falha ao decodificar refresh token para revogação:', error);
        }
    }
}
