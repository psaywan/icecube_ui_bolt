#!/bin/bash

echo "🚀 Starting IceCube RDS Backend API..."

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run the API server
echo "✅ Starting FastAPI server on port 8000..."
python complete_rds_api.py
