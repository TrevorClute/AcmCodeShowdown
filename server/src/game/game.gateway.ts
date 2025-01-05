import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway(8080, { namespace: 'game' })
export class GameGateway {
  constructor(private readonly gameService: GameService) {}
  @WebSocketServer() server: Server;
}
