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
}
