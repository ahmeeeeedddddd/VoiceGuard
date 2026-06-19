import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { CallRecordEntity } from '../../database/call-record.entity';
import { S3IngestionSource } from '../services/s3-ingestion.source';
import { IngestionDedupService } from '../services/ingestion-dedup.service';
import { AlertBroadcasterService } from '../../realtime/services/alert-broadcaster.service';
import { AuditStatus, CallAlertEvent } from '@voiceguard/shared';

const LAST_SCAN_KEY = 'voiceguard:s3:lastScanAt';

@Injectable()
export class S3PollCron {
  private readonly logger = new Logger(S3PollCron.name);

  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRecordRepo: Repository<CallRecordEntity>,
    private readonly s3Source: S3IngestionSource,
    private readonly dedupService: IngestionDedupService,
    private readonly alertBroadcaster: AlertBroadcasterService,
    @InjectQueue('transcription') private readonly transcriptionQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Cron(process.env.S3_POLL_CRON || CronExpression.EVERY_5_MINUTES)
  async pollS3() {
    this.logger.log('[S3Poll] Starting S3 poll cycle');

    // Retrieve last watermark from Redis (survives restarts)
    const lastScanRaw = await this.redis.get(LAST_SCAN_KEY);
    const since = lastScanRaw ? new Date(lastScanRaw) : new Date(0);

    const items = await this.s3Source.listNewItems(since);
    this.logger.log(`[S3Poll] Found ${items.length} new items since ${since.toISOString()}`);

    for (const item of items) {
      try {
        // Per-item dedup check
        const existing = await this.dedupService.checkDuplicate(item.externalId);
        if (existing) {
          this.logger.debug(`[S3Poll] Skipping duplicate: externalId=${item.externalId}`);
          // Advance watermark past this item even on dedup
          await this.redis.set(LAST_SCAN_KEY, item.lastModified.toISOString());
          continue;
        }

        // Resolve pre-signed audio URL
        const audioUrl = await this.s3Source.getAudioUrl(item);

        const record = this.callRecordRepo.create({
          externalId: item.externalId,
          agentId: item.agentId,
          audioUrl,
          source: 'S3',
          status: AuditStatus.INGESTED,
          ingestedAt: new Date(),
        });

        const savedRecord = await this.callRecordRepo.save(record);
        await this.transcriptionQueue.add('transcribe-call', { callId: savedRecord.id });

        const event: CallAlertEvent = {
          type: 'CALL_INGESTED',
          callId: savedRecord.id,
          externalId: savedRecord.externalId,
          agentId: savedRecord.agentId,
          status: savedRecord.status,
          timestamp: new Date().toISOString(),
          workspaceLink: `/workspace/${savedRecord.id}`,
        };
        this.alertBroadcaster.emit(event);

        // Advance watermark per-item after successful processing
        await this.redis.set(LAST_SCAN_KEY, item.lastModified.toISOString());
        this.logger.log(`[S3Poll] Ingested callId=${savedRecord.id} (externalId=${item.externalId})`);
      } catch (err) {
        this.logger.error(`[S3Poll] Failed to process item ${item.externalId}: ${err.message}`);
        // Do NOT advance watermark on failure — item will be retried next cycle
      }
    }
  }
}
