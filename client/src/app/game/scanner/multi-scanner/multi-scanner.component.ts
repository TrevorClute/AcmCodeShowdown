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

  override update() {
    if (this.offCanvas?.width && this.offCanvas.width !== this.video.nativeElement.videoWidth) {
      this.offCanvas!.width = this.video.nativeElement.videoWidth;
      this.offCanvas!.height = this.video.nativeElement.videoHeight;
    }

    this.scannerService.analyzeImage(this.video.nativeElement, 'multi').then((poses) => {
      this.draw();
      const pose = poses?.[0];
      const pose2 = poses?.[1];
      const midpoint = (this.offCanvas?.width || 2) / 2;
      if (pose) {
        const poseX = pose.keypoints[poseMap['nose']].x;
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
        const poseX2 = pose2?.keypoints[poseMap['nose']].x;
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
        const poseX = pose.keypoints[poseMap['nose']].x;
        if (poseX > midpoint) {
          this.nonePoseRight = pose;
        } else {
          this.nonePose = pose;
        }
      }
      if (pose2) {
        const poseX2 = pose2.keypoints[poseMap['nose']].x;
        if (poseX2 > midpoint) {
          this.nonePoseRight = pose2;
        } else {
          this.nonePose = pose2;
        }
      }
    });
  }
}
