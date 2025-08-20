#!/bin/bash

echo "🚀 Starting SQLite to Supabase Migration..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.7+ and try again"
    exit 1
fi

# Check if requirements are installed
echo "📦 Checking dependencies..."
if ! python3 -c "import requests" &> /dev/null; then
    echo "📥 Installing required packages..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install requirements"
        exit 1
    fi
fi

echo "✅ Dependencies ready"
echo

# Run the migration script
python3 migrate_to_supabase.py

echo
echo "Migration completed."
