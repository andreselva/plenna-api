import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import EntityModel from "src/EntityModels/entity.model";
import QueryBuilder from "../QueryBuilder/QueryBuilder";
import DataMapper from "../mapper/DataMapper";
import { IEntityFactory } from "../interfaces/IEntityFactory";

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

    extractToEntity(rows: any, entity: IEntityFactory<T>): T[] {
        return DataMapper.toEntities(rows, entity)
    }
}