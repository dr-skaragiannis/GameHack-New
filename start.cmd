@echo off
setlocal EnableDelayedExpansion

rem ============================================================================
rem  GAMEHACK - Ethical Hacking Lab :: local dev server launcher
rem
rem  Usage:
rem    start.cmd              -> start dev server, open browser
rem    start.cmd --host       -> also expose on your LAN (phone/tablet testing)
rem    start.cmd --port 3000  -> use a specific port
rem ============================================================================

rem Always run from the project root, even when double-clicked from Explorer.
cd /d "%~dp0"
title GAMEHACK Dev Server

echo.
echo   ============================================
echo     GAMEHACK :: Ethical Hacking Lab
echo     Local development server
echo   ============================================
echo.

rem --- 1. Verify Node.js is installed -----------------------------------------
node -v >nul 2>nul
if errorlevel 1 (
    echo   [X] Node.js was not found on your PATH.
    echo.
    echo       Install Node.js 18 or newer from https://nodejs.org/
    echo       then close this window and run start.cmd again.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -v') do set "NODE_VERSION=%%v"
echo   [i] Node.js !NODE_VERSION! detected.

rem --- 2. Install dependencies if they are missing ------------------------------
if not exist "node_modules" (
    echo   [.] Installing dependencies ^(first run only, may take a few minutes^)...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo   [X] "npm install" failed. See the error output above.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo   [OK] Dependencies installed.
) else (
    echo   [OK] Dependencies already installed.
)

rem --- 3. Warn if the default port is already taken ----------------------------
set "DEV_URL=http://localhost:5173"
powershell -NoProfile -Command ^
    "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 1 }" >nul 2>nul
if errorlevel 1 (
    echo.
    echo   [!] Port 5173 is already in use.
    echo       Vite will automatically fall back to the next free port
    echo       ^(5174, 5175, ...^). Watch the "Local:" line below.
    echo.
)

rem --- 4. Open the browser once the server has had a moment to boot ------------
start "" /b powershell -NoProfile -WindowStyle Hidden -Command ^
    "Start-Sleep -Seconds 3; Start-Process '!DEV_URL!'"

rem --- 5. Start Vite (foreground - close this window or press Ctrl+C to stop) ---
echo   [.] Starting Vite dev server. Press Ctrl+C to stop.
echo.
call npm run dev -- %*
set "EXIT_CODE=%ERRORLEVEL%"

echo.
rem -1 / 0 means it was stopped cleanly (Ctrl+C, or stop.cmd killing it).
if "%EXIT_CODE%"=="0" goto :stopped
if "%EXIT_CODE%"=="-1" goto :stopped
echo   [!] Dev server exited with code %EXIT_CODE%. See the output above.
goto :done

:stopped
echo   [OK] Dev server stopped.

:done
echo.
pause
exit /b %EXIT_CODE%