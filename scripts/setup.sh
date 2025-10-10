#!/bin/bash

# HAR System - Automated Setup Script
# This script sets up the entire HAR system

set -e  # Exit on error

echo "=========================================="
echo "  HAR System - Automated Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check MongoDB
if ! command -v mongod &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB not found. Will need to install or use Docker${NC}"
else
    echo -e "${GREEN}✓ MongoDB or Docker found${NC}"
fi

echo ""

# Ask user for setup method
echo "Choose setup method:"
echo "1) Docker Compose (Recommended)"
echo "2) Manual Setup"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "=========================================="
    echo "  Docker Compose Setup"
    echo "=========================================="
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}✗ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"
    echo ""
    
    # Create .env files if they don't exist
    if [ ! -f backend/.env ]; then
        echo "Creating backend/.env..."
        cat > backend/.env << 'EOF'
MONGO_URI=mongodb://mongodb:27017
MONGO_DB_NAME=har_db
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:80","http://localhost:5173"]
MODEL_PATH=../models/emotion_model.pth
STORE_RAW_FRAMES=false
EOF
        echo -e "${GREEN}✓ Created backend/.env${NC}"
    fi
    
    # Build and start services
    echo ""
    echo "Building and starting services..."
    docker-compose up -d
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  Setup Complete!"
    echo "==========================================${NC}"
    echo ""
    echo "Services are running:"
    echo "  Frontend:  http://localhost"
    echo "  Backend:   http://localhost:8000"
    echo "  API Docs:  http://localhost:8000/docs"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop:      docker-compose down"
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "=========================================="
    echo "  Manual Setup"
    echo "=========================================="
    echo ""
    
    # Backend setup
    echo "Setting up backend..."
    cd backend
    
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    echo "Activating virtual environment..."
    source venv/bin/activate
    
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    
    if [ ! -f .env ]; then
        echo "Creating backend/.env..."
        cat > .env << 'EOF'
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=har_db
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true
CORS_ORIGINS=["http://localhost:5173"]
MODEL_PATH=../models/emotion_model.pth
STORE_RAW_FRAMES=false
EOF
    fi
    
    cd ..
    
    # Frontend setup
    echo ""
    echo "Setting up frontend..."
    cd frontend
    
    echo "Installing Node dependencies..."
    npm install
    
    if [ ! -f .env ]; then
        echo "Creating frontend/.env..."
        cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
EOF
    fi
    
    cd ..
    
    # MongoDB check
    echo ""
    echo "Checking MongoDB..."
    if ! pgrep -x "mongod" > /dev/null; then
        echo -e "${YELLOW}⚠ MongoDB is not running${NC}"
        echo ""
        echo "Start MongoDB with:"
        echo "  mongod --dbpath /path/to/data/db"
        echo ""
        echo "Or run MongoDB in Docker:"
        echo "  docker run -d -p 27017:27017 --name mongodb mongo:7.0"
    else
        echo -e "${GREEN}✓ MongoDB is running${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  Setup Complete!"
    echo "==========================================${NC}"
    echo ""
    echo "To start the backend:"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn app.main:app --reload"
    echo ""
    echo "To start the frontend:"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
    echo "Then visit: http://localhost:5173"
    
else
    echo -e "${RED}Invalid choice${NC}"
    exit 1
fi

echo ""
echo "For more help, see SETUP_GUIDE.md"
echo ""

