import { Injectable } from "@nestjs/common";
import MySQLDatabase from "../Config/Database/MySQLDatabase";
import { AuthContextService } from "../Auth/auth-context.service";
import DataMapper from "src/Shared/mapper/DataMapper";
import User from "src/EntityModels/User";
import { Expense } from "src/EntityModels/Expense";
import Invoice from "src/EntityModels/invoice";

@Injectable()
export default class AppointmentsRepository {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService
    ) {}

    async loadUsers() {
        const query = "SELECT email FROM user WHERE clientId = ?";
        const result = await this.database.select(query, [this.authContext.getClientId()]);
        return DataMapper.toEntities(result, User);
    }


  async loadExpenses(clientId: number, start: string, end: string): Promise<Expense[]> {
    const query = `SELECT * FROM expense WHERE clientId = ? AND invoiceDueDate >= ? AND invoiceDueDate <= ? AND status = 'pending'`;
    const rows = await this.database.select(query, [clientId, start, end]);
    return DataMapper.toEntities(rows, Expense).map((expense) => Expense.fromEntity(expense));
  }

  async loadInvoices(clientId: number, start: string, end: string): Promise<Invoice[]> {
    const query = `SELECT * FROM invoices WHERE clientId = ? AND dueDate >= ? AND dueDate <= ? AND status = 'pending'`;
    const rows = await this.database.select(query, [clientId, start, end]);
    return DataMapper.toEntities(rows, Invoice).map((invoice) => Object.assign(new Invoice(), invoice));
  }

  async loadExpensesByInvoice(clientId: number, invoiceId: number): Promise<Expense[]> {
    const query = 'SELECT * FROM expense WHERE clientId = ? AND idInvoice = ?';
    const rows = await this.database.select(query, [clientId, invoiceId]);
    return DataMapper.toEntities(rows, Expense).map((expense) => Expense.fromEntity(expense));
  }
}