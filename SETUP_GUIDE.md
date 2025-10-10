# 🚀 Complete Setup Guide - HAR System

This guide will walk you through setting up the Human Activity & Mood Recognition system from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.11 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] MongoDB installed (or MongoDB Atlas account)
- [ ] Git installed
- [ ] Modern web browser (Chrome, Firefox, Edge)
- [ ] Webcam connected and working
- [ ] At least 2GB free disk space

## 🎯 Setup Options

Choose one of the following setup methods:

1. **Docker Compose** (Recommended) - Easiest, everything containerized
2. **Manual Setup** - More control, better for development
3. **Hybrid** - Docker for MongoDB, manual for backend/frontend

---

## Option 1: Docker Compose Setup (Recommended)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Human-Activity-Recognition
```

### Step 2: Create Environment Files

Create `backend/.env`:
```env
MONGO_URI=mongodb://mongodb:27017
MONGO_DB_NAME=har_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:80","http://localhost:5173"]
MODEL_PATH=../models/emotion_model.pth
STORE_RAW_FRAMES=false
```

Create `frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Step 3: Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 4: Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

### Step 5: Test the System

1. Open http://localhost in your browser
2. Click "Start Live Session"
3. Grant camera permissions
4. Watch real-time emotion and stress analysis!

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

---

## Option 2: Manual Setup

### Part A: MongoDB Setup

#### Option A1: Local MongoDB

**Windows:**
```bash
# Download MongoDB from https://www.mongodb.com/try/download/community
# Install and run as service
# Or run manually:
mongod --dbpath C:\data\db
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Option A2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Get connection string
5. Whitelist your IP address
6. Use connection string in backend `.env`

### Part B: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy from backend/.env.example and modify
```

**Backend `.env` example:**
```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=har_db
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true
CORS_ORIGINS=["http://localhost:5173"]
MODEL_PATH=../models/emotion_model.pth
STORE_RAW_FRAMES=false
```

**Run backend:**
```bash
# Development mode with auto-reload
uvicorn app.main:app --reload

# Or using Python directly
python -m app.main
```

**Test backend:**
```bash
# In another terminal
curl http://localhost:8000
# Should return: {"status":"healthy",...}

# View API docs
# Open http://localhost:8000/docs in browser
```

### Part C: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:8000" > .env
echo "VITE_WS_URL=ws://localhost:8000" >> .env

# Run development server
npm run dev
```

**Access frontend:**
- Open http://localhost:5173

### Part D: Testing the System

1. **Check MongoDB:**
   ```bash
   # Connect with mongosh
   mongosh
   > use har_db
   > db.sessions.find()
   ```

2. **Test API:**
   - Open http://localhost:8000/docs
   - Try the `/api/v1/sessions` POST endpoint

3. **Test Frontend:**
   - Open http://localhost:5173
   - Navigate to "Live Session"
   - Grant camera permissions
   - Verify face detection works

---

## Option 3: Hybrid Setup

### MongoDB in Docker

```bash
# Run MongoDB in Docker
docker run -d \
  --name har-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### Backend and Frontend Manual

Follow **Part B** and **Part C** from Option 2 above.

---

## 🔧 Troubleshooting

### Backend Issues

#### ModuleNotFoundError

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### MongoDB Connection Error

```bash
# Check MongoDB is running
# Linux/macOS:
ps aux | grep mongod

# Windows:
tasklist | findstr mongod

# Test connection
mongosh mongodb://localhost:27017
```

#### Port 8000 Already in Use

```bash
# Find process using port 8000
# Linux/macOS:
lsof -i :8000

# Windows:
netstat -ano | findstr :8000

# Kill process or use different port
uvicorn app.main:app --port 8001
```

### Frontend Issues

#### npm install Fails

```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### MediaPipe Loading Error

MediaPipe files are loaded from CDN. Check internet connection.

```javascript
// Fallback: Download MediaPipe models locally
// See: https://github.com/google/mediapipe
```

#### WebSocket Connection Refused

```bash
# Verify backend is running
curl http://localhost:8000

# Check CORS settings in backend/.env
# Make sure frontend URL is in CORS_ORIGINS
```

### Camera Issues

#### Camera Permission Denied

- Check browser settings
- Chrome: chrome://settings/content/camera
- Firefox: about:preferences#privacy
- Allow camera access for localhost

#### Camera Not Detected

```javascript
// Test camera in browser console
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => console.log('Camera works!', stream))
  .catch(err => console.error('Camera error:', err))
```

### Database Issues

#### Database Not Created

MongoDB creates databases on first write operation. Start a session to create database.

#### Data Not Persisting

Check MongoDB data directory:
```bash
# Docker
docker volume ls
docker volume inspect har_mongodb_data

# Local MongoDB
# Check dbpath in mongodb.conf
```

---

## 🧪 Verify Installation

Run this checklist to verify everything works:

### Backend Checklist

```bash
cd backend

# 1. Check Python version
python --version  # Should be 3.11+

# 2. Check packages installed
pip list | grep fastapi
pip list | grep motor

# 3. Test API
curl http://localhost:8000
# Expected: {"status":"healthy",...}

# 4. Test WebSocket (with wscat)
npm install -g wscat
wscat -c ws://localhost:8000/ws/test
# Should connect (then will close due to invalid session)
```

### Frontend Checklist

```bash
cd frontend

# 1. Check Node version
node --version  # Should be 18+

# 2. Check packages
npm list react
npm list vite

# 3. Test build
npm run build
# Should create dist/ directory

# 4. Test dev server
npm run dev
# Should start on http://localhost:5173
```

### Integration Test

1. Open frontend in browser
2. Open browser console (F12)
3. Start a live session
4. Check console for:
   - WebSocket connection
   - Feature extraction logs
   - Prediction responses

---

## 🚀 Production Deployment

### Environment Variables

**Production Backend (.env):**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/har_db
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
CORS_ORIGINS=["https://your-domain.com"]
STORE_RAW_FRAMES=false
```

**Production Frontend (.env):**
```env
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
```

### Build for Production

**Backend:**
```bash
cd backend
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm run build

# Serve with nginx or any static server
npm install -g serve
serve -s dist -p 80
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Next Steps

After successful setup:

1. **Train Custom Models** - See `models/README.md`
2. **Customize UI** - Edit components in `frontend/src/`
3. **Add Features** - Extend API in `backend/app/main.py`
4. **Deploy to Cloud** - See deployment guides in main README

---

## 🆘 Getting Help

- **Documentation**: Read `README.md` in each directory
- **API Docs**: http://localhost:8000/docs
- **Issues**: Check GitHub issues
- **Logs**: Check console output and browser DevTools

---

**Congratulations! Your HAR system is ready! 🎉**

Start your first live session and experience real-time emotion and stress detection!

