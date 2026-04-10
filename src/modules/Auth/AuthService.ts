import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import AuthRepository, { RefreshTokenMetadata } from './AuthRepository';
import PasswordHasher from 'src/Shared/Utils/Secutiry/PasswordHasher';
import RefreshToken from 'src/EntityModels/RefreshToken';
import { UsersService } from 'src/modules/management/Users/UserService';
import TokenHasher from 'src/Shared/Utils/Secutiry/TokenHasher';

type AuthUser = {
    id: number;
    username: string;
    role: string;
    clientId: number;
    name: string;
};

type AccessTokenPayload = {
    sub: number;
    username: string;
    role: string;
    clientId: number;
    name: string;
};

type RefreshTokenPayload = {
    sub: number;
    clientId: number;
};

@Injectable()
export class AuthService {
    private readonly jwtSecret = process.env.JWT_SECRET;
    private readonly refreshSecret = process.env.JWT_REFRESH_SECRET;
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private repository: AuthRepository
    ) {
        if (!this.jwtSecret || !this.refreshSecret) {
            throw new Error('Segredos JWT (JWT_SECRET, JWT_REFRESH_SECRET) não foram definidos.');
        }
    }

    async generateTokens(
        user: AuthUser,
        metadata: RefreshTokenMetadata = {}
    ): Promise<{ accessToken: string; refreshTokenGenerated: string }> {
        const accessToken = this.generateToken(user);
        const refreshTokenGenerated = this.generateRefreshToken(user);

        const refreshToken = new RefreshToken();
        refreshToken.idUser = user.id;
        refreshToken.refresh_token = await TokenHasher.hash(refreshTokenGenerated);

        const result = await this.repository.saveRefreshToken(refreshToken, metadata);

        if (!result.isSuccess) {
            throw new Error('Falha ao salvar o refresh token.');
        }

        return { accessToken, refreshTokenGenerated };
    }

    generateToken(user: AuthUser): string {
        const payload: AccessTokenPayload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            clientId: user.clientId,
            name: user.name,
        };

        return this.jwtService.sign(payload, {
            secret: this.jwtSecret,
            expiresIn: '1h',
        });
    }

    generateRefreshToken(user: AuthUser): string {
        const payload: RefreshTokenPayload = {
            sub: user.id,
            clientId: user.clientId,
        };

        return this.jwtService.sign(payload, {
            secret: this.refreshSecret,
            expiresIn: '7d',
        });
    }

    generateCsrfToken(): string {
        return randomBytes(32).toString('hex');
    }

    async refreshAccessToken(
        refreshToken: string,
        metadata: RefreshTokenMetadata = {}
    ): Promise<{ accessToken: string; newRefreshToken: string }> {
        try {
            const decoded = await this.jwtService.verifyAsync<RefreshTokenPayload>(
                refreshToken,
                {
                    secret: this.refreshSecret,
                }
            );

            if (!decoded?.sub || !decoded?.clientId) {
                throw new UnauthorizedException();
            }

            const userId = decoded.sub;
            const clientId = decoded.clientId;

            const storedToken = await this.repository.findRefreshTokenByUserId(userId);
            if (!storedToken) {
                throw new UnauthorizedException();
            }

            const isRefreshTokenValid = await TokenHasher.compare(
                refreshToken,
                storedToken.refresh_token
            );

            if (!isRefreshTokenValid) {
                await this.repository.deleteRefreshToken(userId);
                throw new UnauthorizedException();
            }

            await this.repository.updateRefreshTokenMetadata(userId, metadata);

            const user = await this.userService.findUserById(userId, clientId);
            if (!user) {
                throw new UnauthorizedException();
            }

            const authUser: AuthUser = {
                id: Number(user.id),
                username: String(user.username),
                role: String(user.role),
                clientId: Number(user.clientId),
                name: String(user.name),
            };

            const newAccessToken = this.generateToken(authUser);
            const newRefreshToken = this.generateRefreshToken(authUser);

            const refreshTokenModel = new RefreshToken();
            refreshTokenModel.idUser = authUser.id;
            refreshTokenModel.refresh_token = await TokenHasher.hash(newRefreshToken);

            await this.repository.saveRefreshToken(refreshTokenModel, metadata);

            return { accessToken: newAccessToken, newRefreshToken };
        } catch (err) {
            this.logger.warn('Falha no refresh do token.');
            throw new UnauthorizedException();
        }
    }

    async validateUser(username: string, password: string): Promise<AuthUser | null> {
        const userEntity = await this.userService.findByUsername(username);

        if (userEntity && (await PasswordHasher.compare(password, userEntity.password))) {
            return {
                id: Number(userEntity.id),
                username: String(userEntity.username),
                role: String(userEntity.role),
                clientId: Number(userEntity.clientId),
                name: String(userEntity.name),
            };
        }

        return null;
    }

    async getUserFromToken(token: string | undefined): Promise<AuthUser> {
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            if (!this.jwtSecret) {
                throw new UnauthorizedException();
            }

            const decoded = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
                secret: this.jwtSecret,
            });

            if (
                !decoded?.sub ||
                !decoded?.username ||
                !decoded?.role ||
                !decoded?.clientId ||
                !decoded?.name
            ) {
                throw new UnauthorizedException();
            }

            return {
                id: Number(decoded.sub),
                username: decoded.username,
                role: decoded.role,
                clientId: decoded.clientId,
                name: decoded.name,
            };
        } catch (error) {
            console.error('Erro ao verificar o token:', error);
            throw new UnauthorizedException();
        }
    }

    async revokeRefreshToken(refreshToken: string): Promise<void> {
        try {
            const decoded = await this.jwtService.verifyAsync<RefreshTokenPayload>(
                refreshToken,
                {
                    secret: this.refreshSecret,
                }
            );

            if (!decoded?.sub) {
                return;
            }

            await this.repository.deleteRefreshToken(decoded.sub);
        } catch (error) {
            console.warn('Falha ao decodificar refresh token para revogação:', error);
        }
    }
}