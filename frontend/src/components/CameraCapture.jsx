import { useEffect, useRef, useState } from 'react'
import { initializeFaceMesh, initializePose, extractFaceKeypoints, extractPoseKeypoints, combineFeatures } from '../utils/featureExtraction'

export default function CameraCapture({ onFeatures, isActive }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  
  const faceMeshRef = useRef(null)
  const poseRef = useRef(null)
  const lastFeaturesRef = useRef({ face_kp: [], pose_kp: [] })

  useEffect(() => {
    if (!isActive) return

    let stream = null
    let animationFrame = null

    async function setupCamera() {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            setIsLoading(false)
            startProcessing()
          }
        }
      } catch (err) {
        console.error('Camera access error:', err)
        setError('Camera access denied. Please allow camera permissions.')
        setIsLoading(false)
      }
    }

    function startProcessing() {
      // Initialize MediaPipe
      faceMeshRef.current = initializeFaceMesh(onFaceResults)
      poseRef.current = initializePose(onPoseResults)

      // Start processing loop
      processFrame()
    }

    async function processFrame() {
      if (!isActive || !videoRef.current) return

      try {
        // Send frame to MediaPipe
        if (faceMeshRef.current && videoRef.current.readyState === 4) {
          await faceMeshRef.current.send({ image: videoRef.current })
        }
        if (poseRef.current && videoRef.current.readyState === 4) {
          await poseRef.current.send({ image: videoRef.current })
        }
      } catch (err) {
        console.error('Processing error:', err)
      }

      // Continue loop
      animationFrame = requestAnimationFrame(processFrame)
    }

    function onFaceResults(results) {
      const faceKeypoints = extractFaceKeypoints(results)
      lastFeaturesRef.current.face_kp = faceKeypoints
      setFaceDetected(faceKeypoints.length > 0)
      
      // Draw face mesh on canvas
      drawResults(results, 'face')
      
      // Send combined features
      sendFeatures()
    }

    function onPoseResults(results) {
      const poseKeypoints = extractPoseKeypoints(results)
      lastFeaturesRef.current.pose_kp = poseKeypoints
      
      // Draw pose on canvas
      drawResults(results, 'pose')
      
      // Send combined features
      sendFeatures()
    }

    function sendFeatures() {
      const features = combineFeatures(
        lastFeaturesRef.current.face_kp,
        lastFeaturesRef.current.pose_kp
      )
      
      if (onFeatures && (features.face_kp.length > 0 || features.pose_kp.length > 0)) {
        onFeatures(features)
      }
    }

    function drawResults(results, type) {
      if (!canvasRef.current || !videoRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw video frame
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      // Draw landmarks
      if (type === 'face' && results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          drawLandmarks(ctx, landmarks, canvas.width, canvas.height, '#00FF00')
        }
      } else if (type === 'pose' && results.poseLandmarks) {
        drawLandmarks(ctx, results.poseLandmarks, canvas.width, canvas.height, '#FF0000')
      }
    }

    function drawLandmarks(ctx, landmarks, width, height, color) {
      ctx.fillStyle = color
      for (const landmark of landmarks) {
        const x = landmark.x * width
        const y = landmark.y * height
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    setupCamera()

    return () => {
      // Cleanup
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close()
      }
      if (poseRef.current) {
        poseRef.current.close()
      }
    }
  }, [isActive, onFeatures])

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center text-red-700">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="card relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-xl z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Initializing camera...</p>
          </div>
        </div>
      )}
      
      <div className="relative">
        <video
          ref={videoRef}
          className="hidden"
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
        />
        
        {/* Status indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            {faceDetected ? 'Face Detected' : 'No Face'}
          </span>
        </div>
      </div>
    </div>
  )
}

