---
name: create-nest-module
description: Criar um novo módulo NestJS na Plenna API. Use sempre que o usuário pedir para criar um módulo, feature, domínio, ou conjunto controller+service+repositório. Também use quando o módulo precisar ser registrado no AppModule ou em um módulo pai. Referencia a skill create-entity para a criação da entidade central.
---

# Criar Novo Módulo — Plenna API

## Estrutura mínima

```
src/modules/<dominio>/<nome-modulo>/
  <nome-modulo>.module.ts
  <nome-modulo>.controller.ts   # omitir se for módulo interno
  <nome-modulo>.service.ts
  <nome-modulo>.repository.ts
  DTOs/
    <nome-modulo>.dto.ts
```

A entidade central (`EntityModels/`) e a interface de row (`Shared/interfaces/`) seguem a skill `create-entity`.

---

## 1. Módulo

```typescript
// src/modules/meu-dominio/meu-modulo/meu-modulo.module.ts
import { Module } from '@nestjs/common';
import { MeuModuloController } from './meu-modulo.controller';
import { MeuModuloService } from './meu-modulo.service';
import { MeuModuloRepository } from './meu-modulo.repository';

@Module({
  imports: [],               // outros módulos cujos exports este módulo consome
  controllers: [MeuModuloController],
  providers: [MeuModuloService, MeuModuloRepository],
  exports: [],               // o que este módulo expõe para outros (geralmente o Service)
})
export class MeuModuloModule {}
```

**`imports`:** apenas módulos NestJS. Se precisar do `LedgerEngine`, importe `LedgerModule`. Se precisar de `FinancialEventsService`, importe `FinancialEventsModule`.

**`exports`:** exporte o `Service` quando outro módulo precisar chamá-lo. Não exporte o `Repository` diretamente.

**Dependência circular:** se dois módulos dependem um do outro, use `forwardRef`:
```typescript
imports: [forwardRef(() => OutroModule)]
```

---

## 2. Controller

```typescript
// src/modules/meu-dominio/meu-modulo/meu-modulo.controller.ts
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { MeuModuloService } from './meu-modulo.service';
import { MeuEntidadeDTO } from './DTOs/minha-entidade.dto';

@Controller('meu-modulo')
export class MeuModuloController {
    constructor(
        private readonly service: MeuModuloService
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async list() {
        return await this.service.list();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: MeuEntidadeDTO) {
        return await this.service.create(dto);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() dto: MeuEntidadeDTO) {
        return await this.service.update(Number(id), dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string) {
        return await this.service.remove(Number(id));
    }
}
```

**Módulo interno (sem endpoint):** omita o controller e não declare `controllers` no módulo. Exporte o `Service`. Exemplo: `FinancialEventsModule`, `LedgerModule`.

---

## 3. Service

```typescript
// src/modules/meu-dominio/meu-modulo/meu-modulo.service.ts
import { Injectable } from '@nestjs/common';
import { MeuModuloRepository } from './meu-modulo.repository';
import { MinhaEntidade } from 'src/EntityModels/MinhaEntidade';
import { MeuEntidadeDTO } from './DTOs/minha-entidade.dto';

@Injectable()
export class MeuModuloService {
    constructor(
        private readonly repository: MeuModuloRepository,
        // injete outros services se necessário (ex: MySQLDatabase para transactions)
    ) {}

    async list() {
        const items = await this.repository.list();
        return { items };
    }

    async create(dto: MeuEntidadeDTO) {
        const entity = MinhaEntidade.fromDTO(dto);
        return await this.repository.saveEntity(entity);
    }

    async update(id: number, dto: MeuEntidadeDTO) {
        dto.id = id;
        const entity = MinhaEntidade.fromDTO(dto);
        return await this.repository.saveEntity(entity);
    }

    async remove(id: number) {
        return await this.repository.remove(id);
    }
}
```

