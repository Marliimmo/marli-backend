
@echo off
chcp 65001 >nul
color 0A
title TEST AUTOMATIQUE - Migration 1 bien

echo.
echo ==========================================
echo    TEST AUTOMATIQUE CLOUDINARY
echo ==========================================
echo.
echo Ce fichier va tester la migration sur:
echo Bien: "Robe rouge"
echo ID: 65dd528b6d649796d96845fa
echo.
echo Appuyez sur Entree pour lancer le test...
pause >nul

:: Vérifier qu'on est dans le bon dossier
if not exist "migrate-images.js" (
    color 0C
    echo.
    echo ERREUR: migrate-images.js non trouve
    echo.
    echo Ce fichier doit etre dans le dossier BACK MARLI
    echo avec les autres fichiers de migration
    echo.
    pause
    exit
)

echo.
echo ==========================================
echo    LANCEMENT DU TEST
echo ==========================================
echo.
echo Test en cours sur le bien "Robe rouge"...
echo.

:: Lancer le test avec l'ID du bien
node migrate-images.js test 65dd528b6d649796d96845fa

echo.
echo.
echo ==========================================
echo    TEST TERMINE
echo ==========================================
echo.

:: Vérifier si le test a réussi
if errorlevel 1 (
    color 0E
    echo.
    echo ATTENTION: Il semble y avoir eu un probleme
    echo.
    echo Verifications a faire:
    echo 1. Le fichier .env existe avec les bonnes variables
    echo 2. Votre connexion Internet fonctionne
    echo 3. L'URL Heroku est correcte dans .env
    echo.
) else (
    color 0A
    echo.
    echo Si vous voyez "TEST REUSSI" ci-dessus,
    echo alors tout fonctionne parfaitement !
    echo.
    echo PROCHAINE ETAPE:
    echo Double-cliquez sur MIGRER-TOUT.bat
    echo pour migrer toutes les images
    echo.
)

echo.
echo Appuyez sur une touche pour fermer...
pause >nul
