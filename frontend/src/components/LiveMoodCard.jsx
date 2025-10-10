import { useMemo } from 'react'

const EMOTION_EMOJI = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  angry: '😠',
  surprised: '😮',
  fearful: '😨',
  disgusted: '🤢',
}

const EMOTION_COLORS = {
  happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  sad: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  angry: 'bg-red-100 text-red-800 border-red-200',
  surprised: 'bg-purple-100 text-purple-800 border-purple-200',
  fearful: 'bg-orange-100 text-orange-800 border-orange-200',
  disgusted: 'bg-green-100 text-green-800 border-green-200',
}

export default function LiveMoodCard({ prediction }) {
  const stressLevel = useMemo(() => {
    if (!prediction?.stress_score) return 'low'
    if (prediction.stress_score > 0.7) return 'high'
    if (prediction.stress_score > 0.4) return 'moderate'
    return 'low'
  }, [prediction?.stress_score])

  const stressColor = {
    low: 'bg-green-500',
    moderate: 'bg-yellow-500',
    high: 'bg-red-500',
  }

  if (!prediction) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Current Mood</h3>
        <div className="text-center text-gray-500 py-8">
          <p>Waiting for analysis...</p>
        </div>
      </div>
    )
  }

  const { emotion, emotion_prob, stress_score, advice } = prediction

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Current Mood</h3>
      
      {/* Main emotion */}
      <div className="flex items-center justify-center mb-6">
        <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral}`}>
          <span className="text-4xl mr-3">{EMOTION_EMOJI[emotion] || '😐'}</span>
          <span className="text-xl font-semibold capitalize">{emotion}</span>
        </div>
      </div>

      {/* Emotion probabilities */}
      <div className="space-y-2 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Emotion Distribution</p>
        {Object.entries(emotion_prob || {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([em, prob]) => (
            <div key={em} className="flex items-center">
              <span className="text-sm capitalize w-20">{em}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(prob * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">
                {(prob * 100).toFixed(0)}%
              </span>
            </div>
          ))}
      </div>

      {/* Stress meter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">Stress Level</p>
          <span className={`text-sm font-semibold px-2 py-1 rounded ${stressLevel === 'low' ? 'bg-green-100 text-green-800' : stressLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
            {stressLevel.toUpperCase()}
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${stressColor[stressLevel]}`}
            style={{ width: `${(stress_score * 100).toFixed(0)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {(stress_score * 100).toFixed(1)}% stress detected
        </p>
      </div>

      {/* Advice */}
      {advice && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-primary-900">Recommendation</p>
              <p className="text-sm text-primary-800 mt-1">{advice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

