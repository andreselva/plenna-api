---
name: create-appointment
description: Guia completo para criar um novo agendamento recorrente na Plenna API. Use sempre que o usuário pedir para adicionar, criar ou implementar um novo agendamento (appointment), tarefa recorrente, job agendado, ou qualquer processamento periódico no sistema. Cobre todos os arquivos que precisam ser criados ou modificados.
---

# Criar Novo Agendamento — Plenna API

## Visão Geral

O sistema de agendamentos é baseado em BullMQ com uma fila centralizada (`appointments`). Cada agendamento é uma classe que estende `ExecutableAppointment` e implementa o método `execute()`. O worker processa os jobs despachando para o handler correto pelo campo `job.name`, que é o `type` do agendamento.

O fluxo completo:
```
AppointmentsService.updateStatus()
  → AppointmentsQueueService.schedule()
    → queue.add(appointment.type, payload, { repeat })
      → [Worker] AppointmentsWorkerService.process()
        → appointment.execute(job.data)
```

---

## Checklist de Implementação

### 1. Definir a interface de config (se necessário)

Se o agendamento precisar de parâmetros configuráveis por tenant, crie uma interface de config:

```typescript
// src/modules/appointments/definitions/meu-agendamento.appointment.ts
export interface MeuAgendamentoConfig {
  diasAntecedencia?: number;
  // outros parâmetros...
}
```

Se não houver config, use `null` como `TConfig`.

---

### 2. Criar a classe do agendamento

Arquivo: `src/modules/appointments/definitions/meu-agendamento.appointment.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { ExecutableAppointment } from '../executable-appointment.base';
import { AppointmentJobData } from '../types/appointment-job-data.type';
// importe os serviços que o execute() vai precisar

export interface MeuAgendamentoConfig {
  // defina os campos ou remova se não precisar de config
}

@Injectable()
export class MeuAgendamento extends ExecutableAppointment<MeuAgendamentoConfig> {
  private readonly logger = new Logger(MeuAgendamento.name);

  constructor(
    // injete os serviços necessários
  ) {
    super(
      2,                          // id numérico único — cheque os existentes antes de definir
      'Nome legível do agendamento',
      'Descrição do que ele faz.',
      Recurrence.DAILY_08,        // recorrência padrão
      false,                      // inativo por padrão
      'meu-agendamento',          // type: string única em snake-case, usada como job.name
      null,                       // config padrão (null ou instância de MeuAgendamentoConfig)
      'America/Sao_Paulo',
    );
  }

  async execute(job: AppointmentJobData<MeuAgendamentoConfig>): Promise<void> {
    this.logger.log(`Processando ${this.type} para o cliente ${job.clientId}`);
    // lógica do agendamento aqui
  }
}
```

**Pontos de atenção:**
- O `id` deve ser único entre todos os agendamentos. O existente `UpcomingExpensesEmailAppointment` usa `id = 1`.
- O `type` deve ser único — é usado como `job.name` no BullMQ e como chave em `appointment_settings`.
- `isActive: false` é o padrão seguro — o tenant ativa pelo endpoint.
- Se o `execute()` precisar de `clientId` mas não tiver contexto de request (é um worker), use `job.clientId` diretamente.

---

### 3. Registrar no AppointmentsModule

Arquivo: `src/modules/appointments/appointments.module.ts`

Adicione o novo appointment em três lugares:

```typescript
// 1. Import da classe
import { MeuAgendamento } from './definitions/meu-agendamento.appointment';

@Module({
  providers: [
    // ...providers existentes...

    // 2. Provider da classe (para DI dos serviços injetados no constructor)
    MeuAgendamento,

    // 3. Adicionar ao array do AVAILABLE_APPOINTMENTS_TOKEN
    {
      provide: AVAILABLE_APPOINTMENTS_TOKEN,
      useFactory: (
        upcomingExpenses: UpcomingExpensesEmailAppointment,
        meuAgendamento: MeuAgendamento,  // adicione aqui
      ) => [upcomingExpenses, meuAgendamento],
      inject: [UpcomingExpensesEmailAppointment, MeuAgendamento],  // e aqui
    },
  ],
})
export class AppointmentsModule {}
```

---

### 4. Registrar no AppointmentsWorkerModule

O worker roda em processo separado e precisa ter acesso à mesma lista de appointments.

Arquivo: `src/workers/appointments/appointments-worker.module.ts`

```typescript
import { MeuAgendamento } from 'src/modules/appointments/definitions/meu-agendamento.appointment';

@Module({
  providers: [
    // ...providers existentes...
    MeuAgendamento,
    {
      provide: AVAILABLE_APPOINTMENTS_TOKEN,
      useFactory: (
        upcomingExpenses: UpcomingExpensesEmailAppointment,
        meuAgendamento: MeuAgendamento,
      ) => [upcomingExpenses, meuAgendamento],
      inject: [UpcomingExpensesEmailAppointment, MeuAgendamento],
    },
  ],
})
export class AppointmentsWorkerModule {}
```

