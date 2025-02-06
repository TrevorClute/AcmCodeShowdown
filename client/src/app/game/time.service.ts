import { Injectable, ɵɵpureFunction0 } from '@angular/core';
import { Player } from './Player';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() {}
  private lastTimestamp: number = 0;
  deltaTime: number = 0;
  timeElapsed = 0;
  phase: 'pregame'|'game'|'gameover' = 'pregame'
  reset(){
    this.timeElapsed = 0;
    this.lastTimestamp = 0;
    this.deltaTime = 0;
  }
  injectDeltaTime(timestamp: number, gameLoop: () => void) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }
    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.timeElapsed += this.deltaTime;
    if(this.timeElapsed <= 10 && this.phase !== 'pregame'){
      this.phase = 'pregame'
    }else if(this.timeElapsed >= 10 && this.phase !== 'game'){
      this.phase = 'game'
    }
    else if(this.timeElapsed >= 190 && this.phase !== 'gameover'){
      this.phase = 'gameover'
    }
    gameLoop();
    this.lastTimestamp = timestamp;
  }
}
