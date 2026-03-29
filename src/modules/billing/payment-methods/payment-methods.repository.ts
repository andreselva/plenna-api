import { PaymentMethod } from "src/EntityModels/PaymentMethod";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PaymentMethodsRepository extends BaseRepository<PaymentMethod>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, PaymentMethod);
    }

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        return await this.loadAll();
    }
}
