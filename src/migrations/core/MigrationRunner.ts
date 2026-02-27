import * as mysql from 'mysql2/promise';
import * as crypto from 'crypto';
import { IMigration } from './IMigration';
import { IMigrationStepProcessor } from './IMigrationStepProcessor';
import { MigrationRepository } from './MigrationRepository';

export type MigrationPhase = 'execute' | 'beforeDeploy';

export interface RunOptions {
  /**
   * Modo dev: sobrescreve o DB_NAME das variáveis de ambiente.
   * Permite testar todas as fases contra um banco local específico.
   * Equivalente ao --devDatabase do MigrationExecuter.php.
   */
  devDatabase?: string;
}

export interface MigrationStatus {
  migration: IMigration;
  database: string;
  executed: boolean;
  record?: any;
}

/**
 * Motor principal de execução de migrations.
 *
 * Melhorias em relação à v1:
 *
 * 1. Sem if/else de tipo nos steps — cada step implementa
 *    IMigrationStepProcessor e o Runner só chama step.process(conn).
 *    Inspirado no padrão IMigrationStepProcessor.php.
 *
 * 2. Operações de banco isoladas em MigrationRepository.
 *    Inspirado em MigrationRepository.php.
 *
 * 3. Registra o step que falhou (failed_step) e a mensagem
 *    de erro (error_msg) para facilitar diagnóstico em produção.
 */
export class MigrationRunner {
  private readonly pool: mysql.Pool;
  private readonly repository: MigrationRepository;

  constructor(private readonly migrations: IMigration[]) {
    this.pool       = this.createPool();
    this.repository = new MigrationRepository(this.pool);
  }

  // ─────────────────────────────────────────────
  // API pública
  // ─────────────────────────────────────────────

  async runPhase(phase: MigrationPhase, options: RunOptions = {}): Promise<void> {
    const phaseLabel = phase === 'beforeDeploy' ? 'before-deploy' : 'execute';

    for (const migration of this.migrations) {

      const databases =
        options.devDatabase
          ? [options.devDatabase]     // sobrescreve se estiver em modo dev
          : migration.getDatabases(); // usa bancos definidos na migration

      for (const database of databases) {

        const pool       = this.createPool(database);
        const repository = new MigrationRepository(pool);

        try {
          await repository.ensureTable();
          const executed = await repository.getExecutedVersions();

          if (executed.has(migration.version)) {
            console.log(`[SKIP] ${migration.version} já executada no banco ${database}`);
            continue;
          }

          const steps =
            phase === 'beforeDeploy'
              ? migration.executeBeforeDeploy()
              : migration.execute();

          if (steps.length === 0) {
            continue;
          }

          console.log(`\n[DB: ${database}]`);
          await this.runMigration(migration, steps, phase, pool, repository);

        } finally {
          await pool.end();
        }
      }
    }
  }

  async getStatus(): Promise<MigrationStatus[]> {
    const result: MigrationStatus[] = [];

    for (const migration of this.migrations) {
      const databases = migration.getDatabases();

      for (const database of databases) {
        const pool       = this.createPool(database);
        const repository = new MigrationRepository(pool);

        try {
          await repository.ensureTable();
          const executed = await repository.getExecutedVersions();
          const records  = await repository.getAll();

          result.push({
            migration,
            database,
            executed: executed.has(migration.version),
            record: records.find(r => r.version === migration.version),
          });

        } finally {
          await pool.end();
        }
      }
    }

    return result;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // ─────────────────────────────────────────────
  // Execução individual
  // ─────────────────────────────────────────────

  private async runMigration(
    migration:  IMigration,
    steps:      IMigrationStepProcessor[],
    phase:      MigrationPhase,
    pool:       mysql.Pool,
    repository: MigrationRepository,
  ): Promise<void> {
    const conn     = await pool.getConnection();
    const checksum = this.computeChecksum(migration);
    let   currentStep = 0;

    console.log(`[START] ${migration.version}: ${migration.name}`);

    try {
      if (migration.isTransactional()) {
        await conn.beginTransaction();
      }

      // ── O Runner não sabe o que cada step faz ──────────────────────────
      // Chama step.process(conn) e o step cuida de si mesmo.
      // Adicionar um novo tipo de step = criar uma classe nova.
      // O Runner nunca precisa ser alterado.
      // ──────────────────────────────────────────────────────────────────
      for (let i = 0; i < steps.length; i++) {
        currentStep = i + 1;
        const step  = steps[i];
        console.log(`    Step ${currentStep}/${steps.length}: ${step.label}`);
        await step.process(conn);
      }

      if (phase === 'execute') {
        await repository.registerSuccess(migration.version, migration.name, checksum, conn);
      }

      if (migration.isTransactional()) {
        await conn.commit();
      }

      console.log(`  [OK]    ${migration.version}: ${migration.name}\n`);

    } catch (err: any) {
      if (migration.isTransactional()) {
        await conn.rollback();
      }

      const errorMessage = err?.message ?? String(err);
      console.error(`  [FAIL]  ${migration.version}: ${migration.name}`);
      console.error(`          Falha no step ${currentStep}: ${errorMessage}\n`);

      if (phase === 'execute') {
        await repository.registerFailure(
          migration.version,
          migration.name,
          checksum,
          currentStep,
          errorMessage,
        );
      }

      throw err;

    } finally {
      conn.release();
    }
  }

  private createPool(database?: string): mysql.Pool {
    return mysql.createPool({
      host:               process.env.DB_HOST,
      user:               process.env.DB_USER,
      password:           process.env.DB_PASSWORD,
      database:           database ?? process.env.DB_NAME,
      port:               Number(process.env.DB_PORT ?? 3306),
      multipleStatements: true,
      charset:            'utf8mb4',
    });
  }

  private computeChecksum(migration: IMigration): string {
    const content = `${migration.version}:${migration.name}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}