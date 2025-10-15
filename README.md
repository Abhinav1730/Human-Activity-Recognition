# Human Activity & Mood Recognition (HAR) System

A real time web application that captures webcam video, extracts face/body features, predicts user mood and stress level, stores sessions in MongoDB, provides actionable insights and recommendations, and exposes a REST API for analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![React](https://img.shields.io/badge/react-18.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

- **Real-time Analysis**: Live webcam-based emotion and stress detection
- **Privacy-First**: No video storage, only anonymized features
- **ML-Powered**: PyTorch models with MediaPipe feature extraction
- **Actionable Insights**: Personalized wellness recommendations
- **Session Tracking**: Complete history and analytics
- **WebSocket Support**: Real-time bi-directional communication
- **REST API**: Full API for integrations and analytics

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                     │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐│
│  │   Camera     │→ │ MediaPipe  │→ │  Feature Extract││
│  │   Capture    │  │  (Face/Pose)│  │                 ││
│  └──────────────┘  └────────────┘  └─────────────────┘│
│         ↓                                      ↓        │
│  ┌──────────────────────────────────────────────────┐  │
│  │            WebSocket Connection                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ ↑
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI + Python)                 │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐│
│  │  WebSocket   │→ │   ML Model │→ │  Recommendation ││
│  │   Handler    │  │  (PyTorch) │  │     Engine      ││
│  └──────────────┘  └────────────┘  └─────────────────┘│
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │         MongoDB (motor - async driver)          │   │
│  │    Sessions | Predictions | Insights            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Modern browser with webcam

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Human-Activity-Recognition

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see backend/.env.example)
# Configure MONGO_URI and other settings

# Run the server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:8000
# VITE_WS_URL=ws://localhost:8000

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

#### MongoDB Setup

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install MongoDB locally
# https://www.mongodb.com/docs/manual/installation/
```

## 📁 Project Structure

```
Human-Activity-Recognition/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app & routes
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # MongoDB connection
│   │   ├── models.py          # Pydantic models
│   │   └── ml/
│   │       ├── inference.py   # ML model wrapper
│   │       └── recommendations.py  # Recommendation engine
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.jsx
│   │   │   └── LiveMoodCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Live.jsx
│   │   │   ├── History.jsx
│   │   │   └── Settings.jsx
│   │   ├── utils/
│   │   │   └── featureExtraction.js
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── models/                     # ML models directory
│   ├── README.md
│   └── training/
│
├── docker-compose.yml
└── README.md
```

## 🔌 API Documentation

### REST Endpoints

#### Sessions

```bash
# Create new session
POST /api/v1/sessions
Body: {"user_id": "optional", "meta": {...}}

# End session
POST /api/v1/sessions/{session_id}/end

# Get session details
GET /api/v1/sessions/{session_id}

# List sessions
GET /api/v1/sessions?user_id={user_id}&limit=20
```

#### Insights

```bash
# Get insights for session
GET /api/v1/insights?session_id={session_id}

# Submit feedback
POST /api/v1/feedback
Body: {"session_id": "...", "insight_id": "...", "rating": 5}
```

### WebSocket

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/{session_id}')

// Send features
ws.send(JSON.stringify({
  type: 'features',
  timestamp: Date.now(),
  features: {
    face_kp: [/* landmarks */],
    pose_kp: [/* landmarks */]
  }
}))

// Receive predictions
ws.onmessage = (event) => {
  const prediction = JSON.parse(event.data)
  // {
  //   type: 'prediction',
  //   emotion: 'neutral',
  //   emotion_prob: {...},
  //   stress_score: 0.25,
  //   advice: '...'
  // }
}
```

## 🧠 ML Models

### Current Implementation

The system uses a **mock inference** by default for demo purposes. To use real models:

1. **Train your model** (see `/models/README.md`)
2. **Save model** to `models/emotion_model.pth`
3. **Update config** in backend `.env`:
   ```
   MODEL_PATH=../models/emotion_model.pth
   MODEL_TYPE=pytorch
   ```

### Recommended Datasets

- **FER2013**: Emotion classification
- **AffectNet**: Large-scale emotion dataset
- **RAF-DB**: Real-world affective faces
- **Custom data**: Collect with user consent

See `models/README.md` for training instructions.

## 🔒 Privacy & Security

### Privacy Features

- ✅ No video storage by default
- ✅ Only anonymized keypoints stored
- ✅ Client-side feature extraction
- ✅ User can delete all data anytime
- ✅ Explicit consent for any frame storage

### Security Recommendations

- Use HTTPS/WSS in production
- Implement authentication (JWT)
- Rate limit API endpoints
- Secure MongoDB with authentication
- Use environment variables for secrets

## 🚢 Deployment

### Docker Production

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Scale backend
docker-compose up -d --scale backend=3
```

### Manual Production

#### Backend

```bash
cd backend

# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### Frontend

```bash
cd frontend

# Build for production
npm run build

# Serve with nginx or any static server
npx serve -s dist -p 80
```

### Cloud Deployment Options

- **Backend**: Heroku, AWS ECS, Google Cloud Run, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas (managed)

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:coverage
```

## 📊 Database Schemas

### Sessions Collection

```javascript
{
  "_id": ObjectId,
  "user_id": "string|null",
  "started_at": ISODate,
  "ended_at": ISODate|null,
  "duration_s": 123,
  "meta": {"browser": "...", "device": "..."},
  "aggregates": {
    "dominant_mood": "neutral",
    "stress_score": 0.28,
    "prediction_count": 150
  }
}
```

### Predictions Collection

```javascript
{
  "_id": ObjectId,
  "session_id": ObjectId,
  "timestamp": ISODate,
  "features": {
    "face_kp": [...],
    "pose_kp": [...]
  },
  "emotion_prob": {
    "happy": 0.05,
    "sad": 0.10,
    "neutral": 0.70,
    // ...
  },
  "stress_score": 0.25
}
```

### Insights Collection

```javascript
{
  "_id": ObjectId,
  "session_id": ObjectId,
  "generated_at": ISODate,
  "type": "recommendation",
  "content": "You appear stressed — take a 5-minute break",
  "confidence": 0.82
}
```

## 🛠️ Development

### Environment Variables

#### Backend (`.env`)

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=har_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:5173"]
MODEL_PATH=../models/emotion_model.pth
STORE_RAW_FRAMES=false
```

#### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Adding New Features

1. **New API endpoint**: Add route in `backend/app/main.py`
2. **New ML model**: Update `backend/app/ml/inference.py`
3. **New UI component**: Create in `frontend/src/components/`
4. **New page**: Add to `frontend/src/pages/` and update routing

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

- **Documentation**: See individual README files in `/backend` and `/frontend`
- **Issues**: Open GitHub issue
- **API Docs**: `http://localhost:8000/docs` (when running)

## 🎯 Roadmap

- [ ] Multi-user authentication
- [ ] Advanced ML models (LSTM for temporal analysis)
- [ ] Audio analysis for stress detection
- [ ] Mobile app (React Native)
- [ ] Kubernetes deployment configs
- [ ] More comprehensive test coverage
- [ ] Real-time collaboration features

---

**Built with ❤️ using FastAPI, React, and MongoDB**

