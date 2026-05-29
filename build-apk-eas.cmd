@echo off
setlocal
cd /d "%~dp0apps\mobile"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo.
echo Tissint - Build APK Android avec EAS
echo ------------------------------------
echo.
echo Ce script va:
echo 1. verifier Node
echo 2. te demander de te connecter a Expo si necessaire
echo 3. configurer le projet EAS Android si necessaire
echo 4. lancer une build APK preview
echo.
echo A la fin, copie le lien EAS ou scanne le QR depuis ton telephone
echo pour telecharger et installer l'APK.
echo.

"C:\Program Files\nodejs\node.exe" --version
echo.

echo Verification du compte Expo:
call ..\..\node_modules\.bin\eas.cmd whoami
if errorlevel 1 (
  echo.
  echo Connexion Expo requise.
  call ..\..\node_modules\.bin\eas.cmd login
)

echo.
echo Configuration EAS Android si necessaire:
call ..\..\node_modules\.bin\eas.cmd build:configure --platform android

echo.
echo Lancement de la build APK preview:
call ..\..\node_modules\.bin\eas.cmd build --platform android --profile preview

echo.
echo Termine. Si la build a reussi, EAS affiche un lien de telechargement APK.
pause
