import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';
import { AuditStatus } from '@voiceguard/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ManualUploadService {
  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRepository: Repository<CallRecordEntity>,
    @InjectQueue('transcription')
    private readonly transcriptionQueue: Queue,
  ) {}

  async handleUpload(file: Express.Multer.File) {
    if (!file.mimetype.includes('audio/mpeg') && !file.mimetype.includes('audio/mp3')) {
      throw new BadRequestException('Only MP3 files are supported');
    }

    // In a real app, you'd upload this to S3.
    // For this demo, we'll assume a local path or a mock URL.
    const audioUrl = `uploads/${file.filename}`; 

    const call = this.callRepository.create({
      id: uuidv4(),
      externalId: `MANUAL-${Date.now()}`,
      audioUrl,
      source: 'MANUAL_UPLOAD',
      status: AuditStatus.INGESTED,
    });

    const savedCall = await this.callRepository.save(call);

    // Trigger transcription
    await this.transcriptionQueue.add('process', {
      callId: savedCall.id,
      audioUrl: savedCall.audioUrl,
    });

    return savedCall;
  }
}
