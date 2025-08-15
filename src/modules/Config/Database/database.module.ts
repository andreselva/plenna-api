import { Global, Module } from "@nestjs/common";
import MySQLDatabase from "./MySQLDatabase";

@Global()
@Module({
    imports: [],
    providers: [MySQLDatabase],
    controllers: [],
    exports: [MySQLDatabase]

})
export class DatabaseModule { }
