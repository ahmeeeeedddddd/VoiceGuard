import { Injectable } from '@nestjs/common';
import { TranscriptPayload, ChecklistRule, ChecklistResult } from '@voiceguard/shared';

@Injectable()
export class ChecklistValidatorService {
  /**
   * Runs a case-insensitive substring search of each rule's requiredPhrase
   * against the full transcript text. Links matched timestamps from word list.
   */
  validate(transcript: TranscriptPayload, rules: ChecklistRule[]): ChecklistResult[] {
    return rules.map((rule) => {
      const lowerText = transcript.fullText.toLowerCase();
      const lowerPhrase = rule.requiredPhrase.toLowerCase();
      const phraseFound = lowerText.includes(lowerPhrase);

      if (!phraseFound) {
        return { ruleId: rule.id, status: 'FAILED' } as ChecklistResult;
      }

      // Find the timestamp of the first word matching the start of the phrase
      const phraseFirstWord = lowerPhrase.split(' ')[0];
      const matchedWord = transcript.words.find(
        (w) => w.word.toLowerCase() === phraseFirstWord,
      );

      return {
        ruleId: rule.id,
        status: 'PASSED',
        matchedAtMs: matchedWord?.startMs,
      } as ChecklistResult;
    });
  }

  /**
   * Computes a provisional risk level based on checklist results + rules.
   * IMPORTANT: This is a placeholder until Epic 3 (Story 3.2) finalizes
   * the scoring formula. Do not treat as the source of truth for final reports.
   */
  computeRiskLevel(
    results: ChecklistResult[],
    rules: ChecklistRule[],
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const failedResults = results.filter((r) => r.status === 'FAILED');

    // Any critical-fail rule failing → immediate HIGH
    const hasCriticalFail = failedResults.some((r) => {
      const rule = rules.find((rule) => rule.id === r.ruleId);
      return rule?.isCriticalFail;
    });
    if (hasCriticalFail) return 'HIGH';

    // >30% of total points failed → MEDIUM
    const totalPoints = rules.reduce((sum, r) => sum + r.points, 0);
    const failedPoints = failedResults.reduce((sum, r) => {
      const rule = rules.find((rule) => rule.id === r.ruleId);
      return sum + (rule?.points ?? 0);
    }, 0);

    if (totalPoints > 0 && failedPoints / totalPoints > 0.3) return 'MEDIUM';
    return 'LOW';
  }
}
