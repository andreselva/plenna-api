import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';

export interface AppointmentSetting<TConfig = unknown> {
  clientId: number;
  appointmentType: string;
  isActive: boolean;
  recurrence: Recurrence | null;
  timezone: string | null;
  config: TConfig | null;
}

interface AppointmentSettingRow {
  clientId: number;
  appointmentType: string;
  isActive: number;
  recurrence: string | null;
  timezone: string | null;
  config: string | null;
}

type RawConfig = string | Buffer | Record<string, unknown> | null;

@Injectable()
export class AppointmentSettingsService {
  private readonly logger = new Logger(AppointmentSettingsService.name);

  constructor(private readonly database: MySQLDatabase) {}

  async findAllByClient(clientId: number): Promise<Map<string, AppointmentSetting>> {
    const rows = (await this.database.select(
      'SELECT clientId, appointmentType, isActive, recurrence, timezone, config FROM appointment_settings WHERE clientId = ?',
      [clientId],
    )) as AppointmentSettingRow[];

    const map = new Map<string, AppointmentSetting>();
    rows.forEach((row) => {
      map.set(row.appointmentType, this.mapRow(row));
    });
    return map;
  }

  async findOne(clientId: number, appointmentType: string): Promise<AppointmentSetting | null> {
    const rows = (await this.database.select(
      'SELECT clientId, appointmentType, isActive, recurrence, timezone, config FROM appointment_settings WHERE clientId = ? AND appointmentType = ? LIMIT 1',
      [clientId, appointmentType],
    )) as AppointmentSettingRow[];

    if (rows.length === 0) {
      return null;
    }

    return this.mapRow(rows[0]);
  }

  async getAllActiveClientIds(): Promise<number[]> {
    const rows = (await this.database.select(
      `SELECT id FROM clients WHERE status = 'active' AND clientName <> '__PLENNA_SAAS__'`,
      [],
    )) as { id: number }[];
    return rows.map((r) => Number(r.id));
  }

  async upsertBulk(clientIds: number[], setting: Omit<AppointmentSetting, 'clientId'>): Promise<void> {
    for (const clientId of clientIds) {
      await this.upsert({ ...setting, clientId });
    }
  }

  async upsert(setting: AppointmentSetting): Promise<void> {
    const payload = {
      clientId: setting.clientId,
      appointmentType: setting.appointmentType,
      isActive: setting.isActive ? 1 : 0,
      recurrence: setting.recurrence ?? null,
      timezone: setting.timezone ?? null,
      config:
        setting.config === null || setting.config === undefined
          ? null
          : JSON.stringify(setting.config),
    };

    await this.database.execute(
      `INSERT INTO appointment_settings (clientId, appointmentType, isActive, recurrence, timezone, config)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         isActive = VALUES(isActive),
         recurrence = VALUES(recurrence),
         timezone = VALUES(timezone),
         config = VALUES(config),
         updatedAt = CURRENT_TIMESTAMP`,
      [
        payload.clientId,
        payload.appointmentType,
        payload.isActive,
        payload.recurrence,
        payload.timezone,
        payload.config,
      ],
    );
  }

  private mapRow(row: AppointmentSettingRow): AppointmentSetting {
    const parsedConfig = this.normalizeConfig(row.config);

    return {
      clientId: row.clientId,
      appointmentType: row.appointmentType,
      isActive: row.isActive === 1,
      recurrence: (row.recurrence as Recurrence | null) ?? null,
      timezone: row.timezone,
      config: parsedConfig,
    };
  }

  private normalizeConfig(raw: RawConfig): Record<string, unknown> | null {
    if (raw == null) return null;

    if (typeof raw === 'object' && !Buffer.isBuffer(raw)) {
      return raw;
    }

    if (Buffer.isBuffer(raw)) {
      try {
        return JSON.parse(raw.toString('utf8')) as Record<string, unknown>;
      } catch (e) {
        this.logger.warn(`Falha ao converter config (Buffer): ${(e as Error).message}`);
        return null;
      }
    }

    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch (e) {
      this.logger.warn(`Falha ao converter config (string): ${(e as Error).message}`);
      return null;
    }
  }
}