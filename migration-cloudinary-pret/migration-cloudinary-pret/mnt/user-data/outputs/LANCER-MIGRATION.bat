@echo off
chcp 65001 >nul
color 0A
title MIGRATION CLOUDINARY - MARLI

echo.
echo ═══════════════════════════════════════════════════════
echo    MIGRATION CLOUDINARY - AUTOMATIQUE
echo ═══════════════════════════════════════════════════════
echo.

:: Vérifier qu'on est dans BACK MARLI
if not exist "package.json" (
    color 0C
    echo ERREUR: Ce fichier doit etre dans BACK MARLI
    echo.
    pause
    exit
)

echo Installation des dependances...
call npm install
echo.

echo ═══════════════════════════════════════════════════════
echo    TEST SUR 1 BIEN
echo ═══════════════════════════════════════════════════════
echo.
echo Test en cours...
node migrate-images-fixed.js test 65dd453c6d649796d9684503
echo.

if errorlevel 1 (
    color 0E
    echo.
    echo ERREUR lors du test
    echo Verifiez votre connexion Internet
    echo.
    pause
    exit
)

echo.
echo ═══════════════════════════════════════════════════════
echo    TEST REUSSI ! MIGRATION COMPLETE ?
echo ═══════════════════════════════════════════════════════
echo.
echo Voulez-vous lancer la migration complete ?
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════
echo    MIGRATION COMPLETE EN COURS
echo ═══════════════════════════════════════════════════════
echo.

node migrate-images-fixed.js

echo.
echo ═══════════════════════════════════════════════════════
echo    MIGRATION TERMINEE !
echo ═══════════════════════════════════════════════════════
echo.
pause
