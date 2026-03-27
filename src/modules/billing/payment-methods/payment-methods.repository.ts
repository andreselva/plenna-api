import { PaymentMethod } from "src/EntityModels/PaymentMethod";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

export class PaymentMethodsRepository extends BaseRepository<PaymentMethod>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        return await this.loadAll(PaymentMethod);
    }
}