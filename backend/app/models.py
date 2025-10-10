"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class EmotionType(str, Enum):
    """Emotion categories"""
    HAPPY = "happy"
    SAD = "sad"
    NEUTRAL = "neutral"
    ANGRY = "angry"
    SURPRISED = "surprised"
    FEARFUL = "fearful"
    DISGUSTED = "disgusted"


class InsightType(str, Enum):
    """Insight categories"""
    RECOMMENDATION = "recommendation"
    ALERT = "alert"
    OBSERVATION = "observation"


# Request Models
class CreateSessionRequest(BaseModel):
    """Request to create a new session"""
    user_id: Optional[str] = None
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict)


class FeaturesMessage(BaseModel):
    """WebSocket message with extracted features"""
    type: str = "features"
    timestamp: int
    features: Dict[str, List[float]]


class FeedbackRequest(BaseModel):
    """User feedback on recommendations"""
    session_id: str
    insight_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


# Response Models
class SessionResponse(BaseModel):
    """Session details response"""
    session_id: str
    user_id: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_s: Optional[int]
    meta: Dict[str, Any]
    aggregates: Optional[Dict[str, Any]]


class PredictionResponse(BaseModel):
    """Prediction result"""
    type: str = "prediction"
    timestamp: int
    emotion: str
    emotion_prob: Dict[str, float]
    stress_score: float
    advice_id: Optional[str] = None
    advice: Optional[str] = None


class InsightResponse(BaseModel):
    """Insight/recommendation response"""
    insight_id: str
    session_id: str
    generated_at: datetime
    type: InsightType
    content: str
    confidence: float


class HealthResponse(BaseModel):
    """API health check response"""
    status: str
    version: str
    timestamp: datetime

