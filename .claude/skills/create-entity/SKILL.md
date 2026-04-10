---
name: create-entity
description: Criar uma nova entidade na Plenna API. Use sempre que o usuário pedir para criar uma entidade, modelo de domínio, tabela mapeada, ou quando precisar criar o repositório correspondente a uma nova entidade. Cobre a criação de EntityModel, interface de row, e BaseRepository.
---

# Criar Nova Entidade — Plenna API

Três artefatos obrigatórios para qualquer nova entidade: a **entidade** (`EntityModels/`), a **interface de row** (`Shared/interfaces/`), e o **repositório** (`modules/.../`).

---

## 1. Interface de Row

Arquivo: `src/Shared/interfaces/IMinhaEntidadeRow.ts`

Representa uma linha crua retornada pelo banco. Tipos devem refletir o que o MySQL devolve — não o que o domínio espera:

```typescript
export interface IMinhaEntidadeRow {
    id: number;
    clientId: number;
    name: string;
    value: number;        // dinheiro: number (não string)
    dueDate: string;      // datas: sempre string aqui, convertidas no fromRow
    isActive: number;     // booleans do MySQL chegam como 0/1 (number)
    createdAt: string;
    updatedAt: string;
}
```

**Regras de tipo na interface de row:**
- Datas → `string`
- Booleans → `number` (MySQL retorna `0` ou `1`)
- Enums → `string`
- Valores monetários → `number`

---

## 2. Entidade

Arquivo: `src/EntityModels/MinhaEntidade.ts`

```typescript
import IEntity from 'src/Shared/interfaces/IEntity';
import EntityModel from './entity.model';
import { IMinhaEntidadeRow } from 'src/Shared/interfaces/IMinhaEntidadeRow';
import { MinhaEntidadeDTO } from 'src/modules/MeuModulo/DTOs/minha-entidade.dto';
import DateHelper from 'src/Shared/Utils/DateHelper';

export class MinhaEntidade extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public name: string = '';
    public value: number = 0;
    public dueDate: string = '';
    public isActive: boolean = true;
    public createdAt: string;
    public updatedAt: string;

    // Declare aqui campos que existem na classe mas NÃO devem ir para o banco.
    // O QueryBuilder os ignorará no INSERT/UPDATE.
    public static ignoredProperties: string[] = [];

    // Mapeia linha do banco → entidade. Usado pelo DataMapper.
    static fromRow(row: IMinhaEntidadeRow): MinhaEntidade {
        const e = new MinhaEntidade();
        e.id = row.id;
        e.clientId = row.clientId;
        e.name = row.name;
        e.value = row.value;
        e.dueDate = DateHelper.toISODate(row.dueDate) as string; // converta datas aqui
        e.isActive = Boolean(row.isActive);                       // converta 0/1 → boolean aqui
        return e;
    }

    // Mapeia DTO da requisição → entidade. Necessário para create/update.
    static fromDTO(dto: MinhaEntidadeDTO): MinhaEntidade {
        const e = new MinhaEntidade();
        e.id = dto.id ?? 0;
        e.name = dto.name;
        e.value = dto.value;
        e.dueDate = dto.dueDate;
        e.isActive = dto.isActive ?? true;
        if (!(e.id > 0)) {
            e.createdAt = DateHelper.getCurrentDate();
        } else {
            e.updatedAt = DateHelper.getCurrentDate();
        }
        return e;
    }

    getTableName(): string {
        return 'minha_entidade'; // nome exato da tabela no banco
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return MinhaEntidade.ignoredProperties;
    }
}
```

**Sobre `ignoredProperties`:** coloque aqui qualquer campo da classe que não existe como coluna no banco — campos calculados, relações carregadas em memória, totais agregados, etc. Exemplo: `Expense` ignora `totalPaid` e `updateInstallments`; `Invoice` ignora `expenses`, `value` e `totalPaid`.

---

## 3. Repositório

Arquivo: `src/modules/MeuModulo/minha-entidade.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { MinhaEntidade } from 'src/EntityModels/MinhaEntidade';
import BaseRepository from 'src/Shared/Repositories/BaseRepository';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';

@Injectable()
export class MinhaEntidadeRepository extends BaseRepository<MinhaEntidade> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }

    async list(): Promise<MinhaEntidade[]> {
        const rows = await this.database.select(
            `SELECT * FROM minha_entidade WHERE clientId = ?`,
            [this.authContext.getClientId()],
        );
        return this.extractToEntity(rows, MinhaEntidade);
    }

    async findById(id: number): Promise<MinhaEntidade | null> {
        const rows = await this.database.select(
            `SELECT * FROM minha_entidade WHERE id = ? AND clientId = ?`,
            [id, this.authContext.getClientId()],
        );
        return this.extractToEntity(rows, MinhaEntidade)[0] ?? null;
    }

    async saveEntity(entity: MinhaEntidade): Promise<MinhaEntidade> {
        const result = await this.save(entity); // INSERT ou UPDATE automático
        if (result.affectedRows > 0 && entity.id === 0) {
            entity.id = result.insertId;
        }
        return entity;
    }
}
```

**Regras do repositório:**
- `this.authContext.getClientId()` deve estar em **todo** `WHERE` de select e em mutações — nunca consulte ou altere dados de outro tenant.
- `this.save(entity)` do `BaseRepository` gera INSERT quando `id = 0`, UPDATE quando `id > 0`. O `clientId` é preenchido automaticamente antes do save.
- `this.extractToEntity(rows, MinhaEntidade)` é o atalho para `DataMapper.toEntities()`.
- Para queries que retornam entidades diferentes da principal, use `DataMapper.toEntities(rows, OutraEntidade)` diretamente.

---

## 4. Registrar no módulo

No módulo NestJS correspondente, declare o repositório em `providers`:

```typescript
@Module({
    providers: [
        MinhaEntidadeRepository,
        // ...
    ],
})
export class MeuModulo {}
```

O repositório recebe `MySQLDatabase` e `AuthContextService` por injeção — não é necessário configurar nada extra, desde que o módulo importe `DatabaseModule` (ou equivalente).