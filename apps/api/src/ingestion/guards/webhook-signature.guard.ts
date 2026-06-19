import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-voiceguard-signature'];

    if (!signature || typeof signature !== 'string') {
      throw new UnauthorizedException('Missing or invalid signature header');
    }

    // In a real app, this secret would be dynamically loaded per-client or via ConfigService
    const secret = process.env.WEBHOOK_SECRET || 'test-secret';
    
    // Compute HMAC
    const payload = JSON.stringify(request.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
