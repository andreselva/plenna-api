import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import * as mysql from 'mysql2/promise';

type TransactionStore = {
    connection: mysql.PoolConnection;
};

@Injectable()
export class TransactionContext {
    private readonly storage = new AsyncLocalStorage<TransactionStore>();

    run<T>(connection: mysql.PoolConnection, callback: () => Promise<T>): Promise<T> {
        return this.storage.run({ connection }, callback);
    }

    getConnection(): mysql.PoolConnection | null {
        return this.storage.getStore()?.connection ?? null;
    }

    hasTransaction(): boolean {
        return !!this.getConnection();
    }
}