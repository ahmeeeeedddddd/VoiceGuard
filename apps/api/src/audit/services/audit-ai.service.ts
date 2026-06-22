import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChecklistRule, ChecklistResult } from '@voiceguard/shared';

@Injectable()
export class AuditAiService {
  private readonly logger = new Logger(AuditAiService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  // Fallback chain: prioritize reasoning models
  private readonly modelChain = [
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'google/gemma-4-31b-it:free',
  ];

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
  }

  private async callModel(model: string, systemPrompt: string, userPrompt: string): Promise<{ ok: boolean; status: number; result: any }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://voiceguard.ai',
        'X-Title': 'VoiceGuard AI Governance',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        reasoning: { enabled: true }
      }),
    });
    const result = await response.json();
    return { ok: response.ok, status: response.status, result };
  }

  private parseModelOutput(rawContent: string): any[] {
    const cleaned = rawContent.replace(/```json|```/g, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to extract a JSON array from the surrounding text
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error(`Model returned non-JSON: ${cleaned.slice(0, 300)}`);
      }
    }
    // Handle various wrapping structures
    if (Array.isArray(parsed)) return parsed;
    return parsed.results || parsed.audits || parsed.compliance_results || Object.values(parsed)[0] || [];
  }

  async auditTranscription(fullText: string, rules: ChecklistRule[]): Promise<ChecklistResult[]> {
    this.logger.log(`[AI_AUDIT] Starting semantic audit (${rules.length} rules, transcript: ${fullText.length} chars)`);

    const systemPrompt = `You are an expert Compliance Auditor for VoiceGuard AI.
Analyze call transcriptions against compliance rules using SEMANTIC intelligence — do NOT just match keywords.

FLEXIBLE CONTACT VERIFICATION:
If a rule requires an "email" but the agent collects a "phone number" or any other valid contact method, mark it as PASSED. The goal is ensuring the agent established a way to reach the customer.

OUTPUT FORMAT — respond with ONLY a valid JSON array, nothing else:
[
  { "ruleId": "<id>", "status": "PASSED" | "FAILED", "reason": "<explanation>" }
]

For PASSED: explain what the agent did that satisfied the rule.
For FAILED: explain exactly what was missing.`;

    const userPrompt = this.buildPrompt(fullText, rules);

    // Try each model in the fallback chain
    for (const model of this.modelChain) {
      try {
        this.logger.log(`[AI_AUDIT] Trying model: ${model}`);
        const { ok, status, result } = await this.callModel(model, systemPrompt, userPrompt);

        if (status === 429) {
          this.logger.warn(`[AI_AUDIT] Model ${model} is rate-limited (429). Trying next...`);
          continue;
        }

        if (!ok) {
          this.logger.warn(`[AI_AUDIT] Model ${model} returned error ${status}: ${result.error?.message}. Trying next...`);
          continue;
        }

        const rawContent = result.choices?.[0]?.message?.content;
        if (!rawContent) {
          this.logger.warn(`[AI_AUDIT] Model ${model} returned empty content. Trying next...`);
          continue;
        }

        this.logger.debug(`[AI_AUDIT] Raw output from ${model}: ${rawContent.slice(0, 500)}`);

        const finalResults = this.parseModelOutput(rawContent);
        this.logger.log(`[AI_AUDIT] ✅ Model ${model} succeeded. ${finalResults.filter((r: any) => r.status === 'PASSED').length}/${rules.length} rules passed.`);

        return finalResults.map((r: any) => ({
          ruleId: r.ruleId,
          status: r.status as 'PASSED' | 'FAILED' | 'PENDING',
          matchedAtMs: 0,
          aiReasoning: r.reason,
        }));

      } catch (err) {
        this.logger.warn(`[AI_AUDIT] Model ${model} threw an error: ${err.message}. Trying next...`);
        continue;
      }
    }

    // All models failed
    this.logger.error('[AI_AUDIT] All models in the chain failed. Returning PENDING fallback.');
    return rules.map((rule: any) => ({
      ruleId: rule.id,
      status: 'PENDING' as const,
      aiReasoning: 'AI audit unavailable — all models are temporarily rate-limited. Please retry shortly.',
    }));
  }

  private buildPrompt(transcript: string, rules: ChecklistRule[]): string {
    const rulesList = rules
      .map((r: any) => `- Rule ID: ${r.id}\n  Rule Name: ${r.name}\n  Requirement Description: ${r.description || r.requiredPhrase || 'N/A'}`)
      .join('\n\n');

    return `TRANSCRIPTION:
"${transcript}"

COMPLIANCE RULES TO CHECK:
${rulesList}

Return the JSON array analysis for each rule.`;
  }
}
