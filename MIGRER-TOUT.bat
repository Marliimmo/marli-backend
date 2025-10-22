


@echo off
chcp 65001 >nul
color 0C
title MIGRATION COMPLETE - TOUTES LES IMAGES

echo.
echo ==========================================
echo    MIGRATION COMPLETE DE TOUT
echo ==========================================
echo.
echo Ce script va migrer TOUTES les images
echo de TOUS les biens vers Cloudinary
echo.
echo ATTENTION: Cela peut prendre 10-30 minutes
echo selon le nombre d'images
echo.
echo Ne fermez PAS cette fenetre pendant la migration
echo.
color 0E
echo.
echo Etes-vous sur de vouloir continuer ?
echo.
set /p confirm="Tapez OUI en majuscules pour confirmer : "

if not "%confirm%"=="OUI" (
    echo.
    echo Migration annulee
    echo.
    pause
    exit
)

color 0A

:: Vérifier qu'on est dans le bon dossier
if not exist "migrate-images.js" (
    color 0C
    echo.
    echo ERREUR: migrate-images.js non trouve
    echo.
    echo Ce fichier doit etre dans le dossier BACK MARLI
    echo.
    pause
    exit
)

echo.
echo ==========================================
echo    DEBUT DE LA MIGRATION
echo ==========================================
echo.
echo Migration en cours...
echo Prenez un cafe, ca peut prendre du temps
echo.

:: Lancer la migration complète
node migrate-images.js migrate

echo.
echo.
echo ==========================================
echo    MIGRATION TERMINEE
echo ==========================================
echo.

:: Vérifier si la migration a réussi
if errorlevel 1 (
    color 0E
    echo.
    echo ATTENTION: Des erreurs se sont produites
    echo.
    echo Verifiez les messages ci-dessus
    echo.
) else (
    color 0A
    echo.
    echo Si vous voyez un rapport de migration ci-dessus
    echo avec des images migrees, c'est bon !
    echo.
    echo PROCHAINES ETAPES:
    echo.
    echo 1. Verifiez vos images sur:
    echo    https://console.cloudinary.com
    echo.
    echo 2. Testez votre site web pour voir
    echo    si les images s'affichent
    echo.
    echo 3. Configurez Render avec les variables
    echo    Cloudinary (voir guide)
    echo.
)

echo.
echo Appuyez sur une touche pour fermer...
pause >nul
