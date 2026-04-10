import { Injectable } from "@nestjs/common";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import Client from "src/EntityModels/Client";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class ClientRepository extends BaseRepository<Client> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Client);
    }
    
    async saveClient(client: Client) {
        const result = await this.save(client);
        if (result.insertId > 0 && client.id === 0) {
            client.id = result.insertId;
        }
        return client;
    }
}