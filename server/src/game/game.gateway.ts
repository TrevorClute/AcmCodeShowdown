import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from './sessions.service';
import { Status } from './GameSession';

@WebSocketGateway({ cors: '*' })
export class GameGateway {
  @WebSocketServer() server: Server;

  constructor(private sessions: SessionsService) {}

  @SubscribeMessage('queue')
  handleQueue(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    this.sessions.joinSession(this.server, client.id);
  }

  @SubscribeMessage('status')
  handleStatusChange(@MessageBody() status: Status, @ConnectedSocket() client: Socket): boolean {
    console.log("--------------------------------------------------------");
    console.log(this.sessions.sessions);
    if (!this.sessions.getSession(client.id)) return false;
    return this.sessions.getSession(client.id).updateStatus(this.server, client.id, status);
  }

  @SubscribeMessage('face')
  Face(@MessageBody() buffer: Buffer, @ConnectedSocket() client: Socket) {
    const session = this.sessions.getSession(client.id);
    if (!session) return;
    if (!session.isFull()) return;
    if (session.blue.id === client.id) {
      this.server.to(session.red.id).emit('receive-face', buffer);
    } else if (session.red.id === client.id) {
      this.server.to(session.blue.id).emit('receive-face', buffer)
    }
  }
}
