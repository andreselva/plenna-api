import { PoolConnection } from 'mysql2/promise';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { RunSqlException } from '../exceptions/RunSqlException';

/**
 * Processor que executa um comando SQL.
 * Inspirado em RunSQL.php.
 */
export class RunSQL implements IMigrationStepProcessor {
  readonly label: string;

  constructor(private readonly sql: string) {
    const preview = sql.trim().replace(/\s+/g, ' ').substring(0, 60);
    this.label = `RunSQL(${preview}${sql.trim().length > 60 ? '...' : ''})`;
  }

  checksumPayload(): string {
    const normalized = this.sql.trim().replace(/\r\n/g, '\n');
    return `sql:${normalized}`;
  }

  async process(connection: PoolConnection): Promise<void> {
    const sql = this.sql.trim();
    if (!sql) return;

    try {
      await connection.query(sql);
    } catch (err: any) {
      throw new RunSqlException(`Erro ao executar SQL: ${err.message}\nSQL: ${sql}`);
    }
  }
}