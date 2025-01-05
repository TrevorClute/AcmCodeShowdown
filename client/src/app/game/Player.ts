import { Injectable } from '@angular/core';
import { TimeService } from './time.service';
import { canvasWidth, canvasHeight } from './globals';
import { positions } from './positions';

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
};

export type Facing = 'left' | 'right';
export type Status = 'forward' | 'backward' | 'hit' | 'none';
export type AnimationStatus = 'forward' | 'backward' | 'hit' | 'none';

const modelWidth = 120;
const modelHeight = 170;
const modelCenter: Coordinate = { x: modelWidth / 2, y: modelHeight / 2 };
const limbLength = 30;
const torsoLength = 40;
const shoulderCoords = {
  x: modelCenter.x,
  y: modelCenter.y - torsoLength * 0.2,
};
const hipCoords = {
  x: modelCenter.x,
  y: modelCenter.y + torsoLength * 0.5,
};

//degrees per second
let rates = {
  rightHip: 100,
  rightElbow: 100,
  rightKnee: 100,
  rightShoulder: 100,

  leftHip: 100,
  leftElbow: 100,
  leftKnee: 100,
  leftShoulder: 100,
};

function resetRates() {
  rates = {
    rightHip: 100,
    rightElbow: 100,
    rightKnee: 100,
    rightShoulder: 100,

    leftHip: 100,
    leftElbow: 100,
    leftKnee: 100,
    leftShoulder: 100,
  };
}

const movement = {
  forward: { left: -100, right: 100 },
  backward: { left: 50, right: -50 },
  hit: { left: 0, right: 0 },
  none: { left: 0, right: 0 },
};

export class Player {
  constructor(player: number, private readonly timeService: TimeService) {
    this.health = 1000;
    this.stamina = 100;
    this.status = 'none';
    if (player === 1) {
      this.x = 0;
      this.facing = 'right';
      this.color = 'blue';
    } else {
      this.x = canvasWidth - modelWidth;
      this.facing = 'left';
      this.color = 'red';
    }
    this.model = new OffscreenCanvas(modelWidth, modelHeight);
    this.modelctx = this.model.getContext('2d')!;
    this.modelDestination = { ...positions[this.status][this.facing] };
    this.modelPosition = { ...positions[this.status][this.facing] };
    this.locked = false;
    this.animationStatus = 'none';
  }
  health: number;
  stamina: number;
  status: Status;
  animationStatus: AnimationStatus;
  facing: Facing;
  locked: boolean;
  x: number;
  color: 'red' | 'blue';
  model: OffscreenCanvas;
  modelctx: OffscreenCanvasRenderingContext2D;
  modelDestination: ModelPosition;
  modelPosition: ModelPosition;

  update(ctx: CanvasRenderingContext2D): void {
    this.x += Math.round(
      movement[this.status][this.facing] * this.timeService.deltaTime
    );
    this.updateModel();
    ctx.drawImage(this.model, this.x, canvasHeight - modelHeight);
  }
  updateModel() {
    this.modelctx.clearRect(0, 0, this.model.width, this.model.height);
    this.modelctx.strokeStyle = this.color;
    this.stepModelAnimation();

    //draw head
    //draw torso
    this.drawLine(hipCoords, {
      x: hipCoords.x,
      y: hipCoords.y - torsoLength,
    });

    //draw upperLeg
    const rightKneeCoords = findEndPoint(
      hipCoords,
      this.modelPosition.rightHip,
      limbLength
    );
    this.drawLine(hipCoords, rightKneeCoords);

    const leftKneeCoords = findEndPoint(
      hipCoords,
      this.modelPosition.leftHip,
      limbLength
    );
    this.drawLine(hipCoords, leftKneeCoords);

    //draw lowerLeg
    const rightFootCoords = findEndPoint(
      rightKneeCoords,
      this.modelPosition.rightKnee,
      limbLength
    );
    this.drawLine(rightKneeCoords, rightFootCoords);

    const leftFootCoords = findEndPoint(
      leftKneeCoords,
      this.modelPosition.leftKnee,
      limbLength
    );
    this.drawLine(leftKneeCoords, leftFootCoords);

    //draw upperArm
    const rightElbowCoords = findEndPoint(
      shoulderCoords,
      this.modelPosition.rightShoulder,
      limbLength
    );
    this.drawLine(shoulderCoords, rightElbowCoords);

    const leftElbowCoords = findEndPoint(
      shoulderCoords,
      this.modelPosition.leftShoulder,
      limbLength
    );
    this.drawLine(shoulderCoords, leftElbowCoords);

    //draw lowerArm
    const rightHandCoords = findEndPoint(
      rightElbowCoords,
      this.modelPosition.rightElbow,
      limbLength
    );
    this.drawLine(rightElbowCoords, rightHandCoords);

    const leftHandCoords = findEndPoint(
      leftElbowCoords,
      this.modelPosition.leftElbow,
      limbLength
    );
    this.drawLine(leftElbowCoords, leftHandCoords);
  }

