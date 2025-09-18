import * as bcrypt from 'bcryptjs';

export default class TokenHasher {
    private static readonly saltRounds = 12;

    static async hash(token: string): Promise<string> {
        return bcrypt.hash(token, this.saltRounds);
    }

    static async compare(token: string, hash: string): Promise<boolean> {
        return bcrypt.compare(token, hash);
    }
}
