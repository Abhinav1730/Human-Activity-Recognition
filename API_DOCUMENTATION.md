# API Documentation - HAR System

Complete API reference for the Human Activity & Mood Recognition system.

**Base URL**: `http://localhost:8000`  
**API Version**: `v1`  
**Interactive Docs**: `http://localhost:8000/docs`

---

## 🔐 Authentication

Currently, the API does not require authentication. For production deployment, implement JWT-based authentication.

---

## 📡 REST API Endpoints

### Health Check

#### GET `/`

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

---

### Sessions

#### POST `/api/v1/sessions`

Create a new session.

**Request Body:**
```json
{
  "user_id": "optional-user-id",
  "meta": {
    "browser": "Chrome/120.0",
    "device": "laptop",
    "custom_field": "any value"
  }
}
```

**Response:**
```json
{
  "session_id": "657a1234567890abcdef1234"
}
```

**Status Codes:**
- `201`: Session created successfully
- `500`: Server error

---

#### POST `/api/v1/sessions/{session_id}/end`

End a session and compute aggregates.

**Parameters:**
- `session_id` (path, required): Session ID

**Response:**
```json
{
  "session_id": "657a1234567890abcdef1234",
  "duration_s": 180,
  "aggregates": {
    "dominant_mood": "neutral",
    "stress_score": 0.28,
    "prediction_count": 360
  }
}
```

**Status Codes:**
- `200`: Session ended successfully
- `400`: Invalid session ID format
- `404`: Session not found
- `500`: Server error

---

#### GET `/api/v1/sessions/{session_id}`

Get session details.

**Parameters:**
- `session_id` (path, required): Session ID

**Response:**
```json
{
  "session_id": "657a1234567890abcdef1234",
  "user_id": null,
  "started_at": "2023-12-01T10:00:00.000Z",
  "ended_at": "2023-12-01T10:03:00.000Z",
  "duration_s": 180,
  "meta": {
    "browser": "Chrome/120.0",
    "device": "laptop"
  },
  "aggregates": {
    "dominant_mood": "neutral",
    "stress_score": 0.28,
    "prediction_count": 360
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid session ID format
- `404`: Session not found

---

#### GET `/api/v1/sessions`

List sessions with optional filtering.

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `limit` (optional, default: 20): Maximum number of results

**Example:**
```
GET /api/v1/sessions?user_id=user123&limit=10
```

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "657a1234567890abcdef1234",
      "user_id": "user123",
      "started_at": "2023-12-01T10:00:00.000Z",
      "ended_at": "2023-12-01T10:03:00.000Z",
      "duration_s": 180,
      "meta": {...},
      "aggregates": {...}
    },
    // ... more sessions
  ],
  "count": 10
}
```

**Status Codes:**
- `200`: Success

---

### Insights

#### GET `/api/v1/insights`

Get insights for a session.

**Query Parameters:**
- `session_id` (required): Session ID

**Example:**
```
GET /api/v1/insights?session_id=657a1234567890abcdef1234
```

**Response:**
```json
{
  "insights": [
    {
      "insight_id": "657b1234567890abcdef5678",
      "session_id": "657a1234567890abcdef1234",
      "generated_at": "2023-12-01T10:01:30.000Z",
      "type": "recommendation",
      "content": "You appear stressed. Try a 5-minute breathing exercise.",
      "confidence": 0.82
    },
    // ... more insights
  ],
  "count": 5
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing or invalid session_id

---

### Feedback

#### POST `/api/v1/feedback`

Submit feedback on a recommendation.

**Request Body:**
```json
{
  "session_id": "657a1234567890abcdef1234",
  "insight_id": "abc123",
  "rating": 5,
  "comment": "Very helpful recommendation!"
}
```

**Fields:**
- `session_id` (required): Session ID
- `insight_id` (required): Insight/advice ID
- `rating` (required): Integer 1-5
- `comment` (optional): Text feedback

**Response:**
```json
{
  "feedback_id": "657c1234567890abcdef9012",
  "status": "received"
}
```

**Status Codes:**
- `200`: Feedback received
- `422`: Validation error

---

## 🔌 WebSocket API

### Connection

Connect to WebSocket endpoint for real-time predictions.

**URL:** `ws://localhost:8000/ws/{session_id}`

**Parameters:**
- `session_id` (path, required): Valid session ID

**Connection Flow:**
1. Create session via REST API
2. Connect to WebSocket with session ID
3. Send feature messages
4. Receive prediction messages
5. Close connection when done
6. End session via REST API

---

### Client → Server Messages

#### Features Message

Send extracted features for analysis.

```json
{
  "type": "features",
  "timestamp": 1701432000000,
  "features": {
    "face_kp": [0.1, 0.2, 0.3, ...],  // 468 x 3 = 1404 values
    "pose_kp": [0.4, 0.5, 0.6, ...]   // 33 x 4 = 132 values
  }
}
```

**Fields:**
- `type`: Must be `"features"`
- `timestamp`: Unix timestamp in milliseconds
- `features.face_kp`: Flattened array of face landmarks (x, y, z)
- `features.pose_kp`: Flattened array of pose landmarks (x, y, z, visibility)

