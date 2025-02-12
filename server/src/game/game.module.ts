import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { SessionsService } from './sessions.service';

@Module({
  providers: [GameGateway,SessionsService]
})
export class GameModule {}
