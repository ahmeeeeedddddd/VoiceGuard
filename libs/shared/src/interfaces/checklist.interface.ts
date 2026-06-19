export interface ChecklistRule {
  id: string;
  requiredPhrase: string;
  points: number;
  isCriticalFail: boolean;
}

export interface ChecklistResult {
  ruleId: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  matchedAtMs?: number;
}