  drawLine(c1: Coordinate, c2: Coordinate) {
    this.modelctx.lineWidth = 2;
    this.modelctx.lineCap = 'round';
    this.modelctx.beginPath();
    this.modelctx.moveTo(c1.x, c1.y);
    this.modelctx.lineTo(c2.x, c2.y);
    this.modelctx.stroke();
  }

  stepModelAnimation() {
    const rightShoulder = this.stepDegree('rightShoulder');
    const rightHip = this.stepDegree('rightHip');
    const rightElbow = this.stepDegree('rightElbow');
    const rightKnee = this.stepDegree('rightKnee');
    const leftShoulder = this.stepDegree('leftShoulder');
    const leftHip = this.stepDegree('leftHip');
    const leftElbow = this.stepDegree('leftElbow');
    const leftKnee = this.stepDegree('leftKnee');
    const allAnimationsDone =
      rightShoulder &&
      rightHip &&
      rightElbow &&
      rightKnee &&
      leftShoulder &&
      leftHip &&
      leftElbow &&
      leftKnee;
    if (this.animationStatus == 'hit' && allAnimationsDone) {
      //return to none after hit
      setTimeout(() => {
        this.animationStatus = 'none';
        this.modelDestination = { ...positions['none'][this.facing] };
      }, 40);
      return;
    }
    if (this.animationStatus == 'forward' && allAnimationsDone) {
      //handle forward
      this.animationStatus = 'none';
      this.modelDestination = { ...positions['none'][this.facing] };
      return;
    }
    if (this.animationStatus == 'backward' && allAnimationsDone) {
      //handle forward
      this.animationStatus = 'none';
      this.modelDestination = { ...positions['none'][this.facing] };
      return;
    }
    if (this.animationStatus == 'none' && allAnimationsDone) {
      //handle none
      if (this.status == 'forward') {
        this.animationStatus = 'forward';
        this.modelDestination = { ...positions['forward'][this.facing] };
        return;
      } else if (this.status == 'backward') {
        this.animationStatus = 'backward';
        this.modelDestination = { ...positions['backward'][this.facing] };
        return;
      }
      this.status = 'none';
      this.locked = false;
    }
  }

  stepDegree(
    joint:
      | 'rightHip'
      | 'rightElbow'
      | 'rightKnee'
      | 'rightShoulder'
      | 'leftHip'
      | 'leftElbow'
      | 'leftKnee'
      | 'leftShoulder'
  ): boolean {
    const rate = rates[joint] * this.timeService.deltaTime;

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
  setStatus(status: Status) {
    if (this.locked) return;
    if (this.status == status) return;

    if (status === 'forward') {
    }
    if (status === 'hit') {
      this.locked = true;
    }
    this.status = status;
    this.animationStatus = status;
    this.modelDestination = { ...positions[status][this.facing] };
  }
}

function findEndPoint(
  coordinate: Coordinate,
  angle: Degree,
  distance: number
): Coordinate {
  const angleRadian = (angle * Math.PI) / 180;
  const x = coordinate.x + distance * Math.cos(angleRadian);
  const y = coordinate.y + distance * Math.sin(angleRadian);
  return { x, y };
}
