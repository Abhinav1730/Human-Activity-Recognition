"""
Rule-based recommendation engine
"""
from typing import Dict, Tuple, Optional
import uuid


# Recommendation templates
RECOMMENDATIONS = {
    "high_stress": [
        "You appear stressed. Try a 5-minute breathing exercise: breathe in for 4s, hold for 4s, breathe out for 4s.",
        "High stress detected. Consider taking a short 10-minute break and stepping away from the screen.",
        "Your stress levels are elevated. A quick walk or some light stretching might help.",
    ],
    "moderate_stress": [
        "You seem a bit tense. Take 3 deep breaths and relax your shoulders.",
        "Moderate stress detected. Stay hydrated and maintain good posture.",
    ],
    "sadness": [
        "Feeling down? Consider reaching out to a friend or doing an activity you enjoy.",
        "You appear tired or sad. Make sure you're getting enough rest and sunlight.",
        "Take a moment for self-care. A short break with uplifting music might help.",
    ],
    "fatigue": [
        "You look tired. Consider taking a 15-minute power nap or a caffeine break.",
        "Low energy detected. Ensure you're staying hydrated and getting regular breaks.",
    ],
    "neutral": [
        "You're doing well! Remember to take regular breaks every 50 minutes.",
        "Maintaining focus is great, but don't forget to stretch periodically.",
    ],
    "positive": [
        "Great energy! Keep up the momentum but remember to stay hydrated.",
        "You seem focused and positive. Maintain this balance with regular breaks.",
    ]
}


class RecommendationEngine:
    """Rule-based engine for generating personalized recommendations"""
    
    def __init__(self):
        self.stress_history = {}  # session_id -> list of recent stress scores
        self.emotion_history = {}  # session_id -> list of recent emotions
        
    def add_prediction(self, session_id: str, emotion: str, stress_score: float):
        """Track prediction history for temporal analysis"""
        if session_id not in self.stress_history:
            self.stress_history[session_id] = []
            self.emotion_history[session_id] = []
        
        self.stress_history[session_id].append(stress_score)
        self.emotion_history[session_id].append(emotion)
        
        # Keep only recent history (last 10 predictions)
        self.stress_history[session_id] = self.stress_history[session_id][-10:]
        self.emotion_history[session_id] = self.emotion_history[session_id][-10:]
    
    def _get_avg_stress(self, session_id: str, window: int = 5) -> float:
        """Calculate average stress over recent predictions"""
        if session_id not in self.stress_history:
            return 0.0
        
        recent = self.stress_history[session_id][-window:]
        return sum(recent) / len(recent) if recent else 0.0
    
    def _get_dominant_emotion(self, session_id: str, window: int = 5) -> Optional[str]:
        """Get most frequent recent emotion"""
        if session_id not in self.emotion_history:
            return None
        
        recent = self.emotion_history[session_id][-window:]
        if not recent:
            return None
        
        return max(set(recent), key=recent.count)
    
    def get_recommendation(
        self, 
        session_id: str, 
        emotion: str, 
        stress_score: float
    ) -> Tuple[str, str, float]:
        """
        Generate recommendation based on current and historical data
        
        Returns:
            (advice_id, advice_text, confidence)
        """
        import random
        
        # Update history
        self.add_prediction(session_id, emotion, stress_score)
        
        # Get temporal context
        avg_stress = self._get_avg_stress(session_id)
        dominant_emotion = self._get_dominant_emotion(session_id)
        
        # Determine recommendation category
        category = None
        confidence = 0.5
        
        # High stress (persistent)
        if avg_stress > 0.65:
            category = "high_stress"
            confidence = min(0.95, 0.6 + avg_stress * 0.3)
        
        # Moderate stress
        elif avg_stress > 0.45:
            category = "moderate_stress"
            confidence = 0.6 + avg_stress * 0.2
        
        # Sadness or negative emotions
        elif dominant_emotion in ["sad", "angry", "fearful"]:
            category = "sadness"
            confidence = 0.7
        
        # Positive state
        elif dominant_emotion in ["happy", "surprised"]:
            category = "positive"
            confidence = 0.75
        
        # Neutral/default
        else:
            category = "neutral"
            confidence = 0.5
        
        # Select random recommendation from category
        advice_text = random.choice(RECOMMENDATIONS[category])
        advice_id = str(uuid.uuid4())[:8]
        
        return advice_id, advice_text, confidence


# Global recommendation engine
recommendation_engine = RecommendationEngine()


def get_recommendation(session_id: str, emotion: str, stress_score: float) -> Tuple[str, str, float]:
    """
    Public interface for getting recommendations
    """
    return recommendation_engine.get_recommendation(session_id, emotion, stress_score)

