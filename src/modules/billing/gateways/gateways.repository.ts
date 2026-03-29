import { Injectable } from "@nestjs/common";
import { Gateway } from "src/EntityModels/Gateway";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class GatewaysRepository extends BaseRepository<Gateway> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Gateway);
    }
}
