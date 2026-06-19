import { AuditStatus } from './call.interface';
export type RealtimeEventType = 'CALL_INGESTED' | 'CALL_FLAGGED_HIGH_RISK' | 'CALL_STATUS_CHANGED';
export interface CallAlertEvent {
    type: RealtimeEventType;
    callId: string;
    externalId: string;
    agentId?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    status: AuditStatus;
    timestamp: string;
    workspaceLink: string;
}
