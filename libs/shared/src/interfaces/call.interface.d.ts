export declare enum AuditStatus {
    INGESTED = "INGESTED",
    PROCESSING = "PROCESSING",
    TRANSCRIBED = "TRANSCRIBED",
    NEEDS_REVIEW = "NEEDS_REVIEW",
    VERIFIED = "VERIFIED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export interface TranscriptWord {
    word: string;
    startMs: number;
    endMs: number;
    confidence: number;
}
export interface TranscriptPayload {
    fullText: string;
    words: TranscriptWord[];
    sttProvider: 'DEEPGRAM' | 'WHISPER';
    language?: string;
}
export interface CallRecord {
    id: string;
    externalId: string;
    audioUrl: string;
    transcript?: TranscriptPayload;
    score?: number;
    status: AuditStatus;
    createdAt: Date;
    source: 'WEBHOOK' | 'S3' | 'MANUAL_UPLOAD';
    agentId?: string;
    ingestedAt?: Date;
    transcribedAt?: Date;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    overrides?: Record<string, {
        status: 'PASSED' | 'FAILED';
        justification: string;
    }>;
    notes?: Array<{
        timestamp: number;
        text: string;
    }>;
}
