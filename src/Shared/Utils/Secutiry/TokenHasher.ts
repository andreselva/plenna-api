import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

export default class TokenHasher {
    private static readonly saltRounds = 12;

    static async hash(token: string): Promise<string> {
        return await bcrypt.hash(token, this.saltRounds);
    }

    static async compare(token: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(token, hash);
    }

    static getTokenByPasswordReset() {
        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = this.getTokenHash(rawToken);
        return { rawToken, tokenHash };
    }

    static getTokenHash(token: string) {
       return createHash('sha256').update(token).digest('hex')
    }
}
