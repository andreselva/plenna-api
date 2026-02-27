import { MigrationRunner } from '../core/MigrationRunner';
import { MIGRATION_REGISTRY } from '../core/MigrationRegistry';

async function main(): Promise<void> {
  const command = process.argv[2];
  const runner  = new MigrationRunner(MIGRATION_REGISTRY);

  try {
    switch (command) {

      case 'run': {
        console.log('\n═══════════════════════════════════════');
        console.log('  Migrations — Fase: execute');
        console.log('═══════════════════════════════════════\n');
        await runner.runPhase('execute');
        console.log('✅ Migrations concluídas com sucesso.\n');
        break;
      }

      case 'before-deploy': {
        console.log('\n═══════════════════════════════════════');
        console.log('  Migrations — Fase: before-deploy');
        console.log('═══════════════════════════════════════\n');
        await runner.runPhase('beforeDeploy');
        console.log('✅ Before-deploy concluído com sucesso.\n');
        break;
      }

      case 'status': {
        const statuses = await runner.getStatus();
        const done     = statuses.filter((s) =>  s.executed);
        const pending  = statuses.filter((s) => !s.executed);
        const failed   = statuses.filter((s) => s.record && !s.record.success);

        console.log('\n═══════════════════════════════════════');
        console.log(`  Migrations — Status (${statuses.length} total)`);
        console.log('═══════════════════════════════════════\n');

        console.log(`  ✅ Executadas: ${done.length}`);
        for (const { migration, record } of done) {
          console.log(`      [${migration.version}] ${migration.name}  (${record?.executed_at ?? ''})`);
        }

        if (failed.length > 0) {
          console.log(`\n  ❌ Com falha: ${failed.length}`);
          for (const { migration, record } of failed) {
            console.log(`      [${migration.version}] ${migration.name}`);
            console.log(`           Step que falhou: ${record?.failed_step ?? '?'}`);
            console.log(`           Erro: ${record?.error_msg ?? '?'}`);
          }
        }

        console.log(`\n  ⏳ Pendentes: ${pending.length}`);
        for (const { migration } of pending) {
          console.log(`      [${migration.version}] ${migration.name}`);
        }
        console.log('');
        break;
      }

      case 'dev': {
        const database = process.argv[3];
        if (!database) {
          console.error('❌ Informe o banco de dados. Uso: migration.cli.ts dev <database>\n');
          process.exit(1);
        }
        console.log('\n═══════════════════════════════════════');
        console.log(`  Migrations — Modo dev (banco: ${database})`);
        console.log('═══════════════════════════════════════\n');
        await runner.runPhase('beforeDeploy', { devDatabase: database });
        await runner.runPhase('execute',      { devDatabase: database });
        console.log('✅ Migrations dev concluídas com sucesso.\n');
        break;
      }

      default: {
        console.log(`
Uso: ts-node src/migrations/cli/migration.cli.ts <command>

Comandos:
  run                Executa migrations pendentes (fase execute)
  before-deploy      Executa a fase before-deploy
  status             Lista status, incluindo falhas com step e mensagem de erro
  dev <database>     Executa todas as fases contra um banco específico (uso local)

Exemplos:
  npm run migration:run
  npm run migration:dev plenna_dev
        `);
        process.exit(1);
      }
    }
  } finally {
    await runner.close();
  }
}

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err.message ?? err);
  process.exit(1);
});