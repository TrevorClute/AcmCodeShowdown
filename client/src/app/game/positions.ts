import { Direction, ModelPosition, Status } from './Player';

export const positions: Record<string, Record<string, ModelPosition>> = {
  none: {
    left: {
      rightShoulder: 80,
      rightElbow: -120,
      rightHip: 110,
      rightKnee: 80,
      leftShoulder: 100,
      leftElbow: -115,
      leftHip: 90,
      leftKnee: 80,
    },
    right: {
      rightShoulder: 100,
      rightElbow: -60,
      rightHip: 70,
      rightKnee: 100,
      leftShoulder: 80,
      leftElbow: -65,
      leftHip: 90,
      leftKnee: 100,
    },
  },
  lefthit: {
    left: {
      rightShoulder: 75,
      rightElbow: -125,
      rightHip: 110,
      rightKnee: 80,
      leftShoulder: 180,
      leftElbow: -180,
      leftHip: 90,
      leftKnee: 80,
    },
    right: {
      rightShoulder: 105,
      rightElbow: -55,
      rightHip: 70,
      rightKnee: 100,
      leftShoulder: 0,
      leftElbow: 0,
      leftHip: 90,
      leftKnee: 100,
    },
  },
  righthit: {
    left: {
      rightShoulder: 180,
      rightElbow: -180,
      rightHip: 110,
      rightKnee: 80,
      leftShoulder: 80,
      leftElbow: -115,
      leftHip: 90,
      leftKnee: 80,
    },
    right: {
      rightShoulder: 0,
      rightElbow: 0,
      rightHip: 70,
      rightKnee: 100,
      leftShoulder: 100,
      leftElbow: -65,
      leftHip: 90,
      leftKnee: 100,
    },
  },
  block: {
    left: {
      rightShoulder: 115,
      rightElbow: -95,
      rightHip: 110,
      rightKnee: 80,
      leftShoulder: 130,
      leftElbow: -95,
      leftHip: 90,
      leftKnee: 80,
    },
    right: {
      rightShoulder: 65,
      rightElbow: -85,
      rightHip: 70,
      rightKnee: 100,
      leftShoulder: 50,
      leftElbow: -85,
      leftHip: 90,
      leftKnee: 100,
    },
  },
  forward: {
    left: {
      rightShoulder: 80,
      rightElbow: -120,
      rightHip: 90,
      rightKnee: 80,
      leftShoulder: 100,
      leftElbow: -115,
      leftHip: 110,
      leftKnee: 80,
    },
    right: {
      rightShoulder: 100,
      rightElbow: -60,
      rightHip: 90,
      rightKnee: 100,
      leftShoulder: 80,
      leftElbow: -65,
      leftHip: 70,
      leftKnee: 100,
    },
  },
  backward: {
    left: {
      rightShoulder: 80,
      rightElbow: -120,
      rightHip: 90,
      rightKnee: 80,
      leftShoulder: 100,
      leftElbow: -115,
      leftHip: 110,
      leftKnee: 80,
    },
    right: {
      rightShoulder: 100,
      rightElbow: -60,
      rightHip: 90,
      rightKnee: 100,
      leftShoulder: 80,
      leftElbow: -65,
      leftHip: 70,
      leftKnee: 100,
    },
  },
};