**Rate Limiting:**
- Recommended: Send features every 500ms
- Maximum: 2 messages per second

---

### Server → Client Messages

#### Prediction Message

Receive emotion and stress prediction with recommendation.

```json
{
  "type": "prediction",
  "timestamp": 1701432000000,
  "emotion": "neutral",
  "emotion_prob": {
    "happy": 0.05,
    "sad": 0.12,
    "neutral": 0.70,
    "angry": 0.05,
    "surprised": 0.08,
    "fearful": 0.00,
    "disgusted": 0.00
  },
  "stress_score": 0.25,
  "advice_id": "a1b2c3",
  "advice": "You're doing well! Remember to take regular breaks."
}
```

**Fields:**
- `type`: Always `"prediction"`
- `timestamp`: Echo of request timestamp
- `emotion`: Dominant emotion (string)
- `emotion_prob`: Probability distribution over emotions (0-1)
- `stress_score`: Stress level (0-1, where 1 is maximum stress)
- `advice_id`: Unique ID for this advice
- `advice`: Personalized recommendation text

---

### Error Handling

#### Connection Errors

**Invalid Session ID:**
```
WebSocket Close Code: 1003
Reason: "Invalid session_id"
```

**Session Not Found:**
```
WebSocket Close Code: 1003
Reason: "Session not found"
```

**Server Error:**
```
WebSocket Close Code: 1011
Reason: "Internal error message"
```

#### Client-Side Example

```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/${sessionId}`)

ws.onopen = () => {
  console.log('Connected')
}

ws.onmessage = (event) => {
  const prediction = JSON.parse(event.data)
  console.log('Prediction:', prediction)
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
}

ws.onclose = (event) => {
  console.log(`Closed: ${event.code} - ${event.reason}`)
}

// Send features
ws.send(JSON.stringify({
  type: 'features',
  timestamp: Date.now(),
  features: {
    face_kp: extractedFaceKeypoints,
    pose_kp: extractedPoseKeypoints
  }
}))
```

---

## 📊 Data Models

### Session Document

```typescript
interface Session {
  _id: ObjectId
  user_id?: string
  started_at: Date
  ended_at?: Date
  duration_s?: number
  meta: Record<string, any>
  aggregates?: {
    dominant_mood: string
    stress_score: number
    prediction_count: number
  }
}
```

### Prediction Document

```typescript
interface Prediction {
  _id: ObjectId
  session_id: ObjectId
  timestamp: Date
  features: {
    face_kp: number[]
    pose_kp: number[]
  }
  emotion_prob: Record<string, number>
  stress_score: number
}
```

### Insight Document

```typescript
interface Insight {
  _id: ObjectId
  session_id: ObjectId
  generated_at: Date
  type: 'recommendation' | 'alert' | 'observation'
  content: string
  confidence: number
}
```

### Feedback Document

```typescript
interface Feedback {
  _id: ObjectId
  session_id: ObjectId
  insight_id: string
  rating: number  // 1-5
  comment?: string
  submitted_at: Date
}
```

---

## 🧪 Testing with cURL

### Create Session

```bash
curl -X POST http://localhost:8000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "meta": {"device": "test"}}'
```

### Get Session

```bash
SESSION_ID="657a1234567890abcdef1234"
curl http://localhost:8000/api/v1/sessions/$SESSION_ID
```

### End Session

```bash
curl -X POST http://localhost:8000/api/v1/sessions/$SESSION_ID/end
```

### List Sessions

```bash
curl "http://localhost:8000/api/v1/sessions?limit=10"
```

### Get Insights

```bash
curl "http://localhost:8000/api/v1/insights?session_id=$SESSION_ID"
```

### Submit Feedback

```bash
curl -X POST http://localhost:8000/api/v1/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "657a1234567890abcdef1234",
    "insight_id": "abc123",
    "rating": 5,
    "comment": "Great advice!"
  }'
```

---

## 🧪 Testing with Postman

Import the following collection:

```json
{
  "info": {
    "name": "HAR API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/"
      }
    },
    {
      "name": "Create Session",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/v1/sessions",
        "body": {
          "mode": "raw",
          "raw": "{\"user_id\": \"test_user\", \"meta\": {}}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    }
  ]
}
```

---

## 🔒 Security Considerations

### Production Checklist

- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Use HTTPS/WSS
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Implement CORS properly
- [ ] Add request logging
- [ ] Monitor for abuse
- [ ] Implement API keys for external access

### Rate Limiting Recommendations

- Sessions: 10 per minute per IP
- WebSocket: 2 messages per second per connection
- Feedback: 5 per minute per user

---

## 📈 Response Codes Summary

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error |
| 1003 | WebSocket: Unsupported data / Invalid session |
| 1011 | WebSocket: Server error |

---

## 🆘 Support

- **OpenAPI Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **GitHub Issues**: [Repository issues page]

---

**Last Updated**: December 2023  
**API Version**: 1.0.0

