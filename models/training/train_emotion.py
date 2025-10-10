"""
Training script for emotion classification model

Usage:
    python train_emotion.py --data ../datasets/landmarks --epochs 50 --batch-size 64
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import argparse
from pathlib import Path
import json
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


class EmotionDataset(Dataset):
    """Dataset for emotion classification from landmarks"""
    
    def __init__(self, features, labels):
        self.features = torch.FloatTensor(features)
        self.labels = torch.LongTensor(labels)
    
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]


class EmotionModel(nn.Module):
    """Simple fully connected model for emotion classification"""
    
    def __init__(self, input_size=1536, num_emotions=7, dropout=0.3):
        super().__init__()
        
        self.fc = nn.Sequential(
            nn.Linear(input_size, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(dropout),
            
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout),
            
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout),
            
            nn.Linear(128, num_emotions)
        )
    
    def forward(self, x):
        return self.fc(x)


def load_data(data_path):
    """
    Load landmark features and labels
    Expected format: JSON files with 'features' and 'label' keys
    """
    data_path = Path(data_path)
    
    features = []
    labels = []
    
    # Load all JSON files
    for json_file in data_path.glob('*.json'):
        with open(json_file, 'r') as f:
            data = json.load(f)
            features.append(data['features'])
            labels.append(data['label'])
    
    return np.array(features), np.array(labels)


def train_epoch(model, loader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for features, labels in loader:
        features, labels = features.to(device), labels.to(device)
        
        # Forward pass
        optimizer.zero_grad()
        outputs = model(features)
        loss = criterion(outputs, labels)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        # Statistics
        total_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
    
    return total_loss / len(loader), 100. * correct / total


def validate(model, loader, criterion, device):
    """Validate model"""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for features, labels in loader:
            features, labels = features.to(device), labels.to(device)
            
            outputs = model(features)
            loss = criterion(outputs, labels)
            
            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    accuracy = 100. * correct / total
    return total_loss / len(loader), accuracy, all_preds, all_labels


def main(args):
    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load data
    print("Loading data...")
    features, labels = load_data(args.data)
    print(f"Loaded {len(features)} samples")
    
    # Split data
    X_train, X_temp, y_train, y_temp = train_test_split(
        features, labels, test_size=0.3, random_state=42, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    # Normalize features
    mean = X_train.mean(axis=0)
    std = X_train.std(axis=0)
    X_train = (X_train - mean) / (std + 1e-8)
    X_val = (X_val - mean) / (std + 1e-8)
    X_test = (X_test - mean) / (std + 1e-8)
    
    # Create datasets
    train_dataset = EmotionDataset(X_train, y_train)
    val_dataset = EmotionDataset(X_val, y_val)
    test_dataset = EmotionDataset(X_test, y_test)
    
    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size)
    
    # Create model
    input_size = features.shape[1]
    num_emotions = len(np.unique(labels))
    model = EmotionModel(input_size=input_size, num_emotions=num_emotions).to(device)
    
    print(f"Model: {sum(p.numel() for p in model.parameters())} parameters")
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=5)
    
    # Training loop
    best_val_acc = 0
    patience_counter = 0
    
    print("\nTraining...")
    for epoch in range(args.epochs):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, _, _ = validate(model, val_loader, criterion, device)
        
        scheduler.step(val_acc)
        
        print(f"Epoch {epoch+1}/{args.epochs}:")
        print(f"  Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"  Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'mean': mean,
                'std': std,
            }, args.output)
            print(f"  ✓ Saved best model (val_acc: {val_acc:.2f}%)")
            patience_counter = 0
        else:
            patience_counter += 1
        
        # Early stopping
        if patience_counter >= args.patience:
            print(f"Early stopping after {epoch+1} epochs")
            break
    
    # Test evaluation
    print("\nEvaluating on test set...")
    checkpoint = torch.load(args.output)
    model.load_state_dict(checkpoint['model_state_dict'])
    _, test_acc, test_preds, test_labels = validate(model, test_loader, criterion, device)
    
    print(f"Test Accuracy: {test_acc:.2f}%")
    print("\nClassification Report:")
    emotion_names = ['happy', 'sad', 'neutral', 'angry', 'surprised', 'fearful', 'disgusted']
    print(classification_report(test_labels, test_preds, target_names=emotion_names[:num_emotions]))
    
    print(f"\nModel saved to: {args.output}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train emotion classification model')
    parser.add_argument('--data', type=str, required=True, help='Path to landmarks dataset')
    parser.add_argument('--epochs', type=int, default=50, help='Number of epochs')
    parser.add_argument('--batch-size', type=int, default=64, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.001, help='Learning rate')
    parser.add_argument('--patience', type=int, default=10, help='Early stopping patience')
    parser.add_argument('--output', type=str, default='../emotion_model.pth', help='Output model path')
    
    args = parser.parse_args()
    main(args)

