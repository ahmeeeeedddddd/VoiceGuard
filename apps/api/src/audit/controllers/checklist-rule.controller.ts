import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ChecklistRuleService } from '../services/checklist-rule.service';

@Controller('audit/checklist-rules')
export class ChecklistRuleController {
  constructor(private readonly ruleService: ChecklistRuleService) {}

  @Get()
  async getAll() {
    return this.ruleService.getActiveRules();
  }

  @Post()
  async create(
    @Body() body: { requiredPhrase: string; isCriticalFail: boolean; points: number; category: string },
  ) {
    return this.ruleService.createRule(body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ruleService.deleteRule(id);
  }
}
