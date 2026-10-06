@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js fehlt. Bitte zuerst Node.js 22.13 oder neuer installieren.
  echo https://nodejs.org/
  pause
  exit /b 1
)

node -e "const [major,minor]=process.versions.node.split('.').map(Number);if(major<22||(major===22&&minor<13))process.exit(1)"
if errorlevel 1 (
  echo Diese Site benoetigt Node.js 22.13 oder neuer.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installiere die Projektabhaengigkeiten. Das passiert nur beim ersten Start.
  call npm ci
  if errorlevel 1 (
    echo Installation fehlgeschlagen. Bitte Internetverbindung und Node.js pruefen.
    pause
    exit /b 1
  )
)

start "" powershell -NoProfile -WindowStyle Hidden -Command "$limit=(Get-Date).AddMinutes(2);while((Get-Date)-lt $limit){try{$reply=Invoke-WebRequest -UseBasicParsing 'http://localhost:5173/' -TimeoutSec 1;if($reply.StatusCode -eq 200){Start-Process 'http://localhost:5173/';exit}}catch{};Start-Sleep -Seconds 1}"
call npm run dev
pause
