import { Injectable } from '@nestjs/common';
import { ChecklistRule } from '@voiceguard/shared';

/**
 * Stub service providing hardcoded checklist rules.
 * Replace with a real DB-backed rule loader once Epic 5 (Story 5.1)
 * delivers the rule builder. Only change this service — no call sites change.
 */
@Injectable()
export class ChecklistRuleService {
  getActiveRules(): ChecklistRule[] {
    return [
      {
        id: 'rule-001',
        requiredPhrase: 'I am recording this call for quality assurance',
        points: 30,
        isCriticalFail: true,
      },
      {
        id: 'rule-002',
        requiredPhrase: 'you can cancel at any time',
        points: 20,
        isCriticalFail: false,
      },
      {
        id: 'rule-003',
        requiredPhrase: 'do you have any questions',
        points: 15,
        isCriticalFail: false,
      },
      {
        id: 'rule-004',
        requiredPhrase: 'I confirm your details',
        points: 20,
        isCriticalFail: false,
      },
      {
        id: 'rule-005',
        requiredPhrase: 'thank you for your time',
        points: 15,
        isCriticalFail: false,
      },
    ];
  }
}