**Use Cases:** para lógica mais complexa, cada operação pode virar uma classe `UseCase` em `UseCases/`, injetada no módulo como provider e chamada pelo Service. Veja `ExpensesModule` e `InvoicesModule` como referência.

---

## 4. Repositório

Siga a skill `create-entity` — seção 3.

---

## 5. Registrar no módulo pai ou no AppModule

**Se o módulo pertence a um módulo pai** (ex: novo submódulo dentro de `Finance`), registre no módulo pai:

```typescript
// src/modules/Finance/finance.module.ts
import { MeuModuloModule } from './meu-modulo/meu-modulo.module';

@Module({
    imports: [
        // ...módulos existentes...
        MeuModuloModule,
    ],
})
export class FinanceModule {}
```

**Se é um módulo de primeiro nível** (sem módulo pai), registre diretamente no `AppModule`:

```typescript
// src/app.module.ts
import { MeuModuloModule } from './modules/meu-dominio/meu-modulo/meu-modulo.module';

@Module({
    imports: [
        // ...imports existentes...
        MeuModuloModule,
    ],
})
export class AppModule implements NestModule {}
```

Não registre o módulo nos dois lugares — se registrou no módulo pai, o `AppModule` já o alcança transitivamente.

---

## 6. Migration de inserção na tabela `modules`

**Sempre perguntar ao usuário** se deve ser gerada a migration para inserir o módulo na tabela `modules` do sistema antes de finalizar a criação.

Se a resposta for sim, crie o arquivo seguindo o padrão de nomenclatura:
```
src/migrations/versions/Migration<YYYYMMDD>_<NN>_InsereModulo<NomeModulo>.ts
```

Use a data atual e o próximo número de sequência disponível (`<NN>`).

### Padrão da migration

```typescript
import { Database } from 'src/enum/database.enum';
import { IMigration } from '../core/IMigration';
import { IMigrationStepProcessor } from '../core/IMigrationStepProcessor';
import { MigrationSteps } from '../core/MigrationSteps';

export class Migration<YYYYMMDD>_<NN>_InsereModulo<NomeModulo> implements IMigration {
    readonly name = 'Insere módulo de <nome legível>';

    execute(): IMigrationStepProcessor[] {
        return [
            MigrationSteps.RunSQL(
                `INSERT INTO modules (name, location, description, showInSidebar, \`group\`, displayName)
                VALUES ('<nome>', '/<rota>', '<descrição>', <0|1>, '<grupo>', '<displayName>');`
            ),
            // Incluir este step apenas se o módulo tiver um pai na tabela modules:
            MigrationSteps.RunSQL(
                `UPDATE modules child
                JOIN modules parent ON parent.name = '<nome-do-pai>'
                SET child.parentId = parent.id
                WHERE child.name = '<nome>';`
            ),
        ];
    }

    executeBeforeDeploy(): IMigrationStepProcessor[] {
        return [];
    }

    getDatabases(): Database[] {
        return [Database.PLENNA];
    }

    isTransactional(): boolean {
        return false;
    }
}
```

### Campos do INSERT

| Campo | Descrição |
|---|---|
| `name` | Identificador único do módulo (camelCase, ex: `transfers`) |
| `location` | Rota no frontend (ex: `/transfers`). `null` se for módulo-pai sem rota própria |
| `description` | Descrição técnica do módulo |
| `showInSidebar` | `1` se aparece no menu lateral, `0` se é interno/config |
| `` `group` `` | Agrupamento no sidebar: `navigation`, `config` ou string vazia |
| `displayName` | Nome exibido na interface (ex: `Transferências`) |

### Regras importantes

- **Nunca use `parentId` hardcoded.** Use o `UPDATE ... JOIN` para encontrar o pai pelo `name`.
- O step de atualização de `parentId` só é necessário se o módulo tiver um módulo pai na tabela.
- Pergunte ao usuário qual é o `name` do módulo pai (caso exista) e se o módulo deve aparecer no sidebar.