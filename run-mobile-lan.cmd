@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
set "REACT_NATIVE_PACKAGER_HOSTNAME=192.168.11.103"
echo.
echo Tissint mobile - Expo LAN
echo -------------------------
echo Node:
"C:\Program Files\nodejs\node.exe" --version
echo.
echo Ouvre Expo Go sur Android puis utilise:
echo exp://192.168.11.103:8081
echo.
echo Important: garde cette fenetre ouverte pendant les tests.
echo.
"C:\Program Files\nodejs\npm.cmd" --workspace apps/mobile run start -- --lan --clear
pause
