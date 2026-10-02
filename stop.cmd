@echo off
setlocal EnableDelayedExpansion

rem ============================================================================
rem  GAMEHACK - Ethical Hacking Lab :: stop the local dev server
rem
rem  Usage:
rem    stop.cmd            -> free the default port (5173)
rem    stop.cmd 3000       -> free a specific port
rem
rem  Only processes actually LISTENING on that port are killed, so unrelated
rem  Node processes are never touched.
rem ============================================================================

cd /d "%~dp0"
title GAMEHACK - Stop Dev Server

set "STOP_PORT=5173"
if not "%~1"=="" set "STOP_PORT=%~1"

echo.
echo   ============================================
echo     GAMEHACK :: Stopping dev server
echo   ============================================
echo.

rem NOTE: the command below is intentionally a single line with no caret (^)
rem characters. cmd.exe treats ^ as an escape character even inside quoted
rem arguments, which silently corrupts multi-line versions of this script.

powershell -NoProfile -Command "$p=$env:STOP_PORT; $port=0; if (-not [int]::TryParse($p,[ref]$port)) { Write-Output ('  [X] Invalid port: ' + $p); exit 1 }; $c=@(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue); if ($c.Count -eq 0) { Write-Output ('  [i] Nothing is listening on port ' + $port + '.'); exit 2 }; $ids=@($c | ForEach-Object { $_.OwningProcess } | Sort-Object -Unique); Write-Output ('  [.] Stopping ' + $ids.Count + ' process(es) on port ' + $port + ' ...'); foreach ($i in $ids) { $pr=Get-Process -Id $i -ErrorAction SilentlyContinue; $n=if ($pr) { $pr.ProcessName } else { 'unknown' }; Stop-Process -Id $i -Force -ErrorAction SilentlyContinue; Write-Output ('      - PID ' + $i + ' (' + $n + ')') }; Start-Sleep -Milliseconds 900; $s=@(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue); if ($s.Count -gt 0) { Write-Output ('  [!] Port ' + $port + ' is still in use.'); exit 1 }; Write-Output ('  [OK] Port ' + $port + ' is now free.'); exit 0"

set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="2" (
    echo   Nothing to do - the server was already stopped.
) else if "%EXIT_CODE%"=="0" (
    echo   You can close the other window now, or run start.cmd to restart.
)

echo.
pause
exit /b %EXIT_CODE%