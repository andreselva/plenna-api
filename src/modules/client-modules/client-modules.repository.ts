import { Injectable, Query } from "@nestjs/common";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "../Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import ClientModules from "src/EntityModels/ClientModules";
import DataMapper from "src/Shared/mapper/DataMapper";
import Module from "src/EntityModels/Module";
import { Roles } from "src/common/decorators/roles.decoratos";
import { Role } from "src/enum/role.enum";

@Injectable()
export default class ClientModulesRepository extends BaseRepository<ClientModules> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, ClientModules)
    }

    async getModulesByUserId(): Promise<Module[]> {
        const query = `SELECT * FROM modules m
                        JOIN user_modules um on um.moduleId = m.id 
                        WHERE um.userId = ? AND um.clientId = ? ORDER by m.id`;
        const result = await this.database.select(query, [this.authContext.getUserId(), this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Module);
    }

    @Roles(Role.SUPER_ADMIN)
    async getModuleTreeForSuperAdmin(): Promise<Module[]> {
        const query = `SELECT * FROM modules m`;
        const result = await this.database.select(query);
        return DataMapper.toEntities(result, Module);
    }
}