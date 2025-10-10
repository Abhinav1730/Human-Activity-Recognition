import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    storeFrames: false,
    sendInterval: 500,
    faceDetectionConfidence: 0.5,
    poseDetectionConfidence: 0.5,
  })

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('harSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  const handleDeleteData = async () => {
    if (!confirm('Are you sure you want to delete all your session data? This cannot be undone.')) {
      return
    }
    
    alert('Data deletion would be implemented with backend API call to delete user sessions.')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Customize your HAR experience</p>
      </div>

      {/* Privacy Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <label className="font-medium text-gray-900">Store Raw Frames</label>
              <p className="text-sm text-gray-500 mt-1">
                Save video frames for detailed analysis. Requires explicit consent.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.storeFrames}
                onChange={(e) => setSettings({ ...settings, storeFrames: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDeleteData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete All My Data
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Permanently delete all your sessions, predictions, and insights.
            </p>
          </div>
        </div>
      </div>

      {/* Detection Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Detection Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Feature Send Interval: {settings.sendInterval}ms
            </label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={settings.sendInterval}
              onChange={(e) => setSettings({ ...settings, sendInterval: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              How often to send features to server for analysis
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Face Detection Confidence: {settings.faceDetectionConfidence}
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={settings.faceDetectionConfidence}
              onChange={(e) => setSettings({ ...settings, faceDetectionConfidence: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum confidence threshold for face detection
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Pose Detection Confidence: {settings.poseDetectionConfidence}
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={settings.poseDetectionConfidence}
              onChange={(e) => setSettings({ ...settings, poseDetectionConfidence: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum confidence threshold for pose detection
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Backend:</strong> FastAPI + MongoDB</p>
          <p><strong>Frontend:</strong> React + Tailwind CSS</p>
          <p><strong>ML:</strong> MediaPipe + PyTorch</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a href="https://github.com" className="text-primary-600 hover:underline text-sm">
            View on GitHub →
          </a>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          Save Settings
        </button>
      </div>
    </div>
  )
}

