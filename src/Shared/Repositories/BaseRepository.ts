import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import EntityModel from "src/EntityModels/entity.model";
import QueryBuilder from "../QueryBuilder/QueryBuilder";
import DataMapper from "../mapper/DataMapper";
import { IEntityFactory } from "../interfaces/IEntityFactory";
import IEntity from "../interfaces/IEntity";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import { HelperFunctions } from "../Utils/HelperFunctions";
import { Exception } from "handlebars";

export default abstract class BaseRepository<T extends EntityModel> {
    constructor(
        protected readonly database: MySQLDatabase,
        protected readonly authContext: AuthContextService
    ) {}

    async save(entity: IEntity, cleanNullables: boolean = false) {
        if ('clientId' in entity && (entity.clientId === null || entity.clientId === undefined || entity.clientId === 0 || entity.clientId === '' || !entity.clientId)) {
            entity.clientId = this.authContext.getClientId();
        }

        if ('clientId' in entity && HelperFunctions.isNullable(entity.clientId)) {
            throw new Exception('Invalid clientId.');
        }

        if (cleanNullables) {
            entity = HelperFunctions.cleanNullables(entity);
        }

        const { sql, values } = QueryBuilder.buildQuery(entity, entity.getTableName(), entity.getPrimaryKey(), entity.getIgnoredProperties());
        return await this.database.execute(sql, values);
    }

    extractToEntity(rows: any, entity: IEntityFactory<T>): T[] {
        return DataMapper.toEntities(rows, entity)
    }
}