@echo off
chcp 65001 >nul
title GitHub'a gonder
cd /d "%~dp0"

rem Kimlik istemini ac: bu pencerede giris yapabilesiniz diye.
set GIT_TERMINAL_PROMPT=1
set GCM_INTERACTIVE=always

echo.
echo   Depo : https://github.com/bcagdashurda/Eniyiokul.git
echo   Hesap: bcagdashurda ile giris yapin
echo.

git push -u origin main

echo.
if errorlevel 1 (
  echo   Gonderim basarisiz. Yukaridaki mesaji okuyun.
) else (
  echo   Gonderildi.
)
echo.
pause
