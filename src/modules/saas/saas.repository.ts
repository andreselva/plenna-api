import DataMapper from "src/Shared/mapper/DataMapper";
import MySQLDatabase from "../Config/Database/MySQLDatabase";
import Client from "src/EntityModels/Client";
import { Injectable } from "@nestjs/common";
import Module from "src/EntityModels/Module";

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
                            m.*
                        FROM
                            modules m
                                JOIN
                            client_modules cm ON cm.moduleId = m.id
                        WHERE
                            clientId = ?
                        GROUP BY m.id;`
        const result = await this.database.select(query, [id])
        return DataMapper.toEntities(result, Module)
    }
}