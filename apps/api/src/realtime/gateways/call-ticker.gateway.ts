import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CallAlertEvent } from '@voiceguard/shared';

@WebSocketGateway({ namespace: 'dashboard', cors: { origin: '*' } })
export class CallTickerGateway {
  @WebSocketServer()
  server: Server;

  broadcastEvent(event: CallAlertEvent) {
    this.server.emit('call-event', event);
  }
}
