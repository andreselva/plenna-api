export default class DatabaseConfig {
    static getConfig() {
        return {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '123456',
            database: process.env.DB_NAME || 'system',
            port: process.env.DB_PORT || 3306
        }
    }
}