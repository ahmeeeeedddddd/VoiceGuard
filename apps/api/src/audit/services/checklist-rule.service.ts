import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistRuleEntity } from '../../database/checklist-rule.entity';

@Injectable()
export class ChecklistRuleService {
  constructor(
    @InjectRepository(ChecklistRuleEntity)
    private ruleRepo: Repository<ChecklistRuleEntity>,
  ) {}

  async getActiveRules(): Promise<ChecklistRuleEntity[]> {
    return this.ruleRepo.find({ where: { isActive: true } });
  }

  async createRule(data: Partial<ChecklistRuleEntity>): Promise<ChecklistRuleEntity> {
    const rule = this.ruleRepo.create(data);
    return this.ruleRepo.save(rule);
  }

  async deleteRule(id: string): Promise<void> {
    await this.ruleRepo.delete(id);
  }

  async updateRule(id: string, data: Partial<ChecklistRuleEntity>): Promise<ChecklistRuleEntity> {
    const rule = await this.ruleRepo.findOneBy({ id });
    if (!rule) {
      throw new Error('Rule not found');
    }
    Object.assign(rule, data);
    return this.ruleRepo.save(rule);
  }
}
