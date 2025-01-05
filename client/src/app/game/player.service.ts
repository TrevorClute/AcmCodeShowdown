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
    if (this.user.x > this.opp.x) {
      this.user.facing = 'left';
      this.opp.facing = 'right';
    } else if (this.user.x < this.opp.x) {
      this.user.facing = 'right';
      this.opp.facing = 'left';
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
