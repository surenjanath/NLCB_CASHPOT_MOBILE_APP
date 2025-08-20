@echo off
echo 🚀 Starting SQLite to Supabase Migration...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if requirements are installed
echo 📦 Checking dependencies...
pip show requests >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install requirements
        pause
        exit /b 1
    )
)

echo ✅ Dependencies ready
echo.

REM Run the migration script
python migrate_to_supabase.py

echo.
echo Migration completed. Press any key to exit...
pause >nul
