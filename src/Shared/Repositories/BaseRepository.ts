import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import EntityModel from "src/EntityModels/entity.model";
import QueryBuilder from "../QueryBuilder/QueryBuilder";

export default abstract class BaseRepository<T extends EntityModel> {
    constructor(
        protected readonly database: MySQLDatabase,
        private readonly tableName: string,
        private readonly primaryKey: string
    ) {}

    async save(entity: T) {
        const { sql, values } = QueryBuilder.buildQuery(entity, this.tableName, this.primaryKey);
        return await this.database.execute(sql, values);
    }
}