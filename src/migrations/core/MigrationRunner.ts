import * as mysql from 'mysql2/promise';
import * as crypto from 'crypto';
import { IMigration } from './IMigration';
import { IMigrationStepProcessor } from './IMigrationStepProcessor';
import { MigrationRepository } from './MigrationRepository';

export type MigrationPhase = 'execute' | 'beforeDeploy';

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
    this.pool = mysql.createPool({
      host:               process.env.DB_HOST,
      user:               process.env.DB_USER,
      password:           process.env.DB_PASSWORD,
      database:           process.env.DB_NAME,
      port:               Number(process.env.DB_PORT ?? 3306),
      multipleStatements: true,
      charset:            'utf8mb4',
    });
    this.repository = new MigrationRepository(this.pool);
  }

  // ─────────────────────────────────────────────
  // API pública
  // ─────────────────────────────────────────────

  async runPhase(phase: MigrationPhase): Promise<void> {
    const phaseLabel = phase === 'beforeDeploy' ? 'before-deploy' : 'execute';

    await this.repository.ensureTable();
    const executed = await this.repository.getExecutedVersions();
    const pending  = this.migrations.filter((m) => !executed.has(m.version));

    if (pending.length === 0) {
      console.log(`[Migrations] Nenhuma migration pendente para fase: ${phaseLabel}`);
      return;
    }

    console.log(`[Migrations] ${pending.length} migration(s) pendente(s) — fase: ${phaseLabel}\n`);

    for (const migration of pending) {
      const steps: IMigrationStepProcessor[] =
        phase === 'beforeDeploy'
          ? migration.executeBeforeDeploy()
          : migration.execute();

      if (steps.length === 0) {
        console.log(`  [SKIP] ${migration.version}: ${migration.name} — sem passos para ${phaseLabel}`);
        continue;
      }

      await this.runMigration(migration, steps, phase);
    }
  }

  async getStatus(): Promise<{ migration: IMigration; executed: boolean; record?: any }[]> {
    await this.repository.ensureTable();
    const executed = await this.repository.getExecutedVersions();
    const records  = await this.repository.getAll();
    const recordMap = new Map(records.map((r) => [r.version, r]));

    return this.migrations.map((m) => ({
      migration: m,
      executed:  executed.has(m.version),
      record:    recordMap.get(m.version),
    }));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // ─────────────────────────────────────────────
  // Execução individual
  // ─────────────────────────────────────────────

  private async runMigration(
    migration: IMigration,
    steps: IMigrationStepProcessor[],
    phase: MigrationPhase,
  ): Promise<void> {
    const conn     = await this.pool.getConnection();
    const checksum = this.computeChecksum(migration);
    let   currentStep = 0;

    console.log(`  [START] ${migration.version}: ${migration.name}`);

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
        const step = steps[i];
        console.log(`    Step ${currentStep}/${steps.length}: ${step.label}`);
        await step.process(conn);
      }

      if (phase === 'execute') {
        await this.repository.registerSuccess(
          migration.version,
          migration.name,
          checksum,
          conn,
        );
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
        await this.repository.registerFailure(
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

  // ─────────────────────────────────────────────
  // Utilitários
  // ─────────────────────────────────────────────

  private computeChecksum(migration: IMigration): string {
    const content = `${migration.version}:${migration.name}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
