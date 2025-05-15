export default class DatabaseConfig {
    static getConfig() {
        console.log("DB_HOST ->", process.env.DB_HOST);

        return {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        }
    }
}