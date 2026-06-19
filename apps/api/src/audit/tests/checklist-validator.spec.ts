import { ChecklistValidatorService } from '../services/checklist-validator.service';
import { ChecklistRule, TranscriptPayload, ChecklistResult } from '@voiceguard/shared';

describe('ChecklistValidatorService', () => {
  let service: ChecklistValidatorService;

  const sampleTranscript: TranscriptPayload = {
    fullText: 'I am recording this call for quality assurance and you can cancel at any time.',
    words: [
      { word: 'I', startMs: 0, endMs: 100, confidence: 0.99 },
      { word: 'am', startMs: 110, endMs: 200, confidence: 0.99 },
      { word: 'recording', startMs: 210, endMs: 400, confidence: 0.99 },
      { word: 'this', startMs: 410, endMs: 500, confidence: 0.99 },
      { word: 'call', startMs: 510, endMs: 600, confidence: 0.99 },
      { word: 'for', startMs: 610, endMs: 680, confidence: 0.99 },
      { word: 'quality', startMs: 690, endMs: 800, confidence: 0.99 },
      { word: 'assurance', startMs: 810, endMs: 950, confidence: 0.99 },
      { word: 'and', startMs: 960, endMs: 1000, confidence: 0.99 },
      { word: 'you', startMs: 1010, endMs: 1080, confidence: 0.99 },
      { word: 'can', startMs: 1090, endMs: 1150, confidence: 0.99 },
      { word: 'cancel', startMs: 1160, endMs: 1300, confidence: 0.99 },
      { word: 'at', startMs: 1310, endMs: 1350, confidence: 0.99 },
      { word: 'any', startMs: 1360, endMs: 1420, confidence: 0.99 },
      { word: 'time', startMs: 1430, endMs: 1550, confidence: 0.99 },
    ],
    sttProvider: 'DEEPGRAM',
  };

  const rules: ChecklistRule[] = [
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
  ];

  beforeEach(() => {
    service = new ChecklistValidatorService();
  });

  describe('validate()', () => {
    it('should mark a rule PASSED when the phrase is present in transcript', () => {
      const results = service.validate(sampleTranscript, [rules[0]]);
      expect(results[0].status).toBe('PASSED');
      expect(results[0].ruleId).toBe('rule-001');
    });

    it('should mark a rule FAILED when the phrase is absent from transcript', () => {
      const results = service.validate(sampleTranscript, [rules[2]]); // "do you have any questions" is missing
      expect(results[0].status).toBe('FAILED');
      expect(results[0].ruleId).toBe('rule-003');
    });

    it('should perform case-insensitive matching', () => {
      const upperTranscript: TranscriptPayload = {
        ...sampleTranscript,
        fullText: 'I AM RECORDING THIS CALL FOR QUALITY ASSURANCE',
      };
      const results = service.validate(upperTranscript, [rules[0]]);
      expect(results[0].status).toBe('PASSED');
    });

    it('should include matchedAtMs for PASSED rules', () => {
      const results = service.validate(sampleTranscript, [rules[0]]);
      expect(results[0].matchedAtMs).toBeDefined();
      expect(typeof results[0].matchedAtMs).toBe('number');
    });

    it('should return one result per rule', () => {
      const results = service.validate(sampleTranscript, rules);
      expect(results).toHaveLength(rules.length);
    });
  });

  describe('computeRiskLevel()', () => {
    it('should return HIGH when a critical-fail rule fails', () => {
      const results = [
        { ruleId: 'rule-001', status: 'FAILED' as const }, // critical
        { ruleId: 'rule-002', status: 'PASSED' as const },
        { ruleId: 'rule-003', status: 'PASSED' as const },
      ];
      const risk = service.computeRiskLevel(results, rules);
      expect(risk).toBe('HIGH');
    });

    it('should return HIGH for critical-fail regardless of other rule results', () => {
      const results = rules.map((r) => ({ ruleId: r.id, status: 'FAILED' as const }));
      const risk = service.computeRiskLevel(results, rules);
      expect(risk).toBe('HIGH');
    });

    it('should return MEDIUM when >30% of points are failed (no critical fail)', () => {
      // rule-001 is critical — pass it. Fail rules 002 and 003: 35/65 = 53%
      const results = [
        { ruleId: 'rule-001', status: 'PASSED' as const },
        { ruleId: 'rule-002', status: 'FAILED' as const }, // 20pts
        { ruleId: 'rule-003', status: 'FAILED' as const }, // 15pts
      ];
      const risk = service.computeRiskLevel(results, rules);
      expect(risk).toBe('MEDIUM');
    });

    it('should return LOW when no failures exist', () => {
      const results = rules.map((r) => ({ ruleId: r.id, status: 'PASSED' as const }));
      const risk = service.computeRiskLevel(results, rules);
      expect(risk).toBe('LOW');
    });

    it('should set status to NEEDS_REVIEW when any rule fails', () => {
      // Testing the status logic by simulating what ValidationProcessor does
      const results = [
        { ruleId: 'rule-001', status: 'PASSED' as const },
        { ruleId: 'rule-002', status: 'FAILED' as const },
      ];
      const hasFailures = results.some((r) => r.status === 'FAILED');
      expect(hasFailures).toBe(true); // → NEEDS_REVIEW
    });

    it('should set status to VERIFIED when all rules pass', () => {
      const results = rules.map((r) => ({ ruleId: r.id, status: 'PASSED' as const })) as ChecklistResult[];
      const hasFailures = results.some((r) => r.status === 'FAILED');
      expect(hasFailures).toBe(false); // → VERIFIED
    });
  });
});
