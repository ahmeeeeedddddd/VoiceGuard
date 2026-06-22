export interface ChecklistRule {
  id: string;
  name: string;
  description?: string;
  requiredPhrase: string;
  points: number;
  isCriticalFail: boolean;
}

export interface ChecklistResult {
  ruleId: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  matchedAtMs?: number;
  aiReasoning?: string;
}
