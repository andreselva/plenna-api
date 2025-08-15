import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import EntityModel from "src/EntityModels/entity.model";
import QueryBuilder from "../QueryBuilder/QueryBuilder";
import DataMapper from "../mapper/DataMapper";
import { IEntityFactory } from "../interfaces/IEntityFactory";
import IEntity from "../interfaces/IEntity";
import { AuthContextService } from "src/Auth/auth-context.service";

export default abstract class BaseRepository<T extends EntityModel> {
    constructor(
        protected readonly database: MySQLDatabase,
        protected readonly authContext: AuthContextService
    ) {}

    async save(entity: IEntity) {
        const { sql, values } = QueryBuilder.buildQuery(entity, entity.getTableName(), entity.getPrimaryKey(), entity.getIgnoredProperties());
        return await this.database.execute(sql, values);
    }

    extractToEntity(rows: any, entity: IEntityFactory<T>): T[] {
        return DataMapper.toEntities(rows, entity)
    }
}