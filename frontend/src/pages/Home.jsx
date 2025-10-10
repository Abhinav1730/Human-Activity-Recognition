import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Human Activity & Mood Recognition
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Real-time emotion and stress detection using AI-powered facial and body analysis.
          Privacy-focused, browser-based processing with actionable insights.
        </p>
        <Link to="/live" className="btn-primary text-lg px-8 py-3">
          Start Live Session
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="card">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
          <p className="text-gray-600">
            Live webcam-based emotion detection using MediaPipe and TensorFlow.js for instant feedback.
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
          <p className="text-gray-600">
            No video stored. Only anonymized features and metadata saved. Full data control.
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Actionable Insights</h3>
          <p className="text-gray-600">
            Get personalized recommendations to reduce stress and improve well-being.
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div className="card mt-12">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div className="ml-4">
              <h4 className="font-semibold">Start a Session</h4>
              <p className="text-gray-600">Grant camera access and begin real-time analysis.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div className="ml-4">
              <h4 className="font-semibold">Feature Extraction</h4>
              <p className="text-gray-600">MediaPipe extracts face and pose keypoints locally in your browser.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div className="ml-4">
              <h4 className="font-semibold">AI Analysis</h4>
              <p className="text-gray-600">Features sent to backend for emotion and stress prediction.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div className="ml-4">
              <h4 className="font-semibold">Get Insights</h4>
              <p className="text-gray-600">Receive real-time feedback and personalized wellness recommendations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="ml-4">
            <h3 className="font-semibold text-green-900">Privacy Commitment</h3>
            <p className="text-green-800 mt-1">
              Your video never leaves your device. We only process anonymized facial landmarks 
              and pose keypoints. You can delete all your data at any time from Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

