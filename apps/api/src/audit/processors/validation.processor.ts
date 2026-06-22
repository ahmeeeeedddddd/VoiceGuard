import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';
import { ChecklistRuleService } from '../services/checklist-rule.service';
import { AuditAiService } from '../services/audit-ai.service';
import { AlertBroadcasterService } from '../../realtime/services/alert-broadcaster.service';
import { AuditStatus, CallAlertEvent } from '@voiceguard/shared';

@Processor('validation')
export class ValidationProcessor {
  private readonly logger = new Logger(ValidationProcessor.name);

  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRecordRepo: Repository<CallRecordEntity>,
    private readonly checklistRuleService: ChecklistRuleService,
    private readonly auditAiService: AuditAiService,
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
    const results = await this.auditAiService.auditTranscription(record.transcript.fullText, rules);
    
    // Simple risk level logic based on AI findings
    const failedResults = results.filter((r) => r.status === 'FAILED');
    const hasFailures = failedResults.length > 0;
    
    // Any critical-fail rule failing → immediate HIGH
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    const hasCriticalFail = failedResults.some((r) => {
      const rule = rules.find((rule) => rule.id === r.ruleId);
      return rule?.isCriticalFail;
    });

    if (hasCriticalFail) {
      riskLevel = 'HIGH';
    } else if (failedResults.length > (rules.length * 0.3)) {
      riskLevel = 'MEDIUM';
    }

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
