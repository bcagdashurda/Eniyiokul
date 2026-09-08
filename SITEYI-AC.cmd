@echo off
chcp 65001 >nul
title eniyiokul
cd /d "%~dp0"

if not exist "dist\index.html" (
  echo.
  echo   Site henuz derlenmemis. Derleniyor...
  echo.
  call npm run build || goto :hata
)

echo.
echo   Site aciliyor: http://localhost:4173
echo   Bu pencereyi kapatirsaniz site kapanir.
echo.

start "" "http://localhost:4173"
node tools\serve.mjs dist 4173
goto :son

:hata
echo.
echo   Derleme basarisiz oldu. "npm install" calistirmayi deneyin.
pause

:son
