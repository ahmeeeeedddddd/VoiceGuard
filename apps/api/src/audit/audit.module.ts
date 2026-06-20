import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CallRecordEntity } from '../database/call-record.entity';
import { ChecklistRuleEntity } from '../database/checklist-rule.entity';
import { DeepgramProvider } from './stt/deepgram.provider';
import { WhisperProvider } from './stt/whisper.provider';
import { STT_PROVIDER_TOKEN } from './stt/stt.interface';
import { TranscriptionProcessor } from './processors/transcription.processor';
import { ValidationProcessor } from './processors/validation.processor';
import { ChecklistValidatorService } from './services/checklist-validator.service';
import { ChecklistRuleService } from './services/checklist-rule.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { WorkspaceController } from './controllers/workspace.controller';
import { ChecklistRuleController } from './controllers/checklist-rule.controller';
import { WorkspaceService } from './services/workspace.service';

const sttProvider = process.env.STT_PROVIDER === 'whisper'
  ? { provide: STT_PROVIDER_TOKEN, useClass: WhisperProvider }
  : { provide: STT_PROVIDER_TOKEN, useClass: DeepgramProvider };

@Module({
  imports: [
    TypeOrmModule.forFeature([CallRecordEntity, ChecklistRuleEntity]),
    BullModule.registerQueue({ name: 'transcription' }),
    BullModule.registerQueue({ name: 'validation' }),
    RealtimeModule,
  ],
  controllers: [WorkspaceController, ChecklistRuleController],
  providers: [
    sttProvider,
    ChecklistRuleService,
    ChecklistValidatorService,
    TranscriptionProcessor,
    ValidationProcessor,
    WorkspaceService,
  ],
  exports: [WorkspaceService, ChecklistValidatorService],
})
export class AuditModule {}
