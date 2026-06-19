import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';
import { ChecklistValidatorService } from '../services/checklist-validator.service';
import { ChecklistRuleService } from '../services/checklist-rule.service';
import { AlertBroadcasterService } from '../../realtime/services/alert-broadcaster.service';
import { AuditStatus, CallAlertEvent } from '@voiceguard/shared';

@Processor('validation')
export class ValidationProcessor {
  private readonly logger = new Logger(ValidationProcessor.name);

  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRecordRepo: Repository<CallRecordEntity>,
    private readonly checklistValidator: ChecklistValidatorService,
    private readonly checklistRuleService: ChecklistRuleService,
    private readonly alertBroadcaster: AlertBroadcasterService,
  ) {}

  @Process('validate-call')
  async handleValidation(job: Job<{ callId: string }>) {
    const { callId } = job.data;
    this.logger.log(`[Validation] Starting for callId=${callId}`);

    const record = await this.callRecordRepo.findOne({ where: { id: callId } });
    if (!record || !record.transcript) {
      this.logger.error(`[Validation] Record or transcript missing for callId=${callId}`);
      return;
    }

    const rules = await this.checklistRuleService.getActiveRules();
    const results = this.checklistValidator.validate(record.transcript, rules);
    const riskLevel = this.checklistValidator.computeRiskLevel(results, rules);

    const hasFailures = results.some((r) => r.status === 'FAILED');

    record.riskLevel = riskLevel;
    record.status = hasFailures ? AuditStatus.NEEDS_REVIEW : AuditStatus.VERIFIED;
    await this.callRecordRepo.save(record);

    this.logger.log(
      `[Validation] callId=${callId} → status=${record.status}, riskLevel=${riskLevel}`,
    );

    // Emit HIGH risk alert to the real-time dashboard (Story 4.2)
    if (riskLevel === 'HIGH') {
      const event: CallAlertEvent = {
        type: 'CALL_FLAGGED_HIGH_RISK',
        callId: record.id,
        externalId: record.externalId,
        agentId: record.agentId,
        riskLevel: 'HIGH',
        status: record.status,
        timestamp: new Date().toISOString(),
        workspaceLink: `/workspace/${record.id}`,
      };
      this.alertBroadcaster.emit(event);
      this.logger.warn(`[Validation] HIGH RISK alert emitted for callId=${callId}`);
    }
  }
}
