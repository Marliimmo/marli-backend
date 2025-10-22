@echo off
cd /d "%~dp0"
npm install
node migrate-images-fixed.js
pause