> **Atenção:** se o `AppointmentsWorkerModule` importar o `AppointmentsModule` para reutilizar o token, verifique se o `AVAILABLE_APPOINTMENTS_TOKEN` está sendo exportado pelo `AppointmentsModule`. Caso contrário, declare os providers diretamente no worker module como mostrado acima.

---

### 5. Serviços auxiliares (se necessário)

Se o `execute()` precisar de serviços próprios (ex: consultar o banco, enviar email), crie-os em:

```
src/modules/appointments/services/meu-agendamento.service.ts
```

Siga o padrão dos serviços existentes (`UpcomingExpensesService`, `UpcomingExpensesEmailService`). Declare-os como `@Injectable()` e adicione ao `providers` do `AppointmentsModule` e do `AppointmentsWorkerModule`.

---

## Agendamentos internos com inicializador

Agendamentos internos são invisíveis para o tenant — não aparecem nos endpoints públicos e não requerem ação do usuário para serem ativados. O sistema os agenda automaticamente para todos os clientes ativos quando o worker sobe.

**Características:**
- `isInternal = true` no constructor da classe
- `isActive = false` (o status público não é relevante; o initializer agenda diretamente)
- Nenhum endpoint público de ativação necessário

**Criar o Initializer:**

Arquivo: `src/workers/appointments/meu-agendamento.initializer.ts`

```typescript
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { AppointmentsQueueService } from 'src/modules/appointments/appointments-queue.service';
import { ExecutableAppointment } from 'src/modules/appointments/executable-appointment.base';
// importe o repositório que tem getAllActiveClientIds()

@Injectable()
export class MeuAgendamentoInitializer implements OnModuleInit {
    private readonly logger = new Logger(MeuAgendamentoInitializer.name);

    constructor(
        @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
        private readonly appointments: ExecutableAppointment[],
        private readonly queueService: AppointmentsQueueService,
        private readonly meuRepository: MeuRepository,
    ) {}

    async onModuleInit(): Promise<void> {
        const appointment = this.appointments.find((a) => a.type === 'meu-agendamento');
        if (!appointment) return;

        const clientIds = await this.meuRepository.getAllActiveClientIds();
        this.logger.log(`Inicializando agendamento para ${clientIds.length} cliente(s)`);

        for (const clientId of clientIds) {
            const isScheduled = await this.queueService.isScheduled(appointment, clientId);
            if (!isScheduled) {
                await this.queueService.schedule(appointment, clientId, { config: null });
                this.logger.log(`Agendamento criado para o cliente ${clientId}`);
            }
        }
    }
}
```

**Registrar o Initializer no AppointmentsWorkerModule:**

```typescript
// src/workers/appointments/appointments-worker.module.ts
import { MeuAgendamentoInitializer } from './meu-agendamento.initializer';

@Module({
  imports: [/* ... */, MeuModulo],  // importe o módulo que provê o repositório
  providers: [AppointmentsWorkerService, WorkerFactory, /* ...outros initializers... */, MeuAgendamentoInitializer],
})
```

**Padrão para `getAllActiveClientIds()`:**

Todo repositório de agendamento interno precisa deste método:

```typescript
async getAllActiveClientIds(): Promise<number[]> {
    const query = `SELECT id FROM clients WHERE status = 'active' AND clientName <> '__PLENNA_SAAS__'`;
    const rows = await this.database.select(query, []);
    return rows.map((row: any) => Number(row.id));
}
```

---

## Jobs únicos com delay (rebuild sob demanda)

Use este padrão quando uma ação do usuário deve disparar um job único (não recorrente) com delay, usando o mesmo worker de appointments.

**Quando usar:**
- Rebuild de dados: o usuário solicita regeneração e o sistema agenda para executar após alguns minutos
- Processamentos pesados que não devem ser síncronos
- Ações que precisam de deduplicação (evitar múltiplos cliques)

**Como implementar:**

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { APPOINTMENTS_QUEUE_TOKEN } from 'src/modules/appointments/appointments.constants';
import { Queue } from 'src/modules/appointments/queue.provider';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';

const DELAY_MS = 2 * 60 * 1000; // 2 minutos

@Injectable()
export class MeuService {
    constructor(
        private readonly authContext: AuthContextService,
        @Inject(APPOINTMENTS_QUEUE_TOKEN)
        private readonly queue: Queue<AppointmentJobData>,
    ) {}

