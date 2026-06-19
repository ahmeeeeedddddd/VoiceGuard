import { Module } from '@nestjs/common';
import { CallTickerGateway } from './gateways/call-ticker.gateway';
import { AlertBroadcasterService } from './services/alert-broadcaster.service';

@Module({
  providers: [CallTickerGateway, AlertBroadcasterService],
  exports: [AlertBroadcasterService],
})
export class RealtimeModule {}
