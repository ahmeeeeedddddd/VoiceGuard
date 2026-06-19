export enum AuditStatus {
  INGESTED = 'INGESTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
export interface CallRecord {
  id: string;
  externalId: string;
  audioUrl: string;
  transcript?: string;
  score?: number;
  status: AuditStatus;
  createdAt: Date;
}
