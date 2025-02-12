import { Injectable, ɵɵpureFunction0 } from '@angular/core';
import { Player } from './Player';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() { }
  initialTime = Date.now();
  lastTimestamp: number = 0;
  deltaTime: number = 0;
  timeElapsed = 0;
  phase: 'pregame' | 'game' | 'gameover' = 'pregame';
  reset() {
    this.timeElapsed = 0;
    this.lastTimestamp = 0;
    this.deltaTime = 0;
    this.initialTime = Date.now();
  }
  injectDeltaTime(timestamp: number, gameLoop: () => void) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }
    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.timeElapsed = (Date.now() - this.initialTime) / 1000
    if (this.timeElapsed <= 10 && this.phase !== 'pregame') {
      this.phase = 'pregame';
    } else if (this.timeElapsed >= 10 && this.phase === 'pregame') {
      this.phase = 'game';
    } else if (this.timeElapsed >= 190 && this.phase !== 'gameover') {
      this.phase = 'gameover';
    }
    gameLoop();
    this.lastTimestamp = timestamp;
  }
}
