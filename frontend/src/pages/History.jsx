import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import config from '../config'

export default function History() {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      fetchInsights(selectedSession._id || selectedSession.session_id)
    }
  }, [selectedSession])

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/sessions?limit=50`)
      const data = await response.json()
      setSessions(data.sessions || [])
      if (data.sessions && data.sessions.length > 0) {
        setSelectedSession(data.sessions[0])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInsights = async (sessionId) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/insights?session_id=${sessionId}`)
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error('Error fetching insights:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-yellow-600',
      sad: 'text-blue-600',
      neutral: 'text-gray-600',
      angry: 'text-red-600',
      surprised: 'text-purple-600',
    }
    return colors[emotion] || 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
        <p className="text-gray-600 mb-6">Start your first live session to see your history here</p>
        <a href="/live" className="btn-primary">
          Start Live Session
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
        <p className="text-gray-600 mt-1">Review your past sessions and insights</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sessions list */}
        <div className="md:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {sessions.map((session) => (
                <button
                  key={session.session_id || session._id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSession?.session_id === session.session_id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">
                      {formatDate(session.started_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDuration(session.duration_s)}</span>
                    {session.aggregates?.dominant_mood && (
                      <span className={`capitalize font-medium ${getEmotionColor(session.aggregates.dominant_mood)}`}>
                        {session.aggregates.dominant_mood}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session details */}
        <div className="md:col-span-2 space-y-6">
          {selectedSession && (
            <>
              {/* Summary card */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Session Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Started</p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedSession.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-semibold">
                      {formatDuration(selectedSession.duration_s)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dominant Mood</p>
                    <p className={`text-lg font-semibold capitalize ${getEmotionColor(selectedSession.aggregates?.dominant_mood)}`}>
                      {selectedSession.aggregates?.dominant_mood || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Stress</p>
                    <p className="text-lg font-semibold">
                      {selectedSession.aggregates?.stress_score
                        ? `${(selectedSession.aggregates.stress_score * 100).toFixed(0)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {insights.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
                  <div className="space-y-3">
                    {insights.map((insight, idx) => (
                      <div
                        key={insight.insight_id || idx}
                        className="p-4 bg-primary-50 border border-primary-200 rounded-lg"
                      >
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm text-primary-900">{insight.content}</p>
                              <span className="text-xs text-primary-600 ml-2">
                                {(insight.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-primary-700 mt-1">
                              {new Date(insight.generated_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.length === 0 && (
                <div className="card text-center py-8 text-gray-500">
                  <p>No insights generated for this session</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

