export interface ExternalCallItem {
  externalId: string;
  agentId: string;
  audioUrl: string; // Will be replaced with a pre-signed URL
  rawKey: string;   // Original S3 object key, for reference
  lastModified: Date;
}

export interface IIngestionSource {
  listNewItems(since: Date): Promise<ExternalCallItem[]>;
  getAudioUrl(item: ExternalCallItem): Promise<string>;
}

export const INGESTION_SOURCE_TOKEN = 'INGESTION_SOURCE';
