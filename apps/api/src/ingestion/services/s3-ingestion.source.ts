import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IIngestionSource, ExternalCallItem } from '../interfaces/ingestion-source.interface';

/**
 * S3IngestionSource — lists and fetches call recordings from an S3 bucket.
 * 
 * File naming convention (decided in plan §1): agentId_externalId.mp3
 * Example key: "recordings/agent-42_call-abc123.mp3"
 * If the filename doesn't match the convention, the item is skipped with a warning.
 */
@Injectable()
export class S3IngestionSource implements IIngestionSource {
  private readonly logger = new Logger(S3IngestionSource.name);
  private readonly s3Client: S3Client;
  private readonly bucket = process.env.S3_BUCKET_NAME || '';
  private readonly prefix = process.env.S3_KEY_PREFIX || 'recordings/';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async listNewItems(since: Date): Promise<ExternalCallItem[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: this.prefix,
    });

    const response = await this.s3Client.send(command);
    const contents = response.Contents || [];

    const items: ExternalCallItem[] = [];

    for (const obj of contents) {
      if (!obj.Key || !obj.LastModified) continue;
      if (obj.LastModified <= since) continue;

      const parsed = this.parseKey(obj.Key);
      if (!parsed) {
        this.logger.warn(`[S3] Skipping unrecognized key format: ${obj.Key}`);
        continue;
      }

      items.push({
        externalId: parsed.externalId,
        agentId: parsed.agentId,
        audioUrl: obj.Key, // placeholder, replaced by getAudioUrl()
        rawKey: obj.Key,
        lastModified: obj.LastModified,
      });
    }

    return items;
  }

  async getAudioUrl(item: ExternalCallItem): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: item.rawKey,
    });
    // Pre-signed URL valid for 15 minutes (NFR4: no permanent public access)
    return getSignedUrl(this.s3Client, command, { expiresIn: 900 });
  }

  /**
   * Parses S3 key to extract agentId and externalId.
   * Expected format: "<prefix>agentId_externalId.mp3"
   * e.g. "recordings/agent-42_call-abc123.mp3"
   */
  private parseKey(key: string): { agentId: string; externalId: string } | null {
    const filename = key.split('/').pop() || '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const underscoreIndex = nameWithoutExt.indexOf('_');
    if (underscoreIndex === -1) return null;

    const agentId = nameWithoutExt.substring(0, underscoreIndex);
    const externalId = nameWithoutExt.substring(underscoreIndex + 1);

    if (!agentId || !externalId) return null;
    return { agentId, externalId };
  }
}
