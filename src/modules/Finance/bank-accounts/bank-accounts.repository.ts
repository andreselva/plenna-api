import { Injectable } from "@nestjs/common";
import { BankAccount } from "src/EntityModels/BankAccount";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class BankAccountsRepository extends BaseRepository<BankAccount> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }
}