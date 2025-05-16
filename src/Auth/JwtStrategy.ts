import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    const token = req?.cookies?.['access_token'] || null;
                    console.log('Token extraído do cookie:', token);
                    return token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'chave-secreta',
        });
    }

    validate(payload: any) {
        console.log("Validando payload!");
        return { userId: payload.sub, username: payload.username };
    }
}
