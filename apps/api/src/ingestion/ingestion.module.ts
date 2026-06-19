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

@Module({
  imports: [
    TypeOrmModule.forFeature([CallRecordEntity]),
    BullModule.registerQueue({ name: 'transcription' }),
    ScheduleModule.forRoot(),
    RealtimeModule,
  ],
  controllers: [WebhookController],
  providers: [
    WebhookIngestionService,
    IngestionDedupService,
    S3IngestionSource,
    S3PollCron,
  ],
  exports: [IngestionDedupService],
})
export class IngestionModule {}
