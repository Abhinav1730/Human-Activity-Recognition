import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture'
import LiveMoodCard from '../components/LiveMoodCard'
import config from '../config'

export default function Live() {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [startTime, setStartTime] = useState(null)
  const [duration, setDuration] = useState(0)
  
  const wsRef = useRef(null)
  const featureQueueRef = useRef([])
  const sendIntervalRef = useRef(null)

  // Timer
  useEffect(() => {
    if (!isActive || !startTime) return

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, startTime])

  // Start session
  const startSession = async () => {
    setIsConnecting(true)
    try {
      // Create session via REST API
      const response = await fetch(`${config.apiUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: null,
          meta: {
            browser: navigator.userAgent,
            device: 'web'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      const sid = data.session_id

      setSessionId(sid)
      
      // Connect WebSocket
      connectWebSocket(sid)
      
      setIsActive(true)
      setStartTime(Date.now())
      
      // Start sending features periodically
      sendIntervalRef.current = setInterval(() => {
        sendQueuedFeatures()
      }, config.featureExtraction.extractionIntervalMs)
      
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start session. Make sure the backend is running.')
      setIsConnecting(false)
    }
  }

  // Connect WebSocket
  const connectWebSocket = (sid) => {
    const ws = new WebSocket(`${config.wsUrl}/ws/${sid}`)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      setConnectionStatus('connected')
      setIsConnecting(false)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'prediction') {
          setPrediction(data)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionStatus('error')
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setConnectionStatus('disconnected')
    }
    
    wsRef.current = ws
  }

  // Handle features from camera
  const handleFeatures = useCallback((features) => {
    featureQueueRef.current.push(features)
  }, [])

  // Send queued features
  const sendQueuedFeatures = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    if (featureQueueRef.current.length === 0) return

    // Get latest features
    const features = featureQueueRef.current[featureQueueRef.current.length - 1]
    featureQueueRef.current = []

    // Send via WebSocket
    wsRef.current.send(JSON.stringify({
      type: 'features',
      timestamp: Date.now(),
      features
    }))
  }

  // End session
  const endSession = async () => {
    setIsActive(false)
    
    // Stop sending features
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current)
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    // End session via REST API
    if (sessionId) {
      try {
        await fetch(`${config.apiUrl}/api/v1/sessions/${sessionId}/end`, {
          method: 'POST'
        })
        navigate('/history')
      } catch (error) {
        console.error('Error ending session:', error)
      }
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Session</h1>
          <p className="text-gray-600 mt-1">Real-time emotion and stress analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          {isActive && (
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-gray-900">
                {formatDuration(duration)}
              </div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
          )}
          {!isActive ? (
            <button
              onClick={startSession}
              disabled={isConnecting}
              className="btn-primary"
            >
              {isConnecting ? 'Starting...' : 'Start Session'}
            </button>
          ) : (
            <button
              onClick={endSession}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Connection status */}
      {isActive && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
          connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-green-600' :
              connectionStatus === 'error' ? 'bg-red-600' :
              'bg-yellow-600'
            }`}></div>
            {connectionStatus === 'connected' ? 'Connected to server' :
             connectionStatus === 'error' ? 'Connection error' :
             'Connecting...'}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Camera */}
        <div className="md:col-span-2">
          {isActive ? (
            <CameraCapture onFeatures={handleFeatures} isActive={isActive} />
          ) : (
            <div className="card h-96 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Click "Start Session" to begin</p>
                <p className="text-sm mt-2">Camera access will be requested</p>
              </div>
            </div>
          )}
        </div>

        {/* Mood display */}
        <div>
          <LiveMoodCard prediction={prediction} />
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3 text-sm text-blue-800">
            <p className="font-medium">Privacy Notice</p>
            <p className="mt-1">
              Your video is processed locally in the browser. Only anonymized facial landmarks 
              and pose keypoints are sent to the server for analysis. No video is stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

