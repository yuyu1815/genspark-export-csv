@echo off
echo Building HTML to Figma Chrome Extension...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Error: Failed to install dependencies.
        exit /b 1
    )
)

:: Run the build script
echo Running build script...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Build failed.
    exit /b 1
)

echo.
echo Build completed successfully!
echo The extension is ready in the dist directory.
echo.
echo To install the extension in Chrome:
echo 1. Open chrome://extensions/
echo 2. Enable "Developer mode" (toggle in the top-right corner)
echo 3. Click "Load unpacked" and select the dist directory
echo.

pause