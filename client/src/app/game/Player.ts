import { TimeService } from './time.service';
import {
  canvasWidth,
  canvasHeight,
  modelWidth,
  modelHeight,
  modelHipCoords,
  modelTorsoLength,
  modelLimbLength,
} from './constants';
import { positions } from './positions';
import { calculateTimeToAnimate, drawLine, findEndPoint } from './helpers';
export type Degree = number;
export type Coordinate = { x: number; y: number };
export type ModelPosition = {
  rightShoulder: Degree;
  rightElbow: Degree;
  rightHip: Degree;
  rightKnee: Degree;
  leftShoulder: Degree;
  leftElbow: Degree;
  leftHip: Degree;
  leftKnee: Degree;
  waist: Degree;
};
export type Status = keyof typeof positions;
export type Direction = 'left' | 'right';

/**
 * @description the rate at which the character should move given their status (pixels per second)
 */

enum Rates {
  /**
   * @description 50 pixels per second
   */
  ExtraSlow = 50,
  /**
   * @description 100 pixels per second
   */
  Slow = 100,
  /**
   * @description 200 pixles per second
   */
  Medium = 200,
  /**
   * @description 300 pixles per second
   */
  Fast = 300,
  /**
   * @description 500 pixels per second
   */
  ExtraFast = 500,
}

const movement = {
  forward: { left: -Rates.Slow, right: Rates.Slow },
  backward: { left: Rates.Slow, right: -Rates.Slow },
  righthit: { left: 0, right: 0 },
  lefthit: { left: 0, right: 0 },
  block: { left: 0, right: 0 },
  isHit: { left: 0, right: 0 },
  dead: { left: 0, right: 0 },
  none: { left: 0, right: 0 },
};

/**
 * @description used to model each player
 */
export class Player {
  constructor(
    player: number,
    private readonly timeService: TimeService,
  ) {
    this.health = 1000;
    this.stamina = 100;
    this.status = 'none';
    if (player === 1) {
      this.x = 0;
      this.direction = 'right';
      this.color = 'blue';
      this.trueColor = 'blue';
    } else {
      this.x = canvasWidth - modelWidth;
      this.direction = 'left';
      this.trueColor = 'red';
      this.color = 'red';
    }
    this.model = new OffscreenCanvas(modelWidth, modelHeight);
    this.modelctx = this.model.getContext('2d')!;
    this.modelDestination = { ...positions[this.status][this.direction] };
    this.modelPosition = { ...positions[this.status][this.direction] };
    this.locked = false;
    this.animationStatus = 'none';
    this.modelHandXCoordinates = { left: 0, right: 0 };
    this.forwardLocked = false;
    this.backwardLocked = false;
  }
  private health: number;
  private stamina: number;
  private status: Status; // used to determine what state the character
  private animationStatus: Status; //usually reflects status, is used primarily to return the user to the 'none' animation position
  private direction: Direction;
  private locked: boolean; // if true the user cannot change the current status
  private forwardLocked: boolean; // if true the user cannot change the current status
  private backwardLocked: boolean; // if true the user cannot change the current status
  private x: number; // the characters x position
  private color: string;
  private trueColor: 'red' | 'blue';
  private model: OffscreenCanvas;
  private modelctx: OffscreenCanvasRenderingContext2D;
  private modelDestination: ModelPosition; // the characters animation destination
  private modelPosition: ModelPosition;
  private modelHandXCoordinates: { left: number; right: number }; // used for hit detection
  private faceCanvas?: OffscreenCanvas;

  private modelRates = {
    rightHip: Rates.Slow,
    rightElbow: Rates.Fast,
    rightKnee: Rates.Slow,
    rightShoulder: Rates.Fast,
    leftHip: Rates.Slow,
    leftElbow: Rates.Fast,
    leftKnee: Rates.Slow,
    leftShoulder: Rates.Fast,
    waist: Rates.Slow,
    reset() {
      this.rightHip = Rates.Slow;
      this.rightElbow = Rates.Fast;
      this.rightKnee = Rates.Slow;
      this.rightShoulder = Rates.Fast;
      this.leftHip = Rates.Slow;
      this.leftElbow = Rates.Fast;
      this.leftKnee = Rates.Slow;
      this.leftShoulder = Rates.Fast;
      this.waist = Rates.Slow;
    },
  };

  getModelHandXCoordinates(): { left: number; right: number } {
    return this.modelHandXCoordinates;
  }

