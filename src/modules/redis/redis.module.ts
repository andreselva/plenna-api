import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis, { Redis, RedisOptions } from 'ioredis';

export const REDIS_CONNECTION = 'REDIS_CONNECTION';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CONNECTION,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): Redis => {
        // Opções obrigatórias para BullMQ (QueueEvents/Worker)
        const commonOpts: Partial<RedisOptions> = {
          // BullMQ exige isso p/ comandos blockings (XREADGROUP/BRPOPLPUSH etc.)
          maxRetriesPerRequest: null,
          // Opcional, mas costuma evitar filas “travadas” quando perde conexão
          enableReadyCheck: true,
          // Evita enfileirar comandos enquanto desconectado (opcional)
          enableOfflineQueue: false,
        };

        const url = cfg.get<string>('REDIS_URL');
        if (url) {
          // Se usar URL, passe as opções no 2º parâmetro
          return new IORedis(url, commonOpts);
        }

        // Caso esteja configurando via host/port/etc.
        const host = cfg.get<string>('REDIS_HOST', 'redis'); // nome do serviço no docker-compose
        const port = cfg.get<number>('REDIS_PORT', 6379);
        const password = cfg.get<string>('REDIS_PASSWORD');
        const username = cfg.get<string>('REDIS_USERNAME');
        const db = cfg.get<number>('REDIS_DB', 0);
        const tls = cfg.get<boolean>('REDIS_TLS') ? {} : undefined;

        return new IORedis({
          host,
          port,
          password,
          username,
          db,
          tls,
          ...commonOpts,
        });
      },
    },
  ],
  exports: [REDIS_CONNECTION],
})
export class RedisModule {}
