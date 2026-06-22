import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AuditStatus } from '@voiceguard/shared';

@Entity('call_records')
export class CallRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string;

  @Column()
  audioUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  transcript?: any; // Will hold TranscriptPayload

  @Column({ type: 'float', nullable: true })
  score?: number;

  @Column({ type: 'enum', enum: AuditStatus, default: AuditStatus.INGESTED })
  status: AuditStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 50 })
  source: 'WEBHOOK' | 'S3' | 'MANUAL_UPLOAD';

  @Column({ nullable: true })
  agentId?: string;

  @Column({ type: 'timestamp', nullable: true })
  ingestedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  transcribedAt?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';

  @Column({ type: 'jsonb', nullable: true })
  overrides?: any; // Stores Record<string, { status: string; justification: string }>

  @Column({ type: 'jsonb', nullable: true })
  notes?: any; // Stores Array<{ timestamp: number; text: string }>

  @Column({ type: 'timestamp', nullable: true })
  lastAuditedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  auditedBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  aiResults?: any; // Stores Array<{ ruleId: string; status: 'PASSED' | 'FAILED'; reason: string }>

  @Column({ type: 'boolean', default: false })
  isAutomaticFail?: boolean;
}
