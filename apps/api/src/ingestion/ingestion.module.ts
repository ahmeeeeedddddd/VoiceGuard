import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { CallRecordEntity } from '../database/call-record.entity';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookIngestionService } from './services/webhook-ingestion.service';
import { IngestionDedupService } from './services/ingestion-dedup.service';
import { S3IngestionSource } from './services/s3-ingestion.source';
import { S3PollCron } from './jobs/s3-poll.cron';
import { RealtimeModule } from '../realtime/realtime.module';
import { ManualUploadController } from './controllers/manual-upload.controller';
import { ManualUploadService } from './services/manual-upload.service';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CallRecordEntity]),
    BullModule.registerQueue({ name: 'transcription' }),
    ScheduleModule.forRoot(),
    RealtimeModule,
    AuditModule,
  ],
  controllers: [WebhookController, ManualUploadController],
  providers: [
    WebhookIngestionService,
    IngestionDedupService,
    S3IngestionSource,
    S3PollCron,
    ManualUploadService,
  ],
  exports: [IngestionDedupService, ManualUploadService],
})
export class IngestionModule {}
