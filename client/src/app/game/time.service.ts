import { Injectable } from '@angular/core';
import { Player } from './Player';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() {}
  lastTimestamp: number = 0;
  deltaTime: number = 0;
  timeElapsed = 0;
  injectDeltaTime(timestamp: number, gameLoop: () => void) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }
    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.timeElapsed += this.deltaTime;
    gameLoop();
    this.lastTimestamp = timestamp;
  }
}
