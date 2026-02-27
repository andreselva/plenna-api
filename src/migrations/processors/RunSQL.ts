import { PoolConnection } from 'mysql2/promise';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { RunSqlException } from '../exceptions/RunSqlException';

/**
 * Processor que executa um comando SQL.
 * Inspirado em RunSQL.php.
 *
 * Melhoria em relação à v1 da API:
 * - Era um objeto literal { type: 'sql', sql: string }
 * - Agora é uma classe com process() — o Runner não precisa
 *   de if/else para saber o que fazer com este step.
 *
 * Suporta múltiplas statements separadas por ponto-e-vírgula.
 */
export class RunSQL implements IMigrationStepProcessor {
  readonly label: string;

  constructor(private readonly sql: string) {
    // Label resume o início do SQL para logs legíveis
    const preview = sql.trim().replace(/\s+/g, ' ').substring(0, 60);
    this.label = `RunSQL(${preview}${sql.trim().length > 60 ? '...' : ''})`;
  }

  async process(connection: PoolConnection): Promise<void> {
    const statements = this.sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await connection.execute(stmt);
      } catch (err: any) {
        throw new RunSqlException(
          `Erro ao executar SQL: ${err.message}\nStatement: ${stmt}`,
        );
      }
    }
  }
}
