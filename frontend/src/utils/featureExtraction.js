/**
 * Feature extraction utilities using MediaPipe
 */
import { FaceMesh } from '@mediapipe/face_mesh'
import { Pose } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'

/**
 * Initialize MediaPipe Face Mesh
 */
export function initializeFaceMesh(onResults) {
  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    }
  })

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  faceMesh.onResults(onResults)
  return faceMesh
}

/**
 * Initialize MediaPipe Pose
 */
export function initializePose(onResults) {
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    }
  })

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  pose.onResults(onResults)
  return pose
}

/**
 * Initialize camera
 */
export function initializeCamera(videoElement, onFrame) {
  const camera = new Camera(videoElement, {
    onFrame: onFrame,
    width: 640,
    height: 480
  })
  return camera
}

/**
 * Extract face keypoints from MediaPipe results
 */
export function extractFaceKeypoints(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    return []
  }

  const landmarks = results.multiFaceLandmarks[0]
  
  // Flatten landmarks to [x, y, z] array
  const keypoints = landmarks.flatMap(lm => [lm.x, lm.y, lm.z])
  
  return keypoints
}

/**
 * Extract pose keypoints from MediaPipe results
 */
export function extractPoseKeypoints(results) {
  if (!results.poseLandmarks) {
    return []
  }

  const landmarks = results.poseLandmarks
  
  // Flatten landmarks to [x, y, z, visibility] array
  const keypoints = landmarks.flatMap(lm => [lm.x, lm.y, lm.z, lm.visibility || 0])
  
  return keypoints
}

/**
 * Combine face and pose features
 */
export function combineFeatures(faceKeypoints, poseKeypoints) {
  return {
    face_kp: faceKeypoints,
    pose_kp: poseKeypoints,
  }
}

