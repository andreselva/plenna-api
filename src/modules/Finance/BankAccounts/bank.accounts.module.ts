import BankAccountsController from "./BankAccountsController";
import BankAccountsRepository from "./BankAccountsRepository";
import BankAccountsService from "./BankAccountsServices";
import { Module } from "@nestjs/common";
import CreateBankAccount from "./UseCases/CreateBankAccount";
import DeleteBankAccount from "./UseCases/DeleteBankAccount";
import GetBankAccounts from "./UseCases/GetBankAccounts";
import UpdateBankAccount from "./UseCases/UpdateBankAccount";

@Module({
    providers: [BankAccountsService, BankAccountsRepository, CreateBankAccount, DeleteBankAccount, GetBankAccounts, UpdateBankAccount],
    controllers: [BankAccountsController],
    exports: []

})
export class BankAccountModule { }
