import * as mysql from 'mysql2/promise';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { IMigration } from './IMigration';
import { IMigrationStepProcessor } from './IMigrationStepProcessor';
import { MigrationRepository } from './MigrationRepository';

export type MigrationPhase = 'execute' | 'beforeDeploy';

export interface RunOptions {
}

export interface DiscoveredMigration {
  version: string;
  className: string;
  migration: IMigration;
}

export interface MigrationStatus {
  version: string;
  name: string;
  database: string;
  executed: boolean;
  record?: any;
}

export class MigrationRunner {
  private readonly migrations: DiscoveredMigration[];

  constructor(migrations?: DiscoveredMigration[]) {
    this.migrations = migrations ?? this.discoverMigrationsFromFilesystem();
    this.validateMigrations();
  }

  async runPhase(phase: MigrationPhase, _options: RunOptions = {}): Promise<void> {
    const phaseLabel = phase === 'beforeDeploy' ? 'before-deploy' : 'execute';
    const databaseMap = this.groupByDatabase();

    for (const [database, migrations] of databaseMap) {
      const pool = this.createPool(database);
      const repository = new MigrationRepository(pool);

      try {
        await repository.ensureTable();
        const executed = await repository.getExecutedVersions();
        const pending = migrations.filter((m) => !executed.has(m.version));

        if (pending.length === 0) {
          console.log(`[Migrations] Nenhuma migration pendente em ${database} — fase: ${phaseLabel}`);
          continue;
        }

        console.log(`[Migrations] ${pending.length} migration(s) pendente(s) em ${database} — fase: ${phaseLabel}\n`);

        for (const entry of pending) {
          const steps: IMigrationStepProcessor[] =
            phase === 'beforeDeploy'
              ? entry.migration.executeBeforeDeploy()
              : entry.migration.execute();

          if (steps.length === 0) {
            console.log(`  [SKIP] ${entry.version}: ${entry.migration.name} — sem passos para ${phaseLabel}`);
            continue;
          }

          console.log(`\n[DB: ${database}]`);
          await this.runMigration(entry, steps, phase, pool, repository);
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
      const pool = this.createPool(database);
      const repository = new MigrationRepository(pool);

      try {
        await repository.ensureTable();
        const executed = await repository.getExecutedVersions();
        const records = await repository.getAll();

        for (const entry of migrations) {
          result.push({
            version: entry.version,
            name: entry.migration.name,
            database,
            executed: executed.has(entry.version),
            record: records.find((r) => r.version === entry.version),
          });
        }
      } finally {
        await pool.end();
      }
    }

    return result;
  }

  async close(): Promise<void> {}

  private async runMigration(
    entry: DiscoveredMigration,
    steps: IMigrationStepProcessor[],
    phase: MigrationPhase,
    pool: mysql.Pool,
    repository: MigrationRepository,
  ): Promise<void> {
    const conn = await pool.getConnection();
    const checksum = this.computeChecksum(entry);
    let currentStep = 0;

    console.log(`  [START] ${entry.version}: ${entry.migration.name}`);

    try {
      if (entry.migration.isTransactional()) {
        await conn.beginTransaction();
      }

      for (let i = 0; i < steps.length; i++) {
        currentStep = i + 1;
        const step = steps[i];
        console.log(`    Step ${currentStep}/${steps.length}: ${step.label}`);
        await step.process(conn);
      }

      if (phase === 'execute') {
        await repository.registerSuccess(entry.version, entry.migration.name, checksum, conn);
      }

      if (entry.migration.isTransactional()) {
        await conn.commit();
      }

      console.log(`  [OK]    ${entry.version}: ${entry.migration.name}\n`);
    } catch (err: any) {
      if (entry.migration.isTransactional()) {
        await conn.rollback();
      }

      const errorMessage = err?.message ?? String(err);
      console.error(`  [FAIL]  ${entry.version}: ${entry.migration.name}`);
      console.error(`          Falha no step ${currentStep}: ${errorMessage}\n`);

      if (phase === 'execute') {
        await repository.registerFailure(
          entry.version,
          entry.migration.name,
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

  private discoverMigrationsFromFilesystem(): DiscoveredMigration[] {
    const versionsDir = this.resolveVersionsDir();

    const files = fs
      .readdirSync(versionsDir)
      .filter((f) => (f.endsWith('.ts') || f.endsWith('.js')) && !f.endsWith('.d.ts'))
      .sort();

    const discovered: DiscoveredMigration[] = [];

    for (const file of files) {
      const fullPath = path.join(versionsDir, file);
      const mod = require(fullPath);

      for (const exported of Object.values(mod)) {
        if (typeof exported !== 'function') continue;

        const className = (exported as any).name as string | undefined;
        if (!className) continue;

        const version = this.extractVersionFromClassName(className);
        if (!version) continue;

        const instance = new (exported as any)() as IMigration;

        if (typeof instance.execute !== 'function') continue;
        if (typeof instance.executeBeforeDeploy !== 'function') continue;
        if (typeof instance.getDatabases !== 'function') continue;
        if (typeof instance.isTransactional !== 'function') continue;

        discovered.push({ version, className, migration: instance });
      }
    }

    discovered.sort((a, b) => a.version.localeCompare(b.version));
    return discovered;
  }

  private resolveVersionsDir(): string {
    const candidates = [
      path.resolve(__dirname, '../versions'),
      path.resolve(__dirname, '../../src/migrations/versions'),
      path.resolve(process.cwd(), 'src/migrations/versions'),
      path.resolve(process.cwd(), 'dist/migrations/versions'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
    }

    throw new Error(
      `[Migrations] Não foi possível localizar a pasta migrations/versions.\n` +
        `Tentativas:\n - ${candidates.join('\n - ')}`,
    );
  }

  private extractVersionFromClassName(className: string): string | null {
    const match = className.match(/^Migration(\d{8}_\d{2})_/);
    return match ? match[1] : null;
  }

  private validateMigrations(): void {
    const versionRegex = /^\d{8}_\d{2}$/;
    const seen = new Set<string>();

    for (const m of this.migrations) {
      if (!versionRegex.test(m.version)) {
        throw new Error(
          `[Migrations] Version inválida: "${m.version}". Esperado YYYYMMDD_XX. Classe: ${m.className}`,
        );
      }
      if (seen.has(m.version)) {
        throw new Error(`[Migrations] Versão duplicada descoberta: "${m.version}". Classe: ${m.className}`);
      }
      seen.add(m.version);

      if (!m.migration?.name) {
        throw new Error(`[Migrations] Migration sem "name". Classe: ${m.className}`);
      }
    }
  }

  private groupByDatabase(): Map<string, DiscoveredMigration[]> {
    const map = new Map<string, DiscoveredMigration[]>();

    for (const entry of this.migrations) {
      const databases = entry.migration.getDatabases();

      for (const db of databases) {
        if (!map.has(db)) map.set(db, []);
        map.get(db)!.push(entry);
      }
    }

    return map;
  }

  private createPool(database: string): mysql.Pool {
    return mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database,
      port: Number(process.env.DB_PORT ?? 3306),
      multipleStatements: true,
      charset: 'utf8mb4',
    });
  }

  private computeChecksum(entry: DiscoveredMigration): string {
    const toStepPayload = (steps: IMigrationStepProcessor[]) =>
      steps.map((s) =>
        typeof (s as any).checksumPayload === 'function' ? (s as any).checksumPayload() : s.label,
      );

    const content = {
      version: entry.version,
      name: entry.migration.name,
      className: entry.className,
      databases: [...entry.migration.getDatabases()].sort(),
      transactional: entry.migration.isTransactional(),
      steps: {
        beforeDeploy: toStepPayload(entry.migration.executeBeforeDeploy()),
        execute: toStepPayload(entry.migration.execute()),
      },
    };

    return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
  }
}