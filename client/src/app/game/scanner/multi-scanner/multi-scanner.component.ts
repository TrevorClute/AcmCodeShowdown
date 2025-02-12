import { Component } from '@angular/core';
import { poseMap, ScannerComponent } from '../scanner.component';
import { CommonModule } from '@angular/common';
import { Pose } from '@tensorflow-models/pose-detection';
import { Status } from '../../Player';

@Component({
  selector: 'multi-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-scanner.component.html',
  styleUrl: './multi-scanner.component.css',
})
export class MultiScannerComponent extends ScannerComponent {
  nonePoseRight?: Pose;
  statusRight: Status = 'none';
  faceCanvasRight?: OffscreenCanvas;
  faceCtxRight?: OffscreenCanvasRenderingContext2D;

  override reset() {
    this.nonePose = undefined;
    this.nonePoseRight = undefined;
    this.faceCanvas = undefined;
    this.faceCtx = undefined;
    this.faceCanvasRight = undefined;
    this.faceCtxRight = undefined;
    this.status = 'none';
  }

  override update() {
    if (this.offCanvas?.width && this.offCanvas.width !== this.video.nativeElement.videoWidth) {
      this.offCanvas!.width = this.video.nativeElement.videoWidth;
      this.offCanvas!.height = this.video.nativeElement.videoHeight;
    }
    const midpoint = (this.offCanvas?.width || 2) / 2;

    this.scannerService.analyzeImage(this.video.nativeElement, 'multi').then((poses) => {
      this.draw();
      const pose = poses?.[0];
      const pose2 = poses?.[1];
      if (pose) {
        const poseX = pose.keypoints[poseMap.nose].x;
        if (poseX < midpoint) {
          this.drawPose(this.offCtx, pose, 'red');
          if (this.nonePoseRight) {
            this.statusRight = this.determineStatus(pose, this.nonePoseRight);
          }
        } else {
          this.drawPose(this.offCtx, pose, 'blue');
          if (this.nonePose) {
            this.status = this.determineStatus(pose, this.nonePose);
          }
        }
      }
      if (pose2) {
        const poseX2 = pose2?.keypoints[poseMap.nose].x;
        if (poseX2 < midpoint) {
          this.drawPose(this.offCtx, pose2, 'red');
          if (this.nonePoseRight) {
            this.statusRight = this.determineStatus(pose2, this.nonePoseRight);
          }
        } else {
          this.drawPose(this.offCtx, pose2, 'blue');
          if (this.nonePose) {
            this.status = this.determineStatus(pose2, this.nonePose);
          }
        }
      }
      this.show();
    });
  }
  override async setNonePose() {
    if (this.nonePose && this.nonePoseRight) return;
    this.scannerService.analyzeImage(this.video.nativeElement, 'multi').then((poses) => {
      const pose = poses?.[0];
      const pose2 = poses?.[1];
      const midpoint = (this.offCanvas?.width || 2) / 2;
      if (pose) {
        const poseX = pose.keypoints[poseMap.nose].x;
        if (poseX < midpoint) {
          this.nonePoseRight = pose;
        } else {
          this.nonePose = pose;
        }
      }
      if (pose2) {
        const poseX2 = pose2.keypoints[poseMap.nose].x;
        if (poseX2 < midpoint) {
          this.nonePoseRight = pose2;
        } else {
          this.nonePose = pose2;
        }
      }
    });
  }
  override async setFace() {
    if (this.faceCanvas && this.faceCanvasRight) return;

    const midpoint = (this.offCanvas?.width || 2) / 2;
    this.scannerService.analyzeImage(this.video.nativeElement, 'multi').then((poses) => {
      const pose = poses?.[0];
      const pose2 = poses?.[1];
      if (pose) {
        const nose = pose.keypoints[poseMap.nose];
        const rightEar = pose.keypoints[poseMap.right_ear];
        const leftEar = pose.keypoints[poseMap.left_ear];
        const width = leftEar.x - rightEar.x;
        //right side
        if (!this.faceCanvasRight && nose.x < midpoint) {
          this.faceCanvasRight = new OffscreenCanvas(50, 60);
          this.faceCtxRight = this.faceCanvasRight.getContext('2d')!;
          this.faceCtxRight.save();
          this.faceCtxRight.beginPath();
          const centerX = this.faceCanvasRight.width / 2;
          const centerY = this.faceCanvasRight.height / 2;
          const radiusX = this.faceCanvasRight.width / 2;
          const radiusY = this.faceCanvasRight.height / 2;
          this.faceCtxRight.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          this.faceCtxRight.closePath();
          this.faceCtxRight.clip();
          this.faceCtxRight.drawImage(
            this.offCanvas!,
            rightEar.x,
            rightEar.y - width,
            width,
            width * 1.5,
            0,
            0,
            this.faceCanvasRight.width,
            this.faceCanvasRight.height,
          );
          this.faceCtxRight.restore();
        } else if (!this.faceCanvas) {
          this.faceCanvas = new OffscreenCanvas(50, 60);
          this.faceCtx = this.faceCanvas.getContext('2d')!;
          this.faceCtx.save();
          this.faceCtx.beginPath();
          const centerX = this.faceCanvas.width / 2;
          const centerY = this.faceCanvas.height / 2;
          const radiusX = this.faceCanvas.width / 2;
          const radiusY = this.faceCanvas.height / 2;
          this.faceCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          this.faceCtx.closePath();
          this.faceCtx.clip();
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
          this.faceCtx.restore();
        }
      }
      if (pose2) {
        const nose = pose2.keypoints[poseMap.nose];
        const rightEar = pose2.keypoints[poseMap.right_ear];
        const leftEar = pose2.keypoints[poseMap.left_ear];
        const width = leftEar.x - rightEar.x;
        //right side
        if (!this.faceCanvasRight && nose.x < midpoint) {
          this.faceCanvasRight = new OffscreenCanvas(50, 60);
          this.faceCtxRight = this.faceCanvasRight.getContext('2d')!;
          this.faceCtxRight.save();
          this.faceCtxRight.beginPath();
          const centerX = this.faceCanvasRight.width / 2;
          const centerY = this.faceCanvasRight.height / 2;
          const radiusX = this.faceCanvasRight.width / 2;
          const radiusY = this.faceCanvasRight.height / 2;
          this.faceCtxRight.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          this.faceCtxRight.closePath();
          this.faceCtxRight.clip();
          this.faceCtxRight.drawImage(
            this.offCanvas!,
            rightEar.x,
            rightEar.y - width,
            width,
            width * 1.5,
            0,
            0,
            this.faceCanvasRight.width,
            this.faceCanvasRight.height,
          );
          this.faceCtxRight.restore();
        } else if (!this.faceCanvas) {
          this.faceCanvas = new OffscreenCanvas(50, 60);
          this.faceCtx = this.faceCanvas.getContext('2d')!;
          this.faceCtx.save();
          this.faceCtx.beginPath();
          const centerX = this.faceCanvas.width / 2;
          const centerY = this.faceCanvas.height / 2;
          const radiusX = this.faceCanvas.width / 2;
          const radiusY = this.faceCanvas.height / 2;
          this.faceCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          this.faceCtx.closePath();
          this.faceCtx.clip();
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
          this.faceCtx.restore();
        }
      }
    });
  }
}
