export default class DatabaseConfig {
    static getConfig() {
        return {
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'system',
            port: 3306
        }
    }
}