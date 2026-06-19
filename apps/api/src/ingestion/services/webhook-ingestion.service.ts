import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { CallRecordEntity } from '../../database/call-record.entity';
import { WebhookIngestDto, AuditStatus, CallAlertEvent } from '@voiceguard/shared';
import { IngestionDedupService } from './ingestion-dedup.service';
import { AlertBroadcasterService } from '../../realtime/services/alert-broadcaster.service';

@Injectable()
export class WebhookIngestionService {
  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRecordRepo: Repository<CallRecordEntity>,
    private readonly dedupService: IngestionDedupService,
    private readonly alertBroadcaster: AlertBroadcasterService,
    @InjectQueue('transcription') private readonly transcriptionQueue: Queue,
  ) {}

  async processWebhook(dto: WebhookIngestDto): Promise<{ callId: string; status: string; isDuplicate: boolean }> {
    const existing = await this.dedupService.checkDuplicate(dto.externalCallId);
    if (existing) {
      return { callId: existing.id, status: existing.status, isDuplicate: true };
    }

    const newRecord = this.callRecordRepo.create({
      externalId: dto.externalCallId,
      agentId: dto.agentId,
      audioUrl: dto.audioUrl,
      source: 'WEBHOOK',
      status: AuditStatus.INGESTED,
      ingestedAt: new Date(),
    });

    const savedRecord = await this.callRecordRepo.save(newRecord);

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

    return { callId: savedRecord.id, status: 'PROCESSING', isDuplicate: false };
  }
}
