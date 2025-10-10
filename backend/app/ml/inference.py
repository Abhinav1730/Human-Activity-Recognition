"""
ML inference engine for emotion and stress detection
"""
import torch
import numpy as np
from typing import Dict, List, Tuple
import asyncio
from anyio import to_thread
from pathlib import Path


class EmotionStressModel:
    """Wrapper for emotion and stress detection models"""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.emotion_classes = ["happy", "sad", "neutral", "angry", "surprised", "fearful", "disgusted"]
        
    def load_model(self):
        """Load the trained model"""
        if self.model_path and Path(self.model_path).exists():
            try:
                self.model = torch.load(self.model_path, map_location=self.device)
                self.model.eval()
                print(f"✓ Loaded model from {self.model_path}")
            except Exception as e:
                print(f"⚠ Could not load model: {e}. Using mock inference.")
                self.model = None
        else:
            print("⚠ No model file found. Using mock inference for demo.")
            self.model = None
    
    def _mock_inference(self, features: Dict[str, List[float]]) -> Tuple[Dict[str, float], float]:
        """
        Mock inference for demo purposes
        Replace with actual model inference in production
        """
        # Simple heuristic based on face keypoints
        face_kp = features.get("face_kp", [])
        pose_kp = features.get("pose_kp", [])
        
        # Generate semi-realistic emotion probabilities
        emotion_probs = {
            "happy": 0.05,
            "sad": 0.10,
            "neutral": 0.60,
            "angry": 0.05,
            "surprised": 0.10,
            "fearful": 0.05,
            "disgusted": 0.05
        }
        
        # Compute stress score (0-1)
        # In real implementation, use model output
        stress_score = 0.25 if len(face_kp) > 0 else 0.0
        
        # Add some randomness for demo
        import random
        emotion_probs["neutral"] = random.uniform(0.4, 0.7)
        stress_score = random.uniform(0.1, 0.5)
        
        # Normalize probabilities
        total = sum(emotion_probs.values())
        emotion_probs = {k: v/total for k, v in emotion_probs.items()}
        
        return emotion_probs, stress_score
    
    def _real_inference(self, features: Dict[str, List[float]]) -> Tuple[Dict[str, float], float]:
        """
        Real model inference
        """
        # Prepare input tensor
        face_kp = np.array(features.get("face_kp", []), dtype=np.float32)
        pose_kp = np.array(features.get("pose_kp", []), dtype=np.float32)
        
        # Concatenate features
        combined_features = np.concatenate([face_kp, pose_kp])
        input_tensor = torch.from_numpy(combined_features).unsqueeze(0).to(self.device)
        
        # Run inference
        with torch.no_grad():
            output = self.model(input_tensor)
            
            # Assuming model outputs [emotion_logits, stress_score]
            emotion_logits = output[0]
            stress_score = torch.sigmoid(output[1]).item()
            
            # Convert logits to probabilities
            emotion_probs_tensor = torch.softmax(emotion_logits, dim=-1)
            emotion_probs = {
                self.emotion_classes[i]: emotion_probs_tensor[0][i].item()
                for i in range(len(self.emotion_classes))
            }
        
        return emotion_probs, stress_score
    
    def predict(self, features: Dict[str, List[float]]) -> Dict:
        """
        Predict emotion and stress from features
        """
        if self.model is not None:
            emotion_probs, stress_score = self._real_inference(features)
        else:
            emotion_probs, stress_score = self._mock_inference(features)
        
        # Get dominant emotion
        dominant_emotion = max(emotion_probs, key=emotion_probs.get)
        
        return {
            "emotion": dominant_emotion,
            "emotion_prob": emotion_probs,
            "stress_score": stress_score
        }
    
    async def predict_async(self, features: Dict[str, List[float]]) -> Dict:
        """
        Async wrapper for prediction
        """
        return await to_thread.run_sync(self.predict, features)


# Global model instance
model = EmotionStressModel()

