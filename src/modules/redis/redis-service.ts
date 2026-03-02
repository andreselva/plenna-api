import Redis from "ioredis";
import { Inject, Injectable } from "@nestjs/common";
import { REDIS_CONNECTION } from "./redis.tokens";

@Injectable()
export default class RedisService {
    constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

    async set(key: string, value: any, timeLimit: number = 0) {
        value = typeof value === 'string' ? value : JSON.stringify(value);
        await this.redis.set(key, value);
        if (timeLimit > 0) {
            await this.redis.expire(key, timeLimit);
        }
    }

    async get<T = any>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);
        if (value == null) {
            return null;
        }
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    async delete(key: string) {
        await this.redis.del(key);
    }

    async getdel(key: string) {
        return await this.redis.getdel(key);
    }

    async incr(key: string): Promise<number> {
        return await this.redis.incr(key);
    }

    async incrby(key: string, increment: number): Promise<number> {
        return await this.redis.incrby(key, increment);
    }
}