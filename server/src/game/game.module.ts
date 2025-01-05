import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  exports: [GameGateway],
  providers: [GameService],
})
export class GameModule {}
