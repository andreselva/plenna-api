import MySQLDatabase from "src/Config/Database/MySQLDatabase";

export class MonthlyProgressRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }
}