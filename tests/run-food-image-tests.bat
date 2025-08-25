@echo off
echo 🍎 Food Image Analysis Test Runner
echo =================================

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if food images exist
if not exist "client\foodimages" (
    echo ❌ Food images directory not found: client\foodimages
    pause
    exit /b 1
)

echo.
echo Choose test type:
echo 1. API Test (requires backend server running)
echo 2. Direct Service Test (tests service function directly)
echo 3. Exit

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo 🚀 Running API tests...
    echo ⚠️  Make sure the backend server is running (npm run dev in backend directory)
    timeout /t 2 /nobreak >nul
    node test-foodimages-analysis.js
) else if "%choice%"=="2" (
    echo 🚀 Running direct service tests...
    node test-foodimages-direct.js
) else if "%choice%"=="3" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo ✅ Test completed! Check the results above and any generated JSON files.
pause