import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';
import { ChecklistRuleService } from './checklist-rule.service';
import { ChecklistValidatorService } from './checklist-validator.service';
import { AuditStatus } from '@voiceguard/shared';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRepository: Repository<CallRecordEntity>,
    private readonly ruleService: ChecklistRuleService,
    private readonly validatorService: ChecklistValidatorService,
  ) {}

  async getCallWithChecklist(id: string) {
    const call = await this.callRepository.findOneBy({ id });
    if (!call) throw new NotFoundException('Call not found');

    const rules = await this.ruleService.getActiveRules();
    const automatedResults = call.transcript ? this.validatorService.validate(call.transcript, rules) : [];

    return { call, rules, automatedResults };
  }

  async submitOverride(id: string, ruleId: string, status: 'PASSED' | 'FAILED', justification: string) {
    const call = await this.callRepository.findOneBy({ id });
    if (!call) throw new NotFoundException('Call not found');

    const overrides = call.overrides || {};
    overrides[ruleId] = { status, justification };
    call.overrides = overrides;

    return this.callRepository.save(call);
  }

  async addNote(id: string, timestamp: number, text: string) {
    const call = await this.callRepository.findOneBy({ id });
    if (!call) throw new NotFoundException('Call not found');

    const notes = call.notes || [];
    notes.push({ timestamp, text });
    call.notes = notes;

    return this.callRepository.save(call);
  }

  async submitAudit(id: string, auditorName: string) {
    const call = await this.callRepository.findOneBy({ id });
    if (!call) throw new NotFoundException('Call not found');

    const rules = await this.ruleService.getActiveRules();
    const automatedResults = call.transcript ? this.validatorService.validate(call.transcript, rules) : [];

    let pointsEarned = 0;
    let totalPoints = 0;
    let isAutomaticFail = false;

    const overrides = call.overrides || {};

    for (const rule of rules) {
      totalPoints += rule.points;

      // Check override first
      const override = overrides[rule.id];
      let finalStatus = 'FAILED';

      if (override) {
        finalStatus = override.status;
      } else {
        const autoResult = automatedResults.find(r => r.ruleId === rule.id);
        if (autoResult) {
          finalStatus = autoResult.status;
        }
      }

      if (finalStatus === 'PASSED') {
        pointsEarned += rule.points;
      } else if (finalStatus === 'FAILED' && rule.isCriticalFail) {
        isAutomaticFail = true;
      }
    }

    const rawScore = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0;
    call.score = Math.round(rawScore * 10) / 10; // round to 1 decimal
    call.isAutomaticFail = isAutomaticFail;
    call.status = AuditStatus.COMPLETED;
    call.lastAuditedAt = new Date();
    call.auditedBy = auditorName;

    return this.callRepository.save(call);
  }
}
