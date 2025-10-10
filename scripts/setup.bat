@echo off
REM HAR System - Automated Setup Script for Windows

echo ==========================================
echo   HAR System - Automated Setup
echo ==========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3 is not installed
    exit /b 1
)
echo [OK] Python found

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)
echo [OK] Node.js found

echo.
echo Choose setup method:
echo 1^) Docker Compose ^(Recommended^)
echo 2^) Manual Setup
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo ==========================================
    echo   Docker Compose Setup
    echo ==========================================
    
    REM Check Docker
    docker --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker is not installed
        exit /b 1
    )
    
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker Compose is not installed
        exit /b 1
    )
    
    echo [OK] Docker and Docker Compose found
    echo.
    
    REM Create .env file
    if not exist "backend\.env" (
        echo Creating backend\.env...
        (
            echo MONGO_URI=mongodb://mongodb:27017
            echo MONGO_DB_NAME=har_db
            echo API_HOST=0.0.0.0
            echo API_PORT=8000
            echo CORS_ORIGINS=["http://localhost:80","http://localhost:5173"]
            echo MODEL_PATH=../models/emotion_model.pth
            echo STORE_RAW_FRAMES=false
        ) > backend\.env
        echo [OK] Created backend\.env
    )
    
    echo.
    echo Building and starting services...
    docker-compose up -d
    
    echo.
    echo ==========================================
    echo   Setup Complete!
    echo ==========================================
    echo.
    echo Services are running:
    echo   Frontend:  http://localhost
    echo   Backend:   http://localhost:8000
    echo   API Docs:  http://localhost:8000/docs
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop:      docker-compose down
    
) else if "%choice%"=="2" (
    echo.
    echo ==========================================
    echo   Manual Setup
    echo ==========================================
    echo.
    
    REM Backend setup
    echo Setting up backend...
    cd backend
    
    if not exist "venv" (
        echo Creating virtual environment...
        python -m venv venv
    )
    
    echo Installing Python dependencies...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    
    if not exist ".env" (
        echo Creating backend\.env...
        (
            echo MONGO_URI=mongodb://localhost:27017
            echo MONGO_DB_NAME=har_db
            echo API_HOST=0.0.0.0
            echo API_PORT=8000
            echo API_RELOAD=true
            echo CORS_ORIGINS=["http://localhost:5173"]
            echo MODEL_PATH=../models/emotion_model.pth
            echo STORE_RAW_FRAMES=false
        ) > .env
    )
    
    cd ..
    
    REM Frontend setup
    echo.
    echo Setting up frontend...
    cd frontend
    
    echo Installing Node dependencies...
    call npm install
    
    if not exist ".env" (
        echo Creating frontend\.env...
        (
            echo VITE_API_URL=http://localhost:8000
            echo VITE_WS_URL=ws://localhost:8000
        ) > .env
    )
    
    cd ..
    
    echo.
    echo ==========================================
    echo   Setup Complete!
    echo ==========================================
    echo.
    echo To start the backend:
    echo   cd backend
    echo   venv\Scripts\activate.bat
    echo   uvicorn app.main:app --reload
    echo.
    echo To start the frontend:
    echo   cd frontend
    echo   npm run dev
    echo.
    echo Then visit: http://localhost:5173
    
) else (
    echo [ERROR] Invalid choice
    exit /b 1
)

echo.
echo For more help, see SETUP_GUIDE.md
echo.
pause

