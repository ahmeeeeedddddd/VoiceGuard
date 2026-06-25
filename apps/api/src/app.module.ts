import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RealtimeModule } from './realtime/realtime.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AuditModule } from './audit/audit.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CallRecordEntity } from './database/call-record.entity';
import { ChecklistRuleEntity } from './database/checklist-rule.entity';
import { UserEntity } from './database/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LogsModule } from './logs/logs.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5434', 10),
      username: process.env.DB_USER || 'voiceguard_user',
      password: process.env.DB_PASSWORD || 'voiceguard_password',
      database: process.env.DB_NAME || 'voiceguard_db',
      entities: [CallRecordEntity, ChecklistRuleEntity, UserEntity],
      autoLoadEntities: true,
      synchronize: true, // Disable in production
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`,
    }),

    RealtimeModule,
    IngestionModule,
    AuditModule,
    AnalyticsModule,
    UsersModule,
    AuthModule,
    LogsModule,
  ],
})
export class AppModule {}

