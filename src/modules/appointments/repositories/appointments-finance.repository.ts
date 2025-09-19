import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import Client from "src/EntityModels/Client";
import Invoice from "src/EntityModels/invoice";
import { Expense } from "src/EntityModels/Expense";

@Injectable()
export class AppointmentsFinanceRepository {
  constructor(private readonly database: MySQLDatabase) {}

  async findClientById(clientId: number): Promise<Client | null> {
    const query = "SELECT * FROM clients WHERE id = ? LIMIT 1";
    const rows = await this.database.select(query, [clientId]);
    const clients = DataMapper.toEntities(rows, Client);
    return clients[0] ?? null;
  }

  async findExpensesWithoutInvoiceDueBetween(
    clientId: number,
    start: string,
    end: string,
  ): Promise<Expense[]> {
    const query =
      "SELECT * FROM expense WHERE clientId = ? AND (idInvoice IS NULL OR idInvoice = 0) AND invoiceDueDate >= ? AND invoiceDueDate <= ?";
    const rows = await this.database.select(query, [clientId, start, end]);
    return DataMapper.toEntities(rows, Expense);
  }

  async findInvoicesDueBetween(clientId: number, start: string, end: string): Promise<Invoice[]> {
    const query = "SELECT * FROM invoices WHERE clientId = ? AND dueDate >= ? AND dueDate <= ?";
    const rows = await this.database.select(query, [clientId, start, end]);
    return DataMapper.toEntities(rows, Invoice);
  }

  async findExpensesByInvoiceId(clientId: number, invoiceId: number): Promise<Expense[]> {
    const query = "SELECT * FROM expense WHERE clientId = ? AND idInvoice = ?";
    const rows = await this.database.select(query, [clientId, invoiceId]);
    return DataMapper.toEntities(rows, Expense);
  }
}
