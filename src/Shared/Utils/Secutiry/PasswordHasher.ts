import * as bcrypt from 'bcrypt';

export default class PasswordHasher {
    private static readonly saltRounds = 12;

    static async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    static async compare(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}