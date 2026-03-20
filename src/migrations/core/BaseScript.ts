import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { IScript } from "./IScript";
import EntityModel from "src/EntityModels/entity.model";

export abstract class BaseScript implements IScript {
  protected readonly connection: PoolConnection;

  constructor(connection: PoolConnection) {
    this.connection = connection;
  }

  abstract execute(): Promise<void>;

  protected async query<T = any>(
    sql: string,
    params: any[] = []
  ): Promise<T[]> {
    const [rows] = await this.connection.query<RowDataPacket[]>(
      sql,
      params
    );

    return rows as T[];
  }

  protected async executeSQL(
    sql: string,
    params: any[] = []
  ): Promise<ResultSetHeader> {
    const [result] = await this.connection.query<ResultSetHeader>(
      sql,
      params
    );

    return result;
  }
}