  getModelPosition(): ModelPosition {
    return { ...this.modelPosition };
  }
  getStamina(): number {
    return this.stamina;
  }
  decrementStamina(value: number) {
    const toBeStamina = this.stamina - value;
    if (toBeStamina < 0) {
      this.stamina = 0;
      return;
    }
    this.stamina = toBeStamina;
  }
  getHealth(): number {
    return this.health;
  }
  getX(): number {
    return this.x;
  }
  setX(x: number) {
    this.x = x;
  }
  getDirection(): Direction {
    return this.direction;
  }
  setDirection(direction: Direction): void {
    this.direction = direction;
  }
  setFace(face: OffscreenCanvas) {
    this.faceCanvas = face;
  }
  getStatus() {
    return this.status;
  }
  isValidNewStatus(status: Status) {
    if (!status) return false;
    if (this.locked) return false;
    if (this.status === status) return false;
    if (this.status === 'dead') return false;
    return true;
  }
  setStatus(status: Status): boolean {
    if (!status) return false;
    if (this.locked) return false;
    if (this.status === status) return false;
    if (this.status === 'dead') {
      this.setAnimationStatus('dead');
      return false;
    }
    this.status = status;
    this.setAnimationStatus(status);

    if (status === 'block') {
      this.modelRates.leftShoulder = Rates.ExtraFast;
      this.modelRates.rightShoulder = Rates.ExtraFast;
    }
    if (status === 'lefthit') {
      this.modelRates.leftShoulder = Rates.ExtraFast;
      this.modelRates.leftElbow = Rates.ExtraFast;
      this.decrementStamina(20);
      this.lock();
      setTimeout(() => {
        this.modelRates.reset();
        this.setAnimationStatus('none');
      }, 200);
      setTimeout(() => {
        this.unlock();
        this.setStatus('none');
      }, 500);
    }
    if (status === 'righthit') {
      this.modelRates.rightShoulder = Rates.ExtraFast;
      this.modelRates.rightElbow = Rates.ExtraFast;
      this.decrementStamina(20);
      this.lock();
      setTimeout(() => {
        this.modelRates.reset();
        this.setAnimationStatus('none');
      }, 200);
      setTimeout(() => {
        this.unlock();
        this.setStatus('none');
      }, 500);
    }
    return true;
  }

  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
  forwardLock() {
    this.forwardLocked = true;
  }
  forwardUnlock() {
    this.forwardLocked = false;
  }

  backwardLock() {
    this.backwardLocked = true;
  }
  backwardUnlock() {
    this.backwardLocked = false;
  }
  hitConnected() {
    this.status = 'none';
    this.setAnimationStatus('none');
  }
  gotHit(otherStamina: number) {
    const staminaMultiplier = (100 - this.stamina + otherStamina) / 2;
    const blockMultipler = this.status === 'block' ? 110 : 0;
    const damageToTake = 10 + staminaMultiplier - blockMultipler;
    this.color = 'purple';
    setTimeout(() => {
      this.color = this.trueColor;
    }, 100);
    this.health -= damageToTake > 0 ? damageToTake : 0;
    if (this.status === 'block') {
      return;
    }
    if (!this.backwardLocked) {
      this.x += this.direction === 'left' ? 10 : -10;
    }
    if (this.health < 0) {
      this.health = 0;
      this.status = 'dead';
      this.setAnimationStatus('dead');
      return;
    }
    this.unlock();
    this.modelRates.reset();
    this.setStatus('isHit');
    this.lock();
    setTimeout(
      () => {
        this.modelRates.waist = Rates.ExtraSlow;
        this.setAnimationStatus('none');
        setTimeout(
          () => {
            this.unlock();
            this.setStatus('none');
            this.modelRates.reset();
          },
          calculateTimeToAnimate(this.modelPosition.waist, this.modelDestination.waist, this.modelRates.waist),
        );
      },
      calculateTimeToAnimate(this.modelPosition.waist, this.modelDestination.waist, this.modelRates.waist),
    );
  }

  update(ctx: CanvasRenderingContext2D): void {
    this.modelctx.clearRect(0, 0, this.model.width, this.model.height);
    this.modelctx.strokeStyle = this.color;
    this.updateModel();
    ctx.drawImage(this.model, this.x, canvasHeight - modelHeight);

    if (this.status === 'none' && this.stamina < 100) {
      this.stamina += 40 * this.timeService.deltaTime;
    }
    if (this.status === 'backward' && this.stamina < 100) {
      this.stamina += 40 * this.timeService.deltaTime;
    }
    if (this.status === 'forward' && this.stamina < 100) {
      this.stamina += 40 * this.timeService.deltaTime;
    }
    if (this.status === 'block') {
      this.decrementStamina(4 * this.timeService.deltaTime);
    }
    if (this.locked) {
      return;
    }
    if (this.forwardLocked) {
      if (this.status === 'forward') {
        return;
      }
    }
    if (this.backwardLocked) {
      if (this.status === 'backward') {
        return;
      }
    }
    this.x += Math.round(movement[this.status][this.direction] * this.timeService.deltaTime);
  }

