import * as bcrypt from 'bcryptjs';

export default class PasswordHasher {
    private static readonly saltRounds = 10;

    static async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    static async compare(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}