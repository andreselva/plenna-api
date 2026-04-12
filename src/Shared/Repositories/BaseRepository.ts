import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import EntityModel from "src/EntityModels/entity.model";
import QueryBuilder from "../QueryBuilder/QueryBuilder";
import DataMapper from "../mapper/DataMapper";
import { IEntityFactory } from "../interfaces/IEntityFactory";
import IEntity from "../interfaces/IEntity";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import { HelperFunctions } from "../Utils/HelperFunctions";

export default abstract class BaseRepository<T extends EntityModel> {
    constructor(
        protected readonly database: MySQLDatabase,
        protected readonly authContext: AuthContextService,
        protected readonly entityClass: IEntityFactory<T>
    ) {}

    async save(entity: IEntity, cleanNullables: boolean = false) {
        if ('clientId' in entity && (entity.clientId === null || entity.clientId === undefined || entity.clientId === 0 || entity.clientId === '' || !entity.clientId)) {
            entity.clientId = this.authContext.getClientId();
        }

        if ('clientId' in entity && HelperFunctions.isNullable(entity.clientId)) {
            throw new Error('Invalid clientId.');
        }

        if (cleanNullables) {
            entity = HelperFunctions.cleanNullables(entity);
        }

        const { sql, values } = QueryBuilder.buildQuery(entity, entity.getTableName(), entity.getPrimaryKey(), entity.getIgnoredProperties());
        return await this.database.execute(sql, values);
    }

    async loadById(id: number): Promise<T | null> {
        const proto = this.entityClass.prototype;
        let sql = `SELECT * FROM ${proto.getTableName()} WHERE ${proto.getPrimaryKey()} = ?`;
        const values = [id];

        if ('clientId' in new this.entityClass()) {
            sql += ` AND clientId = ?`;
            values.push(this.authContext.getClientId());
        }

        const rows = await this.database.select(sql, values);
        if (rows.length === 0) {
            return null;
        }
        return DataMapper.toEntities(rows, this.entityClass)[0];
    }

    async loadAll(): Promise<T[]> {
        const proto = this.entityClass.prototype;
        let sql = `SELECT * FROM ${proto.getTableName()}`;
        const values: any[] = [];

        if ('clientId' in new this.entityClass()) {
            sql += ` WHERE clientId = ?`;
            values.push(this.authContext.getClientId());
        }

        const rows = await this.database.select(sql, values);
        return DataMapper.toEntities(rows, this.entityClass);
    }

    extractToEntity(rows: object[]): T[] {
        return DataMapper.toEntities(rows, this.entityClass)
    }
}