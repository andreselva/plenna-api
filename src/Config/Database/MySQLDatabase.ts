import * as mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import DatabaseConfig from './DatabaseConfig';

export default class MySQLDatabase {
    private pool: mysql.Pool;

    constructor() {
        const config = DatabaseConfig.getConfig();
        this.pool = mysql.createPool(config as mysql.PoolOptions);
    }

    private async getConnection(): Promise<mysql.PoolConnection> {
        return this.pool.getConnection();
    }

    public async execute(query: string, params: any[] = []): Promise<ResultSetHeader> {
        const connection = await this.getConnection();
        try {
            console.log('Tentou executar!');
            const [results] = await connection.execute<ResultSetHeader>(query, params);
            return results;
        } finally {
            connection.release();
        }
    }

    public async select(query: string, params: any[] = []): Promise<RowDataPacket[]> {
        const connection = await this.getConnection();
        try {
            const [results] = await connection.execute<RowDataPacket[]>(query, params);
            return results;
        } finally {
            connection.release();
        }
    }
}