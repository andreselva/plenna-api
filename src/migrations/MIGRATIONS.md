# Sistema de Migrations

Sistema de migrations próprio para controle de alterações no banco de dados MySQL.
Cada alteração vira um arquivo TypeScript versionado, executado automaticamente no deploy.

---

## Índice

- [Estrutura de pastas](#estrutura-de-pastas)
- [Como funciona](#como-funciona)
- [Criando uma migration](#criando-uma-migration)
- [Criando um script](#criando-um-script)
- [Tipos de step](#tipos-de-step)
- [Fases do deploy](#fases-do-deploy)
- [Transações](#transações)
- [Comandos disponíveis](#comandos-disponíveis)
- [Testando localmente](#testando-localmente)
- [Tabela de controle](#tabela-de-controle)
- [Regras importantes](#regras-importantes)

---

## Estrutura de pastas

```
src/migrations/
├── cli/
│   └── migration.cli.ts          # Entrypoint — chamado pelo entrypoint.sh e pelos scripts npm
├── core/
│   ├── IMigration.ts             # Interface que toda migration implementa
│   ├── IMigrationStepProcessor.ts# Interface que todo step implementa
│   ├── IScript.ts                # Interface que todo script implementa
│   ├── MigrationRegistry.ts      # Lista ordenada de todas as migrations
│   ├── MigrationRepository.ts    # Operações na tabela schema_migrations
│   ├── MigrationRunner.ts        # Motor de execução
│   └── MigrationSteps.ts         # Fábrica de steps (RunSQL, RunScript, RunEffect)
├── exceptions/
│   ├── MigrationRepositoryException.ts
│   └── RunSqlException.ts
├── processors/
│   ├── RunSQL.ts                 # Executa SQL puro
│   ├── RunScript.ts              # Executa um script TypeScript
│   └── RunEffect.ts              # Executa qualquer efeito colateral
├── scripts/                      # Scripts TypeScript usados por RunScript
│   └── SeedModulosScript.ts
└── versions/                     # Uma migration por arquivo
    ├── 001_InitialTables.ts
    └── ...
```

---

## Como funciona

Cada migration é uma classe TypeScript que descreve o que fazer no banco. O sistema:

1. Lê o `MigrationRegistry` — a lista ordenada de todas as migrations
2. Consulta a tabela `schema_migrations` no banco para saber o que já foi executado
3. Executa apenas as migrations pendentes, na ordem do Registry
4. Registra cada execução (sucesso ou falha) na tabela de controle

No deploy, o `entrypoint.sh` chama as migrations **antes** de subir a API. Se qualquer migration falhar, o deploy para e a API não sobe.

---

## Criando uma migration

### 1. Crie o arquivo em `src/migrations/versions/`

O nome deve seguir o padrão `NNN_DescricaoCurta.ts` onde `NNN` é o número sequencial.

```ts
// src/migrations/versions/019_AdicionaColunaStatusUser.ts

import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration019_AdicionaColunaStatusUser implements IMigration {
  readonly version = '019';
  readonly name    = 'Adiciona coluna status na tabela user';

  execute(): IMigrationStepProcessor[] {
    return [
      MigrationSteps.RunSQL(`
        ALTER TABLE user
          ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
      `),
    ];
  }

  executeBeforeDeploy(): IMigrationStepProcessor[] {
    return [];
  }

  isTransactional(): boolean {
    return false;
  }
}
```

### 2. Registre no `MigrationRegistry`

Abra `src/migrations/core/MigrationRegistry.ts` e adicione a nova migration **sempre ao final** do array:

```ts
import { Migration019_AdicionaColunaStatusUser } from '../versions/019_AdicionaColunaStatusUser';

export const MIGRATION_REGISTRY: IMigration[] = [
  // ... migrations anteriores
  new Migration019_AdicionaColunaStatusUser(), // ← adicionar aqui
];
```

### 3. Teste localmente

```bash
npm run migration:status   # confirma que aparece como pendente
npm run migration:dev -- plenna_dev   # executa contra o banco local
npm run migration:status   # confirma que foi executada
```

---

## Criando um script

Use scripts quando a lógica for complexa demais para SQL puro — loops, condicionais, seeds com muitos registros, etc.

### 1. Crie o arquivo em `src/migrations/scripts/`

```ts
// src/migrations/scripts/SeedPermissoesScript.ts

import { PoolConnection } from 'mysql2/promise';
import { IScript } from '../core/IScript';

export class SeedPermissoesScript implements IScript {
  constructor(private readonly connection: PoolConnection) {}

  async execute(): Promise<void> {
    const permissoes = [
      { nome: 'criar_usuario',  descricao: 'Criar novos usuários' },
      { nome: 'editar_usuario', descricao: 'Editar usuários existentes' },
      { nome: 'deletar_usuario',descricao: 'Remover usuários' },
    ];

    for (const permissao of permissoes) {
      await this.connection.execute(
        `INSERT IGNORE INTO permissoes (nome, descricao) VALUES (?, ?)`,
        [permissao.nome, permissao.descricao],
      );
    }
  }
}
```

### 2. Use o script numa migration com `RunScript`

```ts
import { SeedPermissoesScript } from '../scripts/SeedPermissoesScript';

execute(): IMigrationStepProcessor[] {
  return [
    MigrationSteps.RunSQL(`
      CREATE TABLE IF NOT EXISTS permissoes (
        id        BIGINT AUTO_INCREMENT PRIMARY KEY,
        nome      VARCHAR(50)  NOT NULL UNIQUE,
        descricao VARCHAR(120) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `),
    MigrationSteps.RunScript(SeedPermissoesScript),
  ];
}
```

> **Importante:** o script recebe a conexão ativa no construtor. Não abra novas conexões dentro do script — use sempre `this.connection`.

---

## Tipos de step

Todos os steps são criados via `MigrationSteps` e implementam `IMigrationStepProcessor`.

### `MigrationSteps.RunSQL(sql)`

Executa SQL puro. Suporta múltiplas statements separadas por `;`.

```ts
MigrationSteps.RunSQL(`
  ALTER TABLE expense ADD COLUMN IF NOT EXISTS paymentDate DATE NULL;
  CREATE INDEX IF NOT EXISTS idx_expense_payment ON expense(paymentDate);
`)
```

### `MigrationSteps.RunScript(Classe)`

Executa uma classe que implementa `IScript`. Recebe a referência da classe, não uma instância — o Runner instancia na hora passando a conexão ativa.

```ts
MigrationSteps.RunScript(SeedPermissoesScript)
```

### `MigrationSteps.RunEffect(descricao, fn)`

Executa qualquer efeito colateral como step. Útil para limpeza de cache, chamadas internas, etc.

```ts
MigrationSteps.RunEffect('Limpar cache Redis', async (connection) => {
  // lógica aqui
})
```

---

## Fases do deploy

Cada migration pode ter steps em duas fases distintas:

| Fase | Método | Quando executa | Para que serve |
|---|---|---|---|
| **before-deploy** | `executeBeforeDeploy()` | Antes do novo código subir | DDL não-destrutivo: `ADD COLUMN`, `CREATE INDEX`, `CREATE TABLE` |
| **execute** | `execute()` | Após o novo código subir | DML e DDL que dependem do novo código: `INSERT`, `UPDATE`, `DROP COLUMN`, `ALTER ENUM` |

### Quando usar `executeBeforeDeploy`

Use quando a alteração de schema pode conviver com o código antigo ainda rodando. Exemplo: adicionar uma coluna nullable não quebra queries existentes.

```ts
executeBeforeDeploy(): IMigrationStepProcessor[] {
  return [
    // Pode rodar com o código antigo no ar — ADD COLUMN nullable não quebra nada
    MigrationSteps.RunSQL(`
      ALTER TABLE clients
        ADD COLUMN IF NOT EXISTS trialEndsAt VARCHAR(20) NULL
    `),
  ];
}

execute(): IMigrationStepProcessor[] {
  return [
    // Só roda após o novo código estar no ar
    MigrationSteps.RunSQL(`
      UPDATE clients SET trialEndsAt = '2025-12-31' WHERE plan = 'trial'
    `),
  ];
}
```

Se não há nada a fazer numa fase, retorne array vazio:

```ts
executeBeforeDeploy(): IMigrationStepProcessor[] {
  return [];
}
```

---

## Transações

O método `isTransactional()` controla se os steps de `execute()` rodam dentro de um `BEGIN / COMMIT`.

```ts
// Use true para migrations com apenas DML (INSERT, UPDATE, DELETE)
// Em falha: ROLLBACK automático de todos os steps
isTransactional(): boolean {
  return true;
}

// Use false quando há DDL (CREATE TABLE, ALTER TABLE, DROP TABLE)
// MySQL faz commit implícito em DDL — rollback não funciona
isTransactional(): boolean {
  return false;
}
```

| Conteúdo da migration | `isTransactional()` |
|---|---|
| Só `INSERT`, `UPDATE`, `DELETE` | `true` |
| Qualquer `CREATE TABLE`, `ALTER TABLE`, `DROP` | `false` |
| Mistura de DDL e DML | `false` |

> Sempre use `IF NOT EXISTS` em DDL para evitar erros em reexecuções quando `isTransactional` é `false`.

---

## Comandos disponíveis

```bash
# Executa as migrations pendentes (fase execute)
npm run migration:run

# Executa a fase before-deploy
npm run migration:before-deploy

# Lista o status de todas as migrations
npm run migration:status

# Modo dev: executa todas as fases contra um banco específico
npm run migration:dev -- <nome_do_banco>
```

### Saída do `migration:status`

```
═══════════════════════════════════════
  Migrations — Status (19 total)
═══════════════════════════════════════

  ✅ Executadas: 18
      [001] Criação das tabelas iniciais  (2025-05-25 10:00:00)
      ...

  ⏳ Pendentes: 1
      [019] Adiciona coluna status na tabela user
```

Em caso de falha anterior:

```
  ❌ Com falha: 1
      [019] Adiciona coluna status na tabela user
           Step que falhou: 2
           Erro: Unknown column 'role' in 'field list'
```

---

## Testando localmente

### Pré-requisitos

Variáveis de ambiente configuradas no `.env` da raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_PORT=3306
DB_NAME=plenna_dev
```

### Fluxo recomendado ao criar uma migration nova

```bash
# 1. Confirma que a migration aparece como pendente
npm run migration:status

# 2. Testa contra o banco local (executa todas as fases)
npm run migration:dev -- plenna_dev

# 3. Confirma que foi registrada com sucesso
npm run migration:status

# 4. Se precisar testar novamente, delete o registro e rode de novo
# DELETE FROM schema_migrations WHERE version = '019';
npm run migration:dev -- plenna_dev
```

### Via Docker

```bash
docker exec plenna-api-1 \
  node -r ./register-paths.js \
  dist/migrations/cli/migration.cli.js dev plenna_dev
```

---

## Tabela de controle

A tabela `schema_migrations` é criada automaticamente na primeira execução. Estrutura:

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT | PK auto increment |
| `version` | VARCHAR(100) | Versão da migration — única |
| `name` | VARCHAR(255) | Nome descritivo |
| `executed_at` | DATETIME | Data e hora da execução |
| `checksum` | VARCHAR(64) | Hash SHA-256 para auditoria |
| `success` | BOOLEAN | `true` se executou com sucesso |
| `failed_step` | TINYINT | Índice (1-based) do step que falhou |
| `error_msg` | TEXT | Mensagem de erro em caso de falha |

---

## Regras importantes

**Versão é imutável.** Nunca altere o `version` de uma migration já executada. Se precisar corrigir algo, crie uma nova migration.

**Nunca reordene o Registry.** A ordem do `MigrationRegistry` é a ordem histórica de criação. Reordenar pode quebrar dependências entre migrations.

**Sempre use `IF NOT EXISTS` em DDL.** Protege contra erros em caso de reexecução quando `isTransactional` é `false`.

**Scripts usam a conexão recebida.** Dentro de um `IScript`, use sempre `this.connection` — nunca abra uma nova conexão.

**`executeBeforeDeploy` não deve ser destrutivo.** Nada que quebre o código antigo: sem `DROP COLUMN`, sem `MODIFY COLUMN` que altere tipo, sem `RENAME`.
