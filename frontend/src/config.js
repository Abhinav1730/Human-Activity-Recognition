/**
 * Application configuration
 */

const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  
  // Feature extraction settings
  featureExtraction: {
    faceDetectionConfidence: 0.5,
    poseDetectionConfidence: 0.5,
    extractionIntervalMs: 500, // Send features every 500ms
  },
  
  // UI settings
  ui: {
    stressMeterUpdateMs: 100,
    emotionHistoryLength: 20,
  },
}

export default config

