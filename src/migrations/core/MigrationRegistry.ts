import { Migration20260227_01_TesteMigration } from '../versions/Migration20260227_01_TesteMigration';
import { IMigration } from './IMigration';

// ──────────────────────────────────────────────────────────────────────────────
// Registre aqui cada migration em ordem crescente de versão.
// NUNCA reordene migrations já existentes.
// ──────────────────────────────────────────────────────────────────────────────

export const MIGRATION_REGISTRY: IMigration[] = [
  //Ex: new Migration001_InitialTables(),
  new Migration20260227_01_TesteMigration()
];
