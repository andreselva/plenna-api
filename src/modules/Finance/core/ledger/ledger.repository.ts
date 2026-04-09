import { Injectable } from "@nestjs/common";
import { BankAccount } from "src/EntityModels/BankAccount";
import { LedgerEntry } from "src/EntityModels/ledger-entry";
import { LedgerEventProcessing } from "src/EntityModels/LedgerEventProcessing";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import QueryBuilder from "src/Shared/QueryBuilder/QueryBuilder";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class LedgerRepository extends BaseRepository<LedgerEntry> {
 constructor(database: MySQLDatabase, authContext: AuthContextService) {
  super(database, authContext, LedgerEntry);
 }

 async getBankAccountById(accountId: number): Promise<BankAccount> {
  const query = `SELECT type FROM bank_accounts WHERE id = ? AND clientId = ?`;
  const result = await this.database.select(query, [accountId, this.authContext.getClientId()]);
  return DataMapper.toEntities(result, BankAccount)[0];
 }

 async saveLedgerEventProcessing(ledgerEventProcessing: LedgerEventProcessing) {
  const { sql, values } = QueryBuilder.buildQuery(ledgerEventProcessing, ledgerEventProcessing.getTableName(), ledgerEventProcessing.getPrimaryKey());
  await this.database.execute(sql, values);
 }
}