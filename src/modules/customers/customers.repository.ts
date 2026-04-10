import { Customer } from "src/EntityModels/Customer";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import MySQLDatabase from "../Config/Database/MySQLDatabase";
import { AuthContextService } from "../Auth/auth-context.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CustomersRepository extends BaseRepository<Customer> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Customer);
    }
}