  private setAnimationStatus(status: Status) {
    this.animationStatus = status;
    this.modelDestination = { ...positions[status][this.direction] };
  }

  private updateModel() {
    this.stepModelAnimation();

    //draw torso
    const shoulderCoords = this.drawLimb(modelHipCoords, this.modelPosition.waist, modelTorsoLength);

    //draw head
    if (this.faceCanvas) {
      this.modelctx.drawImage(
        this.faceCanvas,
        shoulderCoords.x - this.faceCanvas.width / 2,
        shoulderCoords.y - this.faceCanvas.height,
      );
    }

    //draw upperLeg
    const rightKneeCoords = this.drawLimb(modelHipCoords, this.modelPosition.rightHip, modelLimbLength);

    const leftKneeCoords = this.drawLimb(modelHipCoords, this.modelPosition.leftHip, modelLimbLength);

    const rightFootCoords = this.drawLimb(rightKneeCoords, this.modelPosition.rightKnee, modelLimbLength);

    const leftFootCoords = this.drawLimb(leftKneeCoords, this.modelPosition.leftKnee, modelLimbLength);

    const rightElbowCoords = this.drawLimb(shoulderCoords, this.modelPosition.rightShoulder, modelLimbLength);

    const leftElbowCoords = this.drawLimb(shoulderCoords, this.modelPosition.leftShoulder, modelLimbLength);

    const rightHandCoords = this.drawLimb(rightElbowCoords, this.modelPosition.rightElbow, modelLimbLength);

    const leftHandCoords = this.drawLimb(leftElbowCoords, this.modelPosition.leftElbow, modelLimbLength);
    this.modelHandXCoordinates.left = leftHandCoords.x;
    this.modelHandXCoordinates.right = rightHandCoords.x;
  }

  private drawLimb(c1: Coordinate, angle: Degree, length: number) {
    const endOfLimb = findEndPoint(c1, angle, length);
    drawLine(this.modelctx, c1, endOfLimb);
    return endOfLimb;
  }

  /**
   * @description moves the current model one step closer to the models current destination
   */
  private stepModelAnimation() {
    const rightShoulder = this.stepDegree('rightShoulder');
    const rightHip = this.stepDegree('rightHip');
    const rightElbow = this.stepDegree('rightElbow');
    const rightKnee = this.stepDegree('rightKnee');
    const leftShoulder = this.stepDegree('leftShoulder');
    const leftHip = this.stepDegree('leftHip');
    const leftElbow = this.stepDegree('leftElbow');
    const leftKnee = this.stepDegree('leftKnee');
    const waist = this.stepDegree('waist');
    const allAnimationsDone =
      rightShoulder && rightHip && rightElbow && rightKnee && leftShoulder && leftHip && leftElbow && leftKnee && waist;

    // all for walking animation 👍
    if (this.animationStatus === 'forward' && allAnimationsDone) {
      //handle forward
      this.setAnimationStatus('none');
      return;
    }

    if (this.animationStatus === 'backward' && allAnimationsDone) {
      //handle forward
      this.setAnimationStatus('none');
      return;
    }

    if (this.animationStatus === 'none' && allAnimationsDone) {
      //handle none
      if (this.status === 'forward') {
        this.setAnimationStatus('forward');
        return;
      }
      if (this.status === 'backward') {
        this.setAnimationStatus('backward');
        return;
      }
    }
  }

  private stepDegree(joint: keyof ModelPosition): boolean {
    const rate = this.modelRates[joint] * this.timeService.deltaTime;

    if (this.modelPosition[joint] == this.modelDestination[joint]) {
      return true;
    }
    if (this.modelPosition[joint] < this.modelDestination[joint]) {
      if (this.modelPosition[joint] + rate > this.modelDestination[joint]) {
        this.modelPosition[joint] = this.modelDestination[joint];
        return true;
      }
      this.modelPosition[joint] += rate;
    } else if (this.modelPosition[joint] > this.modelDestination[joint]) {
      if (this.modelPosition[joint] - rate < this.modelDestination[joint]) {
        this.modelPosition[joint] = this.modelDestination[joint];
        return true;
      }

      this.modelPosition[joint] -= rate;
    }
    return false;
  }
}
