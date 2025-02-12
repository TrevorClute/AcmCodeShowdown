import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Host,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ScannerService } from './scanner.service';
import { animationFrames, BehaviorSubject, Subscription } from 'rxjs';
import { drawLine, validatePoints } from '../helpers';
import { TimeService } from '../time.service';
import { Status } from '../Player';
import { Keypoint, Pose } from '@tensorflow-models/pose-detection';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../player.service';
import { SocketService } from '../../socket.service';

export const poseMap = {
  nose: 0,
  left_eye: 1,
  right_eye: 2,
  left_ear: 3,
  right_ear: 4,
  left_shoulder: 5,
  right_shoulder: 6,
  left_elbow: 7,
  right_elbow: 8,
  left_wrist: 9,
  right_wrist: 10,
  left_hip: 11,
  right_hip: 12,
  left_knee: 13,
  right_knee: 14,
  left_ankle: 15,
  right_ankle: 16,
} as const;

@Component({
  selector: 'scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.css',
})
export class ScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() width = 500;
  @Input() height = 300;
  @Input() color = 'white';
  sub?: Subscription;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoCanvas') videoCanvas!: ElementRef<HTMLCanvasElement>;
  offCanvas?: OffscreenCanvas;
  offCtx?: OffscreenCanvasRenderingContext2D;
  videoCtx!: CanvasRenderingContext2D;
  nonePose?: Pose;
  faceCanvas?: OffscreenCanvas;
  faceCtx?: OffscreenCanvasRenderingContext2D;
  status: Status = 'none';
  message: { body: string; style: any } = { body: '', style: {} };

  constructor(
    readonly scannerService: ScannerService,
    readonly timeService: TimeService,
    readonly playerService: PlayerService,
    readonly socketService:SocketService
  ) { }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.nonePose = undefined;
  }

  reset() {
    this.nonePose = undefined;
    this.status = 'none';
  }

  async play() {
    this.video.nativeElement.play();
  }

  draw() {
    if (!this.offCtx || !this.offCanvas) return;
    this.offCtx.drawImage(this.video.nativeElement, 0, 0);
  }

  drawPose(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined,
    pose: Pose | undefined,
    color: string,
  ) {
    if (!ctx) return;
    if (!this.offCanvas) return;
    if (!pose) {
      this.videoCtx.drawImage(this.offCanvas, 0, 0, this.width, this.height);
      return;
    }

    ctx.strokeStyle = 'white';
    ctx.fillStyle = color;
    const leftWrist = pose.keypoints[poseMap['left_wrist']];
    const leftElbow = pose.keypoints[poseMap['left_elbow']];
    const leftShoulder = pose.keypoints[poseMap['left_shoulder']];
    const rightWrist = pose.keypoints[poseMap['right_wrist']];
    const rightElbow = pose.keypoints[poseMap['right_elbow']];
    const rightShoulder = pose.keypoints[poseMap['right_shoulder']];
    const rightHip = pose.keypoints[poseMap['right_hip']];
    const leftHip = pose.keypoints[poseMap['left_hip']];

    if (validatePoints(leftShoulder, rightShoulder, leftWrist, rightWrist, leftElbow, rightElbow, leftHip, rightHip)) {
      drawLine(ctx, leftShoulder, rightShoulder, 2);
      drawLine(ctx, leftShoulder, leftElbow, 2);
      drawLine(ctx, leftElbow, leftWrist, 2);
      drawLine(ctx, rightShoulder, rightElbow, 2);
      drawLine(ctx, rightElbow, rightWrist, 2);
      drawLine(ctx, leftShoulder, leftHip, 2);
      drawLine(ctx, rightShoulder, rightHip, 2);
      drawLine(ctx, leftHip, rightHip, 2);
      //start at 5 to ignore face points
      //stop at 13 to ignore leg points
      for (let i = 5; i < 13; i++) {
        const point = pose.keypoints[i];
        if (point.score! > 0.3) {
          ctx.roundRect(point.x - 4, point.y - 4, 8, 8, 10);
          ctx.fill();
        }
      }
    }
  }

  show() {
    if (!this.offCtx || !this.offCanvas) return;
    this.videoCtx.drawImage(this.offCanvas, 0, 0, this.width, this.height);
  }

  update() {
    if (this.offCanvas?.width && this.offCanvas.width !== this.video.nativeElement.videoWidth) {
      this.offCanvas!.width = this.video.nativeElement.videoWidth;
      this.offCanvas!.height = this.video.nativeElement.videoHeight;
    }
    this.scannerService.analyzeImage(this.video.nativeElement, 'single').then((poses) => {
      this.draw();
      const pose = poses?.[0];
      if (this.nonePose && pose) {
        this.status = this.determineStatus(pose, this.nonePose);
        //this.message.body = this.status;
      }
      this.drawPose(this.offCtx, pose, this.color);
      this.show();
    });
  }

  determineStatus(pose: Pose, nonePose: Pose): Status {
    if (!this.nonePose || (pose.score || 0) < 0.5) return this.status;

    const noneLeftShoulder = nonePose.keypoints[poseMap.left_shoulder];
    const noneRightShoulder = nonePose.keypoints[poseMap.right_shoulder];
    const leftShoulder = pose.keypoints[poseMap.left_shoulder];
    const rightShoulder = pose.keypoints[poseMap.right_shoulder];
    const leftWrist = pose.keypoints[poseMap.left_wrist];
    const rightWrist = pose.keypoints[poseMap.right_wrist];

    const noneShoulderDistance = noneLeftShoulder.x - noneRightShoulder.x;
    const shoulderDistance = leftShoulder.x - rightShoulder.x;

    if (leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y) {
      return 'block';
    }
    if (leftWrist.y < leftShoulder.y) {
      return 'lefthit';
    }
    if (rightWrist.y < rightShoulder.y) {
      return 'righthit';
    }
    if (shoulderDistance > noneShoulderDistance * 1.1) {
      return 'forward';
    }
    if (shoulderDistance < noneShoulderDistance * 0.9) {
      return 'backward';
    }
    return 'none';
  }

  async setNonePose() {
    if (this.nonePose) return;

    const pose = (await this.scannerService.analyzeImage(this.video.nativeElement))![0];
    this.nonePose = pose;
  }

  async setFace() {
    if (this.faceCanvas) return;

    const pose = (await this.scannerService.analyzeImage(this.video.nativeElement))![0];
    this.faceCanvas = new OffscreenCanvas(50, 60);
    this.faceCtx = this.faceCanvas.getContext('2d')!;
    this.faceCtx.save();
    this.faceCtx.beginPath();
    const centerX = this.faceCanvas.width / 2;
    const centerY = this.faceCanvas.height / 2;
    const radiusX = this.faceCanvas.width / 2;
    const radiusY = this.faceCanvas.height / 2;
    this.faceCtx.ellipse(centerX,centerY,radiusX,radiusY,0,0, Math.PI * 2)
    this.faceCtx.closePath()
    this.faceCtx.clip()

    const rightEar = pose.keypoints[poseMap.right_ear];
    const leftEar = pose.keypoints[poseMap.left_ear];
    const width = leftEar.x - rightEar.x;
    this.faceCtx.drawImage(
      this.offCanvas!,
      rightEar.x,
      rightEar.y - width,
      width,
      width * 1.5,
      0,
      0,
      this.faceCanvas.width,
      this.faceCanvas.height,
    );
    this.socketService.sendFace(this.faceCanvas)
    this.faceCtx.restore()
  }

  async initalScan() {
    this.setNonePose();
    this.setFace();
  }

  videoReady() {
    this.offCanvas = new OffscreenCanvas(this.video.nativeElement.videoWidth, this.video.nativeElement.videoHeight);
    this.offCtx = this.offCanvas.getContext('2d')!;
  }

  ngAfterViewInit() {
    this.videoCtx = this.videoCanvas.nativeElement.getContext('2d')!;
  }

  async ngOnInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user',
        },
      });
      this.video.nativeElement.srcObject = stream;

      //TODO
      this.sub = animationFrames().subscribe(async () => {
        if (this.timeService.phase === 'pregame') {
          this.message.body = `stand still ${(10 - this.timeService.timeElapsed).toPrecision(2)}`;
          this.update();
        } else {
          this.message.body = '';
          this.message.style = {};
          this.initalScan();
          this.update();
        }
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }
}
