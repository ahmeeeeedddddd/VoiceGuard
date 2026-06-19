import { Injectable } from '@nestjs/common';
import { CallAlertEvent } from '@voiceguard/shared';
import { CallTickerGateway } from '../gateways/call-ticker.gateway';

@Injectable()
export class AlertBroadcasterService {
  constructor(private readonly callTickerGateway: CallTickerGateway) {}

  emit(event: CallAlertEvent) {
    this.callTickerGateway.broadcastEvent(event);
  }
}
