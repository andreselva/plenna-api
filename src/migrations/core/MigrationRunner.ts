import * as mysql from 'mysql2/promise';
import * as crypto from 'crypto';
import { IMigration } from './IMigration';
import { IMigrationStepProcessor } from './IMigrationStepProcessor';
import { MigrationRepository } from './MigrationRepository';

export type MigrationPhase = 'execute' | 'beforeDeploy';

export interface RunOptions {
  /**
   * Modo dev: sobrescreve os databases configurados em cada migration.
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
 */
export class MigrationRunner {
  constructor(private readonly migrations: IMigration[]) {}

  async runPhase(phase: MigrationPhase, options: RunOptions = {}): Promise<void> {
    const phaseLabel = phase === 'beforeDeploy' ? 'before-deploy' : 'execute';

    const databaseMap = this.groupByDatabase(options.devDatabase);

    for (const [database, migrations] of databaseMap) {
      const pool       = this.createPool(database);
      const repository = new MigrationRepository(pool);

      try {
        await repository.ensureTable();
        const executed = await repository.getExecutedVersions();
        const pending  = migrations.filter((m) => !executed.has(m.version));

        if (pending.length === 0) {
          console.log(`[Migrations] Nenhuma migration pendente em ${database} — fase: ${phaseLabel}`);
          continue;
        }

        console.log(`[Migrations] ${pending.length} migration(s) pendente(s) em ${database} — fase: ${phaseLabel}\n`);

        for (const migration of pending) {
          const steps: IMigrationStepProcessor[] =
            phase === 'beforeDeploy'
              ? migration.executeBeforeDeploy()
              : migration.execute();

          if (steps.length === 0) {
            console.log(`  [SKIP] ${migration.version}: ${migration.name} — sem passos para ${phaseLabel}`);
            continue;
          }

          console.log(`\n[DB: ${database}]`);
          await this.runMigration(migration, steps, phase, pool, repository);
        }

      } finally {
        await pool.end();
      }
    }
  }

  async getStatus(): Promise<MigrationStatus[]> {
    const result: MigrationStatus[] = [];
    const databaseMap = this.groupByDatabase();

    for (const [database, migrations] of databaseMap) {
      const pool       = this.createPool(database);
      const repository = new MigrationRepository(pool);

      try {
        await repository.ensureTable();
        const executed = await repository.getExecutedVersions();
        const records  = await repository.getAll();

        for (const migration of migrations) {
          result.push({
            migration,
            database,
            executed: executed.has(migration.version),
            record:   records.find((r) => r.version === migration.version),
          });
        }

      } finally {
        await pool.end();
      }
    }

    return result;
  }

  async close(): Promise<void> {
  }

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

    console.log(`  [START] ${migration.version}: ${migration.name}`);

    try {
      if (migration.isTransactional()) {
        await conn.beginTransaction();
      }

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

  private groupByDatabase(devDatabase?: string): Map<string, IMigration[]> {
    const map = new Map<string, IMigration[]>();

    for (const migration of this.migrations) {
      const databases = devDatabase ? [devDatabase] : migration.getDatabases();

      for (const db of databases) {
        if (!map.has(db)) map.set(db, []);
        map.get(db)!.push(migration);
      }
    }

    return map;
  }

  private createPool(database: string): mysql.Pool {
    return mysql.createPool({
      host:               process.env.DB_HOST,
      user:               process.env.DB_USER,
      password:           process.env.DB_PASSWORD,
      database,
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