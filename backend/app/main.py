"""
Main FastAPI application
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

from .config import settings
from .database import db
from .models import (
    CreateSessionRequest,
    SessionResponse,
    InsightResponse,
    FeedbackRequest,
    HealthResponse,
    PredictionResponse,
    InsightType
)
from .ml import model, get_recommendation


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await db.connect()
    model.load_model()
    yield
    # Shutdown
    await db.disconnect()


app = FastAPI(
    title="Human Activity & Mood Recognition API",
    description="Real-time emotion and stress detection API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# REST Endpoints
# ============================================================================

@app.get("/", response_model=HealthResponse)
async def root():
    """API health check"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )


@app.post("/api/v1/sessions", status_code=201)
async def create_session(payload: CreateSessionRequest):
    """Create a new session"""
    session_doc = {
        "user_id": payload.user_id,
        "started_at": datetime.utcnow(),
        "ended_at": None,
        "duration_s": None,
        "meta": payload.meta,
        "aggregates": None
    }
    
    result = await db.db.sessions.insert_one(session_doc)
    return {"session_id": str(result.inserted_id)}


@app.post("/api/v1/sessions/{session_id}/end")
async def end_session(session_id: str):
    """End a session and compute aggregates"""
    try:
        oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session_id")
    
    session = await db.db.sessions.find_one({"_id": oid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate duration
    ended_at = datetime.utcnow()
    started_at = session["started_at"]
    duration_s = int((ended_at - started_at).total_seconds())
    
    # Compute aggregates from predictions
    predictions = await db.db.predictions.find({"session_id": oid}).to_list(length=1000)
    
    aggregates = {}
    if predictions:
        # Get dominant mood
        emotions = [p["emotion_prob"] for p in predictions if "emotion_prob" in p]
        if emotions:
            # Average emotion probabilities
            avg_emotions = {}
            for emotion_dict in emotions:
                for emotion, prob in emotion_dict.items():
                    avg_emotions[emotion] = avg_emotions.get(emotion, 0) + prob
            
            for emotion in avg_emotions:
                avg_emotions[emotion] /= len(emotions)
            
            dominant_mood = max(avg_emotions, key=avg_emotions.get)
        else:
            dominant_mood = "neutral"
        
        # Average stress score
        stress_scores = [p.get("stress_score", 0) for p in predictions]
        avg_stress = sum(stress_scores) / len(stress_scores) if stress_scores else 0
        
        aggregates = {
            "dominant_mood": dominant_mood,
            "stress_score": round(avg_stress, 2),
            "prediction_count": len(predictions)
        }
    
    # Update session
    await db.db.sessions.update_one(
        {"_id": oid},
        {
            "$set": {
                "ended_at": ended_at,
                "duration_s": duration_s,
                "aggregates": aggregates
            }
        }
    )
    
    return {
        "session_id": session_id,
        "duration_s": duration_s,
        "aggregates": aggregates
    }


@app.get("/api/v1/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    try:
        oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session_id")
    
    session = await db.db.sessions.find_one({"_id": oid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session["session_id"] = str(session.pop("_id"))
    return session


@app.get("/api/v1/sessions")
async def list_sessions(user_id: Optional[str] = None, limit: int = 20):
    """List sessions, optionally filtered by user_id"""
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    sessions = await db.db.sessions.find(query).sort("started_at", -1).limit(limit).to_list(length=limit)
    
    for session in sessions:
        session["session_id"] = str(session.pop("_id"))
    
    return {"sessions": sessions, "count": len(sessions)}


@app.get("/api/v1/insights")
async def get_insights(session_id: str):
    """Get insights for a session"""
    try:
        oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session_id")
    
    insights = await db.db.insights.find({"session_id": oid}).to_list(length=100)
    
    for insight in insights:
        insight["insight_id"] = str(insight.pop("_id"))
        insight["session_id"] = str(insight["session_id"])
    
    return {"insights": insights, "count": len(insights)}


@app.post("/api/v1/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """Submit feedback on a recommendation"""
    feedback_doc = {
        "session_id": ObjectId(feedback.session_id),
        "insight_id": feedback.insight_id,
        "rating": feedback.rating,
        "comment": feedback.comment,
        "submitted_at": datetime.utcnow()
    }
    
    result = await db.db.feedback.insert_one(feedback_doc)
    return {"feedback_id": str(result.inserted_id), "status": "received"}


# ============================================================================
# WebSocket for Real-time Inference
# ============================================================================

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time predictions
    
    Client sends: {"type": "features", "timestamp": 1234567890, "features": {...}}
    Server responds: {"type": "prediction", "timestamp": 1234567890, "emotion": "neutral", ...}
    """
    await websocket.accept()
    
    try:
        oid = ObjectId(session_id)
    except Exception:
        await websocket.close(code=1003, reason="Invalid session_id")
        return
    
    # Verify session exists
    session = await db.db.sessions.find_one({"_id": oid})
    if not session:
        await websocket.close(code=1003, reason="Session not found")
        return
    
    try:
        while True:
            # Receive features from client
            data = await websocket.receive_json()
            
            if data.get("type") != "features":
                continue
            
            features = data.get("features", {})
            timestamp = data.get("timestamp", int(datetime.utcnow().timestamp() * 1000))
            
            # Run inference
            prediction = await model.predict_async(features)
            
            # Get recommendation
            advice_id, advice_text, confidence = get_recommendation(
                session_id,
                prediction["emotion"],
                prediction["stress_score"]
            )
            
            # Store prediction in database (fire-and-forget)
            prediction_doc = {
                "session_id": oid,
                "timestamp": datetime.utcnow(),
                "features": features if not settings.store_raw_frames else features,
                "emotion_prob": prediction["emotion_prob"],
                "stress_score": prediction["stress_score"]
            }
            await db.db.predictions.insert_one(prediction_doc)
            
            # Store insight if confidence is high
            if confidence > 0.7:
                insight_doc = {
                    "session_id": oid,
                    "generated_at": datetime.utcnow(),
                    "type": InsightType.RECOMMENDATION,
                    "content": advice_text,
                    "confidence": confidence
                }
                await db.db.insights.insert_one(insight_doc)
            
            # Send prediction to client
            response = PredictionResponse(
                type="prediction",
                timestamp=timestamp,
                emotion=prediction["emotion"],
                emotion_prob=prediction["emotion_prob"],
                stress_score=prediction["stress_score"],
                advice_id=advice_id,
                advice=advice_text
            )
            
            await websocket.send_json(response.model_dump())
    
    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )

