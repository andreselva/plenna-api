import * as mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Injectable } from '@nestjs/common';
import DatabaseConfig from './DatabaseConfig';
import { TransactionContext } from './transaction-context';

@Injectable()
export default class MySQLDatabase {
    private pool: mysql.Pool;

    constructor(private readonly transactionContext: TransactionContext) {
        const config = DatabaseConfig.getConfig();
        this.pool = mysql.createPool(config as mysql.PoolOptions);
    }

    private async getConnection(): Promise<mysql.PoolConnection> {
        return this.pool.getConnection();
    }

    private getTransactionConnection(): mysql.PoolConnection | null {
        return this.transactionContext.getConnection();
    }

    public async execute(query: string, params: any[] = []): Promise<ResultSetHeader> {
        const trxConnection = this.getTransactionConnection();

        if (trxConnection) {
            const [results] = await trxConnection.execute<ResultSetHeader>(query, params);
            return results;
        }

        const connection = await this.getConnection();
        try {
            const [results] = await connection.execute<ResultSetHeader>(query, params);
            return results;
        } finally {
            connection.release();
        }
    }

    public async select(query: string, params: any[] = []): Promise<RowDataPacket[]> {
        const trxConnection = this.getTransactionConnection();

        if (trxConnection) {
            const [results] = await trxConnection.execute<RowDataPacket[]>(query, params);
            return results;
        }

        const connection = await this.getConnection();
        try {
            const [results] = await connection.execute<RowDataPacket[]>(query, params);
            return results;
        } finally {
            connection.release();
        }
    }

    public async transaction<T>(callback: () => Promise<T>): Promise<T> {
        const existingConnection = this.getTransactionConnection();

        if (existingConnection) {
            return callback();
        }

        const connection = await this.getConnection();

        try {
            await connection.beginTransaction();

            const result = await this.transactionContext.run(connection, callback);

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}