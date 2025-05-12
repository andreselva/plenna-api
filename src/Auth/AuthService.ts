import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../Users/UserService';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    private readonly jwtSecret = process.env.JWT_SECRET || 'chave-secreta';

    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) { }

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

    generateToken(user: any): string {
        const payload = { sub: user.id, username: user.username };
        return this.jwtService.sign(payload, { secret: this.jwtSecret });
    }

    async getUserFromToken(token: string): Promise<any> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as {
                sub: string;
                username: string;
            };
            const user = await this.userService.findUserById(decoded.sub);
            if (!user) throw new UnauthorizedException('Usuário não encontrado');
            return { id: user.getId(), username: user.getUserName(), name: user.getName() };
        } catch {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }
}