    async scheduleRebuild(): Promise<void> {
        const clientId = this.authContext.getClientId();
        const jobId = `meu-job:rebuild:${clientId}`;  // inclua clientId para isolamento multitenant

        await this.queue.add('meu-agendamento', {
            appointmentId: SEU_ID,
            clientId,
            config: null,
        }, {
            jobId,          // deduplicação: BullMQ ignora add() se jobId já existe no estado delayed/waiting
            delay: DELAY_MS,
            removeOnComplete: true,
        });
    }
}
```

**Pontos de atenção:**

- O `jobId` deve incluir o `clientId` para que cada tenant tenha seu próprio job — sem isso, um rebuild de um cliente sobrescreveria o de outro.
- A deduplicação por `jobId` no BullMQ é automática: chamadas repetidas enquanto o job ainda está no estado `delayed` são silenciosamente ignoradas. Uma vez que o job é processado e removido da fila, o próximo `add()` funciona normalmente.
- O delay de 2 minutos protege contra múltiplos cliques do usuário e absorve pequenas rajadas de requisições sem sobrecarregar o worker.
- O job é processado pelo mesmo worker de appointments: o `job.name` deve corresponder ao `type` de um `ExecutableAppointment` registrado.
- O módulo que usa `APPOINTMENTS_QUEUE_TOKEN` deve registrar seu próprio provider (usando `createQueue` de `queue.provider.ts` + `RedisModule`), **sem importar `AppointmentsModule`** — isso evita dependência circular quando `AppointmentsModule` importa o seu módulo.

**Injetar a fila no módulo (sem importar AppointmentsModule):**

```typescript
import { RedisModule } from 'src/modules/redis/redis.module';
import { REDIS_CONNECTION } from 'src/modules/redis/redis.tokens';
import { APPOINTMENTS_QUEUE_TOKEN } from 'src/modules/appointments/appointments.constants';
import { createQueue } from 'src/modules/appointments/queue.provider';
import type { Redis } from 'ioredis';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: APPOINTMENTS_QUEUE_TOKEN,
            useFactory: (redis: Redis) => createQueue(redis),
            inject: [REDIS_CONNECTION],
        },
        MeuService,
        // ...
    ],
    exports: [MeuService],
})
export class MeuModulo {}
```

---

## Recorrências disponíveis

```typescript
enum Recurrence {
  EVERY_15_MIN    // a cada 15 min — útil para testes
  HOURLY          // toda hora (cron: '0 * * * *')
  DAILY_03        // diariamente às 03h (off-peak, ideal para builds pesados)
  DAILY_08        // diariamente às 08h
  WEEKDAYS_08     // dias úteis às 08h (seg–sex)
  WEEKLY_MON_09   // toda segunda às 09h
}
```

Para adicionar uma nova recorrência: edite `src/enum/recurrence.enum.ts` e o `switch` em `AppointmentBase.buildRepeatOptions()`.

---

## AppointmentJobData

O objeto recebido no `execute()`:

```typescript
interface AppointmentJobData<TConfig = unknown> {
  clientId: number;       // tenant que agendou
  appointmentId: number;  // id do appointment
  config: TConfig | null; // config salva pelo tenant (pode ser null)
  recurrence?: Recurrence | null;
  timezone?: string | null;
}
```

---

## Contexto multi-tenant

O worker (`appointments.worker.ts`) chama `authContext.runWithContext({ clientId: job.data.clientId, ... })` antes de despachar para o handler. Isso garante que, dentro de todo `execute()`, o `AuthContextService` (e o `WorkerAuthContextService`) retornam o `clientId` correto para aquele job.

**Consequências práticas:**

- Repositórios e serviços que injetam `AuthContextService` podem chamar `getClientId()` diretamente — o contexto já está correto. Não é necessário passar `clientId` como parâmetro.
- Um agendamento **nunca** deve processar dados de múltiplos clientes em uma única execução. O job é sempre escopado a um tenant; se múltiplos tenants precisam executar, cada um tem seu próprio job agendado.

```typescript
// CORRETO — AuthContextService já retorna o clientId do job
async loadItems(): Promise<Item[]> {
  const query = 'SELECT * FROM items WHERE clientId = ?';
  return this.database.select(query, [this.authContext.getClientId()]);
}

// ERRADO — varre todos os tenants, ignora o escopo do job
async loadItems(): Promise<Item[]> {
  return this.database.select('SELECT * FROM items', []);
}
```

---

## Persistência de configuração

As configurações por tenant são salvas na tabela `appointment_settings` pelo `AppointmentSettingsService`. O campo `config` é serializado como JSON. O `AppointmentsService` lida com isso automaticamente via `updateStatus()` — o appointment em si não precisa fazer esse controle.

---

## Teste rápido

Para testar sem esperar o cron disparar, use o `AppointmentsDebugController` (disponível apenas em dev):

```
POST /appointments/debug/trigger/:type
```

Isso executa o `execute()` do appointment imediatamente para o tenant autenticado.