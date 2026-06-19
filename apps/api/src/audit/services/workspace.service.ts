import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallRecordEntity } from '../../database/call-record.entity';
import { ChecklistRuleService } from './checklist-rule.service';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(CallRecordEntity)
    private readonly callRepository: Repository<CallRecordEntity>,
    private readonly ruleService: ChecklistRuleService,
  ) {}

  async getCallWithChecklist(id: string) {
    const call = await this.callRepository.findOneBy({ id });
    if (!call) throw new NotFoundException('Call not found');

    const rules = await this.ruleService.getActiveRules();
    return { call, rules };
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
}
