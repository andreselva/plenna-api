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

## Recorrências disponíveis

```typescript
enum Recurrence {
  EVERY_15_MIN    // a cada 15 min — útil para testes
  HOURLY          // toda hora (cron: '0 * * * *')
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

## Persistência de configuração

As configurações por tenant são salvas na tabela `appointment_settings` pelo `AppointmentSettingsService`. O campo `config` é serializado como JSON. O `AppointmentsService` lida com isso automaticamente via `updateStatus()` — o appointment em si não precisa fazer esse controle.

---

## Teste rápido

Para testar sem esperar o cron disparar, use o `AppointmentsDebugController` (disponível apenas em dev):

```
POST /appointments/debug/trigger/:type
```

Isso executa o `execute()` do appointment imediatamente para o tenant autenticado.