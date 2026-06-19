import { Controller, Post, Body, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { WebhookIngestDto } from '@voiceguard/shared';
import { WebhookSignatureGuard } from '../guards/webhook-signature.guard';
import { WebhookIngestionService } from '../services/webhook-ingestion.service';

@Controller('ingestion')
export class WebhookController {
  constructor(private readonly webhookService: WebhookIngestionService) {}

  @Post('webhook')
  @UseGuards(WebhookSignatureGuard)
  async handleWebhook(@Body() dto: WebhookIngestDto, @Res() res: Response) {
    const result = await this.webhookService.processWebhook(dto);

    if (result.isDuplicate) {
      return res.status(HttpStatus.OK).json({
        callId: result.callId,
        status: result.status,
        message: 'Call already ingested',
      });
    }

    return res.status(HttpStatus.ACCEPTED).json({
      callId: result.callId,
      status: result.status,
    });
  }
}
