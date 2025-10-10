# ⚡ Quick Start Guide

Get the HAR system up and running in **5 minutes**!

## 🚀 Fastest Way (Docker)

```bash
# 1. Start all services
docker-compose up -d

# 2. Open browser
# Frontend: http://localhost
# Backend:  http://localhost:8000/docs
```

That's it! 🎉

---

## 🛠️ Manual Setup (Windows)

### Step 1: Backend

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy the content from below and save as backend\.env
```

**backend\.env:**
```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=har_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:5173"]
```

```powershell
# Start backend (in backend directory)
uvicorn app.main:app --reload
```

### Step 2: Frontend

Open a **NEW** terminal:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 3: MongoDB

Open **ANOTHER** terminal:

```powershell
# Option 1: Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Option 2: Local MongoDB
# If installed, just ensure mongod is running
```

### Step 4: Access

Open browser → **http://localhost:5173**

---

## 📱 Using the Application

### 1. Home Page
- Overview of features
- Privacy information
- Click **"Start Live Session"**

### 2. Live Session
1. Click **"Start Session"** button
2. Allow camera access when prompted
3. Your face will be detected (green indicator)
4. Watch real-time emotion and stress analysis
5. Get personalized recommendations
6. Click **"End Session"** when done

### 3. View History
- See all past sessions
- Review insights and recommendations
- Check your stress trends

### 4. Settings
- Configure detection parameters
- Privacy controls
- Delete your data

---

## 🎯 Key Features to Try

### ✅ Real-time Emotion Detection
- Shows current emotion with emoji
- Probability distribution for all emotions
- Updates in real-time

### ✅ Stress Monitoring
- Live stress meter (Low/Moderate/High)
- Visual indicator with color coding
- Historical trends

### ✅ Smart Recommendations
- AI-powered wellness suggestions
- Context-aware advice
- Helpful tips to reduce stress

### ✅ Privacy First
- No video stored
- Only facial landmarks saved
- Delete data anytime

---

## 🧪 Test the System

### Quick Test Sequence

1. **Neutral Face** 
   - Look at camera normally
   - Should detect: Neutral emotion

2. **Smile**
   - Big smile at camera
   - Should detect: Happy emotion

3. **Stress Simulation**
   - Furrow brows, tense face
   - Should detect: Higher stress score

4. **Check Insights**
   - End session
   - Go to History
   - View recommendations

---

## 🐛 Quick Troubleshooting

### Backend won't start

```bash
# Check Python version
python --version  # Need 3.11+

# Check MongoDB
# Docker: docker ps | grep mongo
# Local: mongosh

# Check port 8000
netstat -ano | findstr :8000
```

### Frontend won't start

```bash
# Check Node version
node --version  # Need 18+

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check port 5173
netstat -ano | findstr :5173
```

### Camera not working

1. Check browser permissions
2. Try different browser (Chrome recommended)
3. Ensure camera is not used by another app
4. Check browser console for errors (F12)

### WebSocket not connecting

1. Ensure backend is running
2. Check backend logs for errors
3. Verify CORS settings in backend/.env
4. Try refreshing browser

---

## 📊 Understanding the Output

### Emotion Probabilities

```
Neutral: 70%  ← Most likely current emotion
Happy:   10%
Sad:     10%
Angry:    5%
...
```

### Stress Score

```
0.0 - 0.3  →  Low stress      (Green)
0.3 - 0.7  →  Moderate stress (Yellow)
0.7 - 1.0  →  High stress     (Red)
```

### Recommendations

Generated when:
- Stress score > 0.7 for 30+ seconds
- Persistent negative emotions
- Confidence > 70%

---

## 🎓 Next Steps

Once you're comfortable with the basics:

1. **Train Custom Models**
   - See `models/README.md`
   - Use your own datasets

2. **Customize UI**
   - Edit `frontend/src/components/`
   - Modify Tailwind styles

3. **Add Features**
   - Extend API in `backend/app/main.py`
   - Add new ML models

4. **Deploy to Cloud**
   - See deployment section in README
   - Use Docker Compose in production

---

## 📚 Documentation

- **Full Documentation**: `README.md`
- **Detailed Setup**: `SETUP_GUIDE.md`
- **API Reference**: `API_DOCUMENTATION.md`
- **Model Training**: `models/README.md`

---

## 🆘 Need Help?

### Check Logs

```bash
# Docker
docker-compose logs -f

# Backend (manual)
# Check terminal where uvicorn is running

# Frontend (manual)
# Check terminal where npm run dev is running

# Browser
# F12 → Console tab
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change port or kill existing process |
| Module not found | Reinstall dependencies |
| Camera denied | Check browser permissions |
| WebSocket error | Verify backend is running |
| No predictions | Check backend logs for ML errors |

### Get Support

- Open GitHub issue
- Check `SETUP_GUIDE.md` for detailed troubleshooting
- Review API docs at `http://localhost:8000/docs`

---

## ✨ You're All Set!

Enjoy exploring the HAR system! 

**Happy emotion tracking! 😊**

---

**Quick Command Reference:**

```bash
# Start everything (Docker)
docker-compose up -d

# Start backend (manual)
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Start frontend (manual)
cd frontend && npm run dev

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

