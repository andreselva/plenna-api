import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

export default class TokenHasher {
    private static readonly saltRounds = 12;

    static async hash(token: string): Promise<string> {
        return bcrypt.hash(token, this.saltRounds);
    }

    static async compare(token: string, hash: string): Promise<boolean> {
        return bcrypt.compare(token, hash);
    }

    static getTokenByPasswordReset() {
        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');
        return { rawToken, tokenHash };
    }
}
