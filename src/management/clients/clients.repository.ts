import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Client from "src/EntityModels/Client";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class ClientRepository extends BaseRepository<Client> {
    constructor(database: MySQLDatabase) {
        super(database);
    }

    async saveClient(client: Client) {
        const result = await this.save(client);
        if (result.insertId > 0 && client.id === 0) {
            client.id = result.insertId;
        }
        return client;
    }
}