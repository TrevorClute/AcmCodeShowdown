import { Injectable } from '@angular/core';
import { Player, Status } from './Player';
import { TimeService } from './time.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private readonly timeService: TimeService) {
    this.user = new Player(1, timeService);
    this.opp = new Player(2, timeService);
  }
  user!: Player;
  opp!: Player;
  update(ctx: CanvasRenderingContext2D) {
    if (this.user.getX() > this.opp.getX()) {
      this.user.setDirection("left")
      this.opp.setDirection('right')
    } else if (this.user.getX() < this.opp.getX()) {
      this.user.setDirection("right")
      this.opp.setDirection('left');
    }
    this.user.update(ctx);
    this.opp.update(ctx);
  }

  setUserStatus(status: Status) {
    this.user.setStatus(status);
  }
  setOppStatus(status: Status) {
    this.opp.setStatus(status);
  }
}
