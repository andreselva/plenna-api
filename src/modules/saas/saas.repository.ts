import DataMapper from "src/Shared/mapper/DataMapper";
import MySQLDatabase from "../Config/Database/MySQLDatabase";
import Client from "src/EntityModels/Client";
import { Injectable } from "@nestjs/common";
import Module from "src/EntityModels/Module";
import QueryBuilder from "src/Shared/QueryBuilder/QueryBuilder";
import { Role } from "src/enum/role.enum";
import User from "src/EntityModels/User";
import ClientModules from "src/EntityModels/ClientModules";
import UserModules from "src/EntityModels/UserModules";

@Injectable()
export default class SaasRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) {}

    async getTenants(): Promise<Client[]> {
        const query = `SELECT * FROM clients WHERE isSystem = 0`;
        const result = await this.database.select(query);
        return DataMapper.toEntities(result, Client);
    }

    async getTenant(id: number): Promise<Client> {
        const query = `SELECT * FROM clients WHERE id = ?`;
        const result = await this.database.select(query, [id]);
        return DataMapper.toEntities(result, Client)[0];
    }

    async getTenantModules(id: number): Promise<Module[]> {
        const query = `SELECT
                            m.*,
                            (cm.clientId IS NOT NULL) AS hasAccess
                        FROM modules m
                            LEFT JOIN client_modules cm ON cm.moduleId = m.id AND cm.clientId = ?;`
        const result = await this.database.select(query, [id])
        return DataMapper.toEntities(result, Module)
    }

    async disableModules(clientId: number, moduleIds: number[]) {
        const placeholders = QueryBuilder.getPlaceholders(moduleIds);
        const params = [...moduleIds, clientId];
        const query = `DELETE FROM client_modules WHERE moduleId IN (${placeholders}) AND clientId = ?`;
        await this.database.execute(query, params);
        const query2 = `DELETE FROM user_modules WHERE moduleId IN (${placeholders}) AND clientId = ?`;
        await this.database.execute(query2, params);
    }
    
    async getSubmodules(moduleId: number): Promise<Module[]>  {
        const query = `SELECT * FROM modules m WHERE m.parentId = ?`;
        const result = await this.database.select(query, [moduleId]);
        return DataMapper.toEntities(result, Module);
    }

    async getUsersAdminFromClientId(clientId: number): Promise<User[]> {
        const query = `SELECT * FROM user WHERE clientId = ? AND role = ?`;
        const result = await this.database.select(query, [clientId, Role.ADMIN]);
        return DataMapper.toEntities(result, User);
    }

    async saveClientModule(clientModule: ClientModules) {
        const { sql, values } = QueryBuilder.buildQuery(clientModule, clientModule.getTableName(), clientModule.getPrimaryKey(), clientModule.getIgnoredProperties());
        await this.database.execute(sql, values);
    }

    async saveUserAdminModule(userModule: UserModules) {
        const { sql, values } = QueryBuilder.buildQuery(userModule, userModule.getTableName(), userModule.getPrimaryKey(), userModule.getIgnoredProperties())
        await this.database.execute(sql, values);
    }

}