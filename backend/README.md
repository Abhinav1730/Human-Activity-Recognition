# HAR Backend - FastAPI Server

Python FastAPI backend for Human Activity & Mood Recognition system.

## Features

- 🚀 FastAPI with async/await support
- 🔌 WebSocket for real-time predictions
- 🗄️ MongoDB with motor (async driver)
- 🧠 PyTorch-based emotion & stress detection
- 📊 REST API for sessions, insights, and analytics

## Setup

### Prerequisites

- Python 3.11+
- MongoDB (local or Atlas)
- pip or conda

### Installation

1. **Create virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Configure environment:**

Create a `.env` file:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=har_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:5173"]
```

4. **Run the server:**

```bash
# Development
uvicorn app.main:app --reload

# Or using Python directly
python -m app.main
```

The API will be available at `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

## API Endpoints

### REST API

#### Sessions

- `POST /api/v1/sessions` - Create new session
- `POST /api/v1/sessions/{id}/end` - End session
- `GET /api/v1/sessions/{id}` - Get session details
- `GET /api/v1/sessions` - List sessions

#### Insights & Feedback

- `GET /api/v1/insights?session_id={id}` - Get insights for session
- `POST /api/v1/feedback` - Submit feedback on recommendation

### WebSocket

#### Real-time Predictions

```
ws://localhost:8000/ws/{session_id}
```

**Client message:**
```json
{
  "type": "features",
  "timestamp": 1234567890,
  "features": {
    "face_kp": [0.1, 0.2, ...],
    "pose_kp": [0.3, 0.4, ...]
  }
}
```

**Server response:**
```json
{
  "type": "prediction",
  "timestamp": 1234567890,
  "emotion": "neutral",
  "emotion_prob": {
    "happy": 0.05,
    "sad": 0.10,
    "neutral": 0.70,
    "angry": 0.05,
    "surprised": 0.10
  },
  "stress_score": 0.25,
  "advice_id": "abc123",
  "advice": "You're doing well! Remember to take breaks."
}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app & routes
│   ├── config.py         # Configuration
│   ├── database.py       # MongoDB connection
│   ├── models.py         # Pydantic models
│   └── ml/
│       ├── __init__.py
│       ├── inference.py  # ML model wrapper
│       └── recommendations.py  # Rule engine
├── requirements.txt
└── README.md
```

## ML Models

The backend expects a PyTorch model at the path specified in `MODEL_PATH` (default: `../models/emotion_model.pth`).

If no model is found, the system uses **mock inference** for demo purposes.

To train your own model, see `/models/README.md`.

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app --cov-report=html
```

## Production Deployment

### Using Docker

```bash
docker build -t har-backend .
docker run -p 8000:8000 --env-file .env har-backend
```

### Using Gunicorn

```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGO_DB_NAME` | `har_db` | Database name |
| `API_HOST` | `0.0.0.0` | Server host |
| `API_PORT` | `8000` | Server port |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |
| `MODEL_PATH` | `../models/emotion_model.pth` | Path to ML model |
| `STORE_RAW_FRAMES` | `false` | Store raw frame data |

## License

MIT

