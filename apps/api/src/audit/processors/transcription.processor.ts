import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';
import { ISttProvider, STT_PROVIDER_TOKEN } from '../stt/stt.interface';
import { AuditStatus } from '@voiceguard/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

@Processor('transcription')
export class TranscriptionProcessor {
  private readonly logger = new Logger(TranscriptionProcessor.name);

  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRecordRepo: Repository<CallRecordEntity>,
    @Inject(STT_PROVIDER_TOKEN)
    private readonly sttProvider: ISttProvider,
    @InjectQueue('validation')
    private readonly validationQueue: Queue,
  ) {}

  @Process('transcribe-call')
  async handleTranscription(job: Job<{ callId: string }>) {
    const { callId } = job.data;
    this.logger.log(`[Transcription] Starting job for callId=${callId}`);

    const record = await this.callRecordRepo.findOne({ where: { id: callId } });
    if (!record) {
      this.logger.error(`[Transcription] CallRecord not found: ${callId}`);
      return;
    }

    // Mark as PROCESSING
    record.status = AuditStatus.PROCESSING;
    await this.callRecordRepo.save(record);

    try {
      const transcript = await this.sttProvider.transcribe(record.audioUrl);

      record.transcript = transcript;
      record.transcribedAt = new Date();
      record.status = AuditStatus.TRANSCRIBED;
      await this.callRecordRepo.save(record);

      this.logger.log(`[Transcription] Completed for callId=${callId}. Enqueueing validation.`);
      await this.validationQueue.add('validate-call', { callId });
    } catch (err) {
      this.logger.error(`[Transcription] Failed for callId=${callId}: ${err.message}`);
      record.status = AuditStatus.FAILED;
      await this.callRecordRepo.save(record);
      throw err; // Re-throw so BullMQ applies retry policy
    }
  }
}
