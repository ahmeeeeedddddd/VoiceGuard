import { IsString, IsUrl, IsOptional, IsObject } from 'class-validator';

export class WebhookIngestDto {
  @IsString()
  externalCallId!: string;

  @IsString()
  agentId!: string;

  @IsUrl()
  audioUrl!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
