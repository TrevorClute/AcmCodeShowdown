import { Coordinate, Degree } from './Player';
import { Keypoint } from '@tensorflow-models/pose-detection';

/**
 * @description draws a line from point c1 to c2
 * */
export function drawLine(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  c1: Coordinate,
  c2: Coordinate,
  lineWidth:number = 3,
  lineCap:CanvasLineCap='round'
): void {
  ctx.lineWidth = lineWidth;
  ctx.lineCap = lineCap;
  ctx.beginPath();
  ctx.moveTo(c1.x, c1.y);
  ctx.lineTo(c2.x, c2.y);
  ctx.stroke();
}

export function drawCircle(ctx: OffscreenCanvasRenderingContext2D, center: Coordinate): void {
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
}

export function findEndPoint(coordinate: Coordinate, angle: Degree, distance: number): Coordinate {
  const angleRadian = (angle * Math.PI) / 180;
  const x = coordinate.x + distance * Math.cos(angleRadian);
  const y = coordinate.y + distance * Math.sin(angleRadian);
  return { x, y };
}

/**
 * @param x1 the body that is getting hit
 * @param x2 the hand that is hitting
 */
export function isHit(constant: -1 | 1, x1: number, x2: number): boolean {
  return constant * (x1 - x2) < 0;
}

/**
 * @description return the amount of time in ms it will take for an animatino to finish
 */
export function calculateTimeToAnimate(start: number, finish: number, rate: number) {
  const distance = Math.abs(start - finish);
  return (distance / rate) * 1000;
}

export function validatePoints(...points: Keypoint[]) {
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (point.score! < 0.1) {
      return false;
    }
  }
  return true;
}
