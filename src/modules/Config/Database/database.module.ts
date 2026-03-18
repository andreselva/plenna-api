import { Global, Module } from "@nestjs/common";
import MySQLDatabase from "./MySQLDatabase";
import { TransactionContext } from "./transaction-context";

@Global()
@Module({
    imports: [],
    providers: [MySQLDatabase, TransactionContext],
    controllers: [],
    exports: [MySQLDatabase, TransactionContext]

})
export class DatabaseModule { }
