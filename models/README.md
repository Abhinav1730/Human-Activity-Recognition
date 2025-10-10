# ML Models for HAR System

This directory contains machine learning models and training scripts for emotion and stress detection.

## 📁 Directory Structure

```
models/
├── emotion_model.pth          # Trained PyTorch model (not included)
├── training/
│   ├── train_emotion.py       # Training script for emotion model
│   ├── train_stress.py        # Training script for stress model
│   └── utils.py               # Training utilities
├── datasets/
│   └── README.md              # Dataset instructions
└── README.md
```

## 🎯 Model Overview

The HAR system uses two main models:

1. **Emotion Classification Model**
   - Input: Face landmarks (468 points × 3 coordinates = 1404 features) + Pose landmarks (33 points × 4 coordinates = 132 features)
   - Output: 7 emotion probabilities (happy, sad, neutral, angry, surprised, fearful, disgusted)
   - Architecture: Fully connected neural network or CNN

2. **Stress Detection Model**
   - Input: Same features as emotion model + temporal context
   - Output: Stress score (0-1)
   - Architecture: LSTM or Temporal ConvNet

## 📊 Recommended Datasets

### For Emotion Recognition

1. **FER2013** (Free)
   - 35,887 grayscale images (48×48)
   - 7 emotion categories
   - Download: [Kaggle FER2013](https://www.kaggle.com/datasets/msambare/fer2013)

2. **AffectNet** (Academic license required)
   - 1M+ facial images
   - 8 emotions + valence/arousal
   - Website: [AffectNet](http://mohammadmahoor.com/affectnet/)

3. **RAF-DB** (Free for research)
   - Real-world Affective Faces Database
   - 30K images with 7 basic emotions
   - Website: [RAF-DB](http://www.whdeng.cn/raf/model1.html)

4. **DFEW** (Video-based)
   - Dynamic Facial Expression in the Wild
   - Video clips with temporal information
   - Website: [DFEW](https://dfew-dataset.github.io/)

### For Stress Detection

There are fewer public stress datasets. Options:

1. **SWELL-KW** (Knowledge Work)
   - 25 participants doing knowledge work
   - Includes physiological signals
   - Website: [SWELL-KW](https://cs.ru.nl/~skoldijk/SWELL-KW/Dataset.html)

2. **Custom Collection**
   - Collect your own dataset with user consent
   - Self-reported stress labels + questionnaires
   - Combine with emotion labels

## 🏋️ Training Instructions

### 1. Prepare Dataset

```bash
# Download FER2013 from Kaggle
cd datasets
mkdir fer2013
# Extract dataset here

# Convert images to landmarks
python training/extract_landmarks.py \
  --input datasets/fer2013 \
  --output datasets/fer2013_landmarks
```

### 2. Train Emotion Model

```bash
cd training

# Train emotion classifier
python train_emotion.py \
  --data ../datasets/fer2013_landmarks \
  --epochs 50 \
  --batch-size 64 \
  --lr 0.001 \
  --output ../emotion_model.pth
```

### 3. Train Stress Model

```bash
# Train stress detector
python train_stress.py \
  --data ../datasets/stress_data \
  --epochs 30 \
  --batch-size 32 \
  --output ../stress_model.pth
```

### 4. Export for Production

```bash
# Convert to ONNX for better inference speed
python training/export_onnx.py \
  --model ../emotion_model.pth \
  --output ../emotion_model.onnx
```

## 🔬 Model Architecture Examples

### Simple Fully Connected Network

```python
import torch
import torch.nn as nn

class EmotionModel(nn.Module):
    def __init__(self, input_size=1536, num_emotions=7):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(input_size, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_emotions)
        )
    
    def forward(self, x):
        return self.fc(x)
```

### LSTM for Temporal Analysis

```python
class TemporalEmotionModel(nn.Module):
    def __init__(self, input_size=1536, hidden_size=256, num_layers=2, num_emotions=7):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_emotions)
    
    def forward(self, x):
        # x shape: (batch, sequence_length, features)
        lstm_out, _ = self.lstm(x)
        # Use last output
        last_output = lstm_out[:, -1, :]
        return self.fc(last_output)
```

## 📈 Training Tips

### Data Preprocessing

1. **Normalize landmarks**: Scale to [0, 1] or standardize
2. **Data augmentation**: Flip horizontally, add noise
3. **Balance classes**: Use weighted loss or oversampling
4. **Train/val/test split**: 70/15/15

### Hyperparameters

```python
# Example hyperparameters
BATCH_SIZE = 64
LEARNING_RATE = 0.001
EPOCHS = 50
WEIGHT_DECAY = 1e-5

# Optimizer
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)

# Loss function (for emotion classification)
criterion = nn.CrossEntropyLoss()

# Learning rate scheduler
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=5
)
```

### Monitoring

- Track accuracy, F1-score per class
- Use TensorBoard or Weights & Biases
- Save best model based on validation accuracy
- Early stopping if no improvement for 10 epochs

## 🚀 Using Pre-trained Models

If you don't want to train from scratch:

1. **Use Transfer Learning**
   - Start with pre-trained CNN (ResNet, EfficientNet)
   - Fine-tune on your landmark data

2. **Use Existing Models**
   - TensorFlow.js has pre-trained emotion models
   - Can be used as a starting point

## 🔄 Model Inference Pipeline

```python
# In backend/app/ml/inference.py

def predict(self, features):
    # Extract features
    face_kp = np.array(features['face_kp'], dtype=np.float32)
    pose_kp = np.array(features['pose_kp'], dtype=np.float32)
    
    # Combine features
    combined = np.concatenate([face_kp, pose_kp])
    
    # Normalize
    combined = (combined - self.mean) / self.std
    
    # Convert to tensor
    input_tensor = torch.from_numpy(combined).unsqueeze(0).to(self.device)
    
    # Run inference
    with torch.no_grad():
        output = self.model(input_tensor)
        emotion_probs = torch.softmax(output, dim=-1)
    
    return emotion_probs.cpu().numpy()
```

## 📊 Evaluation Metrics

```python
from sklearn.metrics import classification_report, confusion_matrix

# Evaluate on test set
y_pred = model.predict(X_test)
y_pred_labels = np.argmax(y_pred, axis=1)

print(classification_report(y_test, y_pred_labels, target_names=emotion_labels))
print(confusion_matrix(y_test, y_pred_labels))
```

## 🎯 Performance Targets

**Emotion Recognition:**
- Accuracy: > 65% (FER2013 baseline ~65-75%)
- F1-Score: > 0.60 per class

**Stress Detection:**
- Accuracy: > 70%
- AUC-ROC: > 0.75

## 🔧 Troubleshooting

### Low Accuracy

- Check data quality and landmark extraction
- Increase model capacity
- Add more training data
- Use data augmentation
- Try different architectures

### Overfitting

- Add dropout layers
- Use L2 regularization
- Increase dropout rate
- Reduce model size
- Add more training data

### Slow Inference

- Use ONNX runtime
- Quantize model to INT8
- Use smaller model architecture
- Batch predictions

## 📚 Resources

### Papers

- "Facial Expression Recognition: A Survey" (2020)
- "AffectNet: A Database for Facial Expression, Valence, and Arousal Computing"
- "Real-time Stress Detection Using Facial Expressions"

### Libraries

- PyTorch: https://pytorch.org
- MediaPipe: https://mediapipe.dev
- ONNX: https://onnx.ai
- TensorBoard: https://www.tensorflow.org/tensorboard

## 📝 License

Model training code is provided under MIT license. Please respect individual dataset licenses.

---

**Need help?** Check the main README or open an issue.

