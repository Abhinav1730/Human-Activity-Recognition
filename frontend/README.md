# HAR Frontend - React Application

React + Vite + Tailwind CSS frontend for Human Activity & Mood Recognition system.

## Features

- 🎥 WebRTC camera capture
- 🧠 MediaPipe face and pose detection (client-side)
- 🔌 Real-time WebSocket communication
- 📊 Session history with visualizations
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Privacy-first design

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment:**

Create a `.env` file (optional):

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

3. **Run development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CameraCapture.jsx    # Camera & MediaPipe integration
│   │   └── LiveMoodCard.jsx     # Real-time mood display
│   ├── pages/
│   │   ├── Home.jsx             # Landing page
│   │   ├── Live.jsx             # Live session page
│   │   ├── History.jsx          # Session history
│   │   └── Settings.jsx         # User settings
│   ├── utils/
│   │   └── featureExtraction.js # MediaPipe utilities
│   ├── App.jsx                  # Main app component
│   ├── config.js                # Configuration
│   ├── index.css                # Tailwind styles
│   └── main.jsx                 # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Key Components

### CameraCapture

Handles webcam access, MediaPipe processing, and feature extraction:

```jsx
<CameraCapture 
  onFeatures={(features) => console.log(features)}
  isActive={true}
/>
```

### LiveMoodCard

Displays real-time emotion and stress analysis:

```jsx
<LiveMoodCard prediction={predictionData} />
```

## Configuration

Edit `src/config.js` to customize:

- API endpoints
- WebSocket URLs
- Feature extraction intervals
- Detection confidence thresholds

## Browser Requirements

- Modern browser with WebRTC support
- Camera access permissions
- WebSocket support

## License

MIT

