"""ML inference module"""
from .inference import model, EmotionStressModel
from .recommendations import get_recommendation

__all__ = ["model", "EmotionStressModel", "get_recommendation"]

