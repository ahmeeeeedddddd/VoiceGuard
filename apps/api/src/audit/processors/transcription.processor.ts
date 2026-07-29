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
import { VadService } from '../services/vad.service';

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
    private readonly vadService: VadService,
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
      // Run VAD preprocessing first to strip silence
      const vadResult = await this.vadService.processAudio(record.audioUrl);
      const processedAudioUrl = vadResult.outputPath;
      const segments = vadResult.segments;
      
      const transcript = await this.sttProvider.transcribe(processedAudioUrl);

      // Re-map timestamps back to original audio based on the segments offsets
      if (segments && segments.length > 0 && transcript.words) {
        for (const word of transcript.words) {
          // Find which new segment this word falls into
          // Since there might be some overlap or words spanning boundaries,
          // we find the segment that contains the start time or is closest.
          let matchedSegment = segments.find(s => word.startMs >= s.newStartMs && word.startMs <= s.newEndMs);
          
          if (!matchedSegment) {
            // Fallback: just use the last one if it goes slightly over
            matchedSegment = segments[segments.length - 1];
          }

          // Calculate offset: how much was original time shifted?
          // offset = originalStartMs - newStartMs
          const offsetMs = matchedSegment.originalStartMs - matchedSegment.newStartMs;

          word.startMs += offsetMs;
          word.endMs += offsetMs;
        }
      }

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
