import { createHash } from "crypto";

export class HasherHelper {
    static sha256(string: string) {
        return createHash('sha256').update(string).digest('hex')
    }
}