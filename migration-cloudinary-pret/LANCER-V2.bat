@echo off
cd /d "%~dp0"
echo Installation...
call npm install
echo.
echo Lancement migration...
node migrate-images-fixed.js
echo.
echo TERMINE - Appuyez sur une touche pour fermer
pause
