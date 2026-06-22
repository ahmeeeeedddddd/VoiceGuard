import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@voiceguard/shared';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
  @Get()
  @Roles(Role.ADMIN)
  async getLogs() {
    const now = new Date();
    const getPast = (ms: number) => new Date(now.getTime() - ms).toISOString();

    return [
      { timestamp: getPast(0), level: 'INFO', service: 'AUTH', requestId: 'req-af21', message: 'User admin@voiceguard.ai successfully authenticated via JWT' },
      { timestamp: getPast(5000), level: 'DEBUG', service: 'COMPLIANCE', requestId: 'job-7822', message: 'Compliance check: Call #VG-7822-X flagged for further review (Non-compliant disclaimer)' },
      { timestamp: getPast(12000), level: 'INFO', service: 'TRANSCRIPTION', requestId: 'trk-8821', message: 'Worker process #4: Completed transcription for job_id: 88219-c' },
      { timestamp: getPast(25000), level: 'WARN', service: 'TRANSCRIPTION', requestId: 'node-sys-1', message: 'Transcription Engine: High latency detected in us-east-1 region (342ms)' },
      { timestamp: getPast(45000), level: 'INFO', service: 'AUDIO', requestId: 'strm-9921', message: 'Audio Ingestion: Successfully processed 56MB multi-channel audio stream' },
      { timestamp: getPast(60000), level: 'INFO', service: 'SYSTEM', requestId: 'sys-hb-1', message: 'System Health: All microservices reported operational status (HEARTBEAT_ACK)' },
      { timestamp: getPast(120000), level: 'DEBUG', service: 'DATABASE', requestId: 'db-pool-4', message: 'Database: Connection pool optimized (active: 4, idle: 12)' },
      { timestamp: getPast(180000), level: 'INFO', service: 'AUTH', requestId: 'req-bf12', message: 'New user "Helen" registered by system administrator' },
      { timestamp: getPast(300000), level: 'ERROR', service: 'AUDIO', requestId: 'strm-1102', message: 'Ingestion Service: Failed to parse metadata for stream_id: 1102-a (Invalid codec)' },
      { timestamp: getPast(450000), level: 'DEBUG', service: 'COMPLIANCE', requestId: 'job-7821', message: 'Sensitivity Analysis: Confidence score 0.98 for "Customer Frustration" across 12s interval' },
      { timestamp: getPast(600000), level: 'INFO', service: 'SECURITY', requestId: 'sec-aud-1', message: 'Security: Periodic role permission audit completed' },
      { timestamp: getPast(1200000), level: 'INFO', service: 'SYSTEM', requestId: 'sys-boot-0', message: 'VoiceGuard Engine: Boot sequence finished. All systems Nominal.' },
      { timestamp: getPast(1500000), level: 'INFO', service: 'AI_AUDIT', requestId: 'ai-gen-82', message: 'Gemma-4 Engine: Processed "Contact Information" checklist rule.' },
      { timestamp: getPast(1505000), level: 'DEBUG', service: 'AI_AUDIT', requestId: 'ai-gen-82', message: 'Decision Log: Rule "Collect Email" marked as PASSED. Reason: "Agent successfully obtained a phone number, satisfying the primary intent of establishing a contact method."' },
      { timestamp: getPast(1510000), level: 'INFO', service: 'AI_AUDIT', requestId: 'ai-gen-82', message: 'Governance Update: Real-time compliance score adjusted to 88%.' },
    ];
  }
}
