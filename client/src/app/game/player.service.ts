import { Injectable } from '@angular/core';
import { Player, Status } from './Player';
import { TimeService } from './time.service';
import { findEndPoint, isHit } from './helpers';
import { canvasWidth, modelCenter, modelWidth } from './constants';

const directionConstant: { [key: string]: 1 | -1 } = {
  left: -1,
  right: 1,
};
@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private readonly timeService: TimeService) {
    this.blue = new Player(1, timeService);
    this.red = new Player(2, timeService);
  }
  blue: Player;
  red: Player;
  winner : 'red' | 'blue' | 'tie' = 'tie'
  isGameOver = false

  gameOver(){
    this.timeService.phase = 'gameover'
    this.isGameOver = true;
    if(this.getBlueHealth() > this.getRedHealth()){
      this.winner = 'blue'
    }
    else if(this.getRedHealth() > this.getBlueHealth()){
      this.winner = 'red'
    }
    else {
      this.winner = 'tie';
    }
  }

  setBlueStatus(status: Status) {
    this.blue.setStatus(status);
  }
  setRedStatus(status: Status) {
    this.red.setStatus(status);
  }
  getBlueHealth() {
    return Math.round(this.blue.getHealth());
  }
  getRedHealth() {
    return Math.round(this.red.getHealth());
  }
  getBlueStamina() {
    return Math.round(this.blue.getStamina());
  }
  getRedStamina() {
    return Math.round(this.red.getStamina());
  }

  reset(){
    this.blue = new Player(1,this.timeService)
    this.red = new Player(2,this.timeService)
    this.isGameOver = false;
  }

  update(ctx: CanvasRenderingContext2D) {
    this.blue.update(ctx);
    this.red.update(ctx);

    if (this.blue.getX() + modelWidth / 3 >= this.red.getX()) {
      this.blue.forwardLock();
      this.red.forwardLock();
    } else {
      this.blue.forwardUnlock();
      this.red.forwardUnlock();
    }

    if (this.blue.getX() + modelWidth * 0.4  <= 0) {
      this.blue.backwardLock();
    } else {
      this.blue.backwardUnlock();
    }
    if (this.red.getX() + modelWidth * 0.6 >= canvasWidth) {
      this.red.backwardLock();
    } else {
      this.red.backwardUnlock();
    }
    this.handleStatus[this.blue.getStatus()]('blue', 'red');
    this.handleStatus[this.red.getStatus()]('red', 'blue');
  }

  handleStatus: {
    [key in Status]: (player: 'blue' | 'red', other: 'blue' | 'red') => void;
  } = {
    none: (player: 'blue' | 'red', other: 'blue' | 'red') => {},
    lefthit: (player: 'blue' | 'red', other: 'blue' | 'red') => {
      const leftHandX = this[player].getX() + this[player].getModelHandXCoordinates().left;
      const otherCenterX = this[other].getX() + modelCenter.x;
      if (isHit(directionConstant[this[player].getDirection()], otherCenterX, leftHandX)) {
        this[player].hitConnected();
        this[other].gotHit(this[player].getStamina());
      }
    },
    righthit: (player: 'blue' | 'red', other: 'blue' | 'red') => {
      const rightHandX = this[player].getX() + this[player].getModelHandXCoordinates().right;
      const oppCenterX = this[other].getX() + modelCenter.x;
      if (isHit(directionConstant[this[player].getDirection()], oppCenterX, rightHandX)) {
        this[player].hitConnected();
        this[other].gotHit(this[player].getStamina());
      }
    },
    block: (player: 'blue' | 'red', other: 'blue' | 'red') => {},
    forward: (player: 'blue' | 'red', other: 'blue' | 'red') => {},
    backward: (player: 'blue' | 'red', other: 'blue' | 'red') => {},
    isHit: (player: 'blue' | 'red', other: 'blue' | 'red') => {},
    dead: (player: 'blue' | 'red', other: 'blue' | 'red') => {
      this.winner = other
      this.gameOver()
    },
  };
}
