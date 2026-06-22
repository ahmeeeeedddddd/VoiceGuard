import { Injectable, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';
import { AuditStatus } from '@voiceguard/shared';
import { v4 as uuidv4 } from 'uuid';
import { ISttProvider, STT_PROVIDER_TOKEN } from '../../audit/stt/stt.interface';

@Injectable()
export class ManualUploadService {
  private readonly logger = new Logger(ManualUploadService.name);

  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRepository: Repository<CallRecordEntity>,
    @Inject(STT_PROVIDER_TOKEN)
    private readonly sttProvider: ISttProvider,
  ) {}

  async handleUpload(file: Express.Multer.File, sourceName?: string) {
    if (!file.mimetype.includes('audio/mpeg') && !file.mimetype.includes('audio/mp3')) {
      throw new BadRequestException('Only MP3 files are supported');
    }

    const audioUrl = `uploads/${file.filename}`; 

    const call = this.callRepository.create({
      id: uuidv4(),
      externalId: `MANUAL-${Date.now()}`,
      audioUrl,
      source: (sourceName as any) || 'MANUAL_UPLOAD',
      status: AuditStatus.PROCESSING,
    });

    let savedCall = await this.callRepository.save(call);

    // Bypass queue and transcribe synchronously for immediate Deepgram feedback
    try {
      this.logger.log(`Starting real Deepgram transcription for ${savedCall.externalId}`);
      const transcript = await this.sttProvider.transcribe(savedCall.audioUrl);
      savedCall.transcript = transcript;
      savedCall.transcribedAt = new Date();
      savedCall.status = AuditStatus.TRANSCRIBED;
      savedCall = await this.callRepository.save(savedCall);
      this.logger.log(`Completed transcription for ${savedCall.externalId}`);
    } catch (err) {
      this.logger.error(`Transcription failed inline for ${savedCall.externalId}: ${err.message}`);
      savedCall.status = AuditStatus.FAILED;
      await this.callRepository.save(savedCall);
    }

    return savedCall;
  }
}

