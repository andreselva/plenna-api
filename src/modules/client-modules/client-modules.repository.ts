import { Injectable, Query } from "@nestjs/common";
import { AuthContextService } from "../Auth/auth-context.service";
import MySQLDatabase from "../Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import ClientModules from "src/EntityModels/ClientModules";
import QueryBuilder from "src/Shared/QueryBuilder/QueryBuilder";
import DataMapper from "src/Shared/mapper/DataMapper";
import Module from "src/EntityModels/Module";

@Injectable()
export default class ClientModulesRepository extends BaseRepository<ClientModules> {
    constructor(authContext: AuthContextService, database: MySQLDatabase) {
        super(database, authContext)
    }

    async getModulesByUserId(): Promise<Module[]> {
        const query = `SELECT * FROM modules m
                        JOIN client_modules cm on cm.moduleId = m.id 
                        WHERE cm.userId = ? AND cm.clientId = ?`;
        const result = await this.database.select(query, [4, 1]);
        return DataMapper.toEntities(result, Module);
    }
}