import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RealtimeModule } from './realtime/realtime.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AuditModule } from './audit/audit.module';
import { CallRecordEntity } from './database/call-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'voiceguard_user',
      password: 'voiceguard_password',
      database: 'voiceguard_db',
      entities: [CallRecordEntity],
      autoLoadEntities: true,
      synchronize: true, // Disable in production
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    RealtimeModule,
    IngestionModule,
    AuditModule,
  ],
})
export class AppModule {}

