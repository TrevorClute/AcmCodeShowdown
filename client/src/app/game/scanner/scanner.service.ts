import { Injectable } from '@angular/core';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';

// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-wasm';

@Injectable({
  providedIn: 'root',
})
export class ScannerService {
  constructor() { }

  detector: { single?: poseDetection.PoseDetector; multi?: poseDetection.PoseDetector } = {};
  stream?: MediaStream;

  async init() {
    //pre initializes camera 👍
    await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        facingMode: 'user',
      },
    });
    await tf.ready();
    const singleDetectorConfig: poseDetection.MoveNetModelConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      minPoseScore: 0.4,
    };
    const multiDetectorConfig: poseDetection.MoveNetModelConfig = {
      modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
      minPoseScore: 0.4,
    };
    this.detector.single = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      singleDetectorConfig,
    );
    this.detector.multi = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      multiDetectorConfig,
    );
  }
  async analyzeImage(
    image: HTMLVideoElement | HTMLImageElement,
    type: 'multi' | 'single' = 'single',
  ): Promise<poseDetection.Pose[] | undefined> {
    try {
      const poseData = await this.detector[type]!.estimatePoses(image);
      return poseData;
    } catch (error) {
      console.log(`error: ${error}`);
      return;
    }
  }
}
