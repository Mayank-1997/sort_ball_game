@echo off
echo ========================================
echo Ball Sort Puzzle - Icon Generator
echo ========================================
echo.

REM Check if ImageMagick is installed
magick -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: ImageMagick is not installed!
    echo.
    echo Please install ImageMagick from:
    echo https://imagemagick.org/script/download.php#windows
    echo.
    echo After installation, restart Command Prompt and try again.
    pause
    exit /b 1
)

echo ✓ ImageMagick is installed

REM Check if source image exists
if not exist "source-icon-1024.png" (
    echo.
    echo ERROR: Source image 'source-icon-1024.png' not found!
    echo.
    echo Please create a 1024x1024 PNG file with your app icon.
    echo You can use these methods:
    echo.
    echo 1. Online Generator: https://icon.kitchen/
    echo    - Upload any image and it will generate a 1024x1024 icon
    echo.
    echo 2. Design Tools: Canva, Figma, Photoshop
    echo    - Create a 1024x1024 canvas
    echo    - Design with purple/pink gradient background
    echo    - Add colorful balls and tubes
    echo.
    echo 3. AI Generators: DALL-E, Midjourney
    echo    - Use prompt: "App icon for puzzle game, colorful balls in tubes"
    echo.
    echo Save your icon as 'source-icon-1024.png' in this folder.
    echo.
    pause
    exit /b 1
)

echo ✓ Source image found

echo.
echo Creating directories...
if not exist "res\icons\android" mkdir "res\icons\android"
if not exist "res\splash\android" mkdir "res\splash\android"

echo.
echo Generating app icons...

REM Generate app icons
magick convert "source-icon-1024.png" -resize 36x36 "res\icons\android\ldpi.png"
echo   ✓ Created ldpi.png (36x36)

magick convert "source-icon-1024.png" -resize 48x48 "res\icons\android\mdpi.png"
echo   ✓ Created mdpi.png (48x48)

magick convert "source-icon-1024.png" -resize 72x72 "res\icons\android\hdpi.png"
echo   ✓ Created hdpi.png (72x72)

magick convert "source-icon-1024.png" -resize 96x96 "res\icons\android\xhdpi.png"
echo   ✓ Created xhdpi.png (96x96)

magick convert "source-icon-1024.png" -resize 144x144 "res\icons\android\xxhdpi.png"
echo   ✓ Created xxhdpi.png (144x144)

magick convert "source-icon-1024.png" -resize 192x192 "res\icons\android\xxxhdpi.png"
echo   ✓ Created xxxhdpi.png (192x192)

echo.
echo Generating splash screens...

REM Generate splash screens with gradient background and centered icon
magick convert -size 320x426 gradient:#6B46C1-#EC4899 ( "source-icon-1024.png" -resize 64x64 ) -gravity center -composite "res\splash\android\ldpi.png"
echo   ✓ Created splash ldpi.png (320x426)

magick convert -size 320x470 gradient:#6B46C1-#EC4899 ( "source-icon-1024.png" -resize 64x64 ) -gravity center -composite "res\splash\android\mdpi.png"
echo   ✓ Created splash mdpi.png (320x470)

magick convert -size 480x640 gradient:#6B46C1-#EC4899 ( "source-icon-1024.png" -resize 96x96 ) -gravity center -composite "res\splash\android\hdpi.png"
echo   ✓ Created splash hdpi.png (480x640)

magick convert -size 720x960 gradient:#6B46C1-#EC4899 ( "source-icon-1024.png" -resize 144x144 ) -gravity center -composite "res\splash\android\xhdpi.png"
echo   ✓ Created splash xhdpi.png (720x960)

magick convert -size 960x1280 gradient:#6B46C1-#EC4899 ( "source-icon-1024.png" -resize 192x192 ) -gravity center -composite "res\splash\android\xxhdpi.png"
echo   ✓ Created splash xxhdpi.png (960x1280)

magick convert -size 1280x1920 gradient:#6B46C1-#EC4899 ( "source-icon-1024.png" -resize 256x256 ) -gravity center -composite "res\splash\android\xxxhdpi.png"
echo   ✓ Created splash xxxhdpi.png (1280x1920)

echo.
echo ========================================
echo ✅ ICON GENERATION COMPLETE!
echo ========================================
echo.
echo Generated Assets:
echo   📱 App Icons: 6 files in res\icons\android\
echo   🌟 Splash Screens: 6 files in res\splash\android\
echo.
echo Next Steps:
echo   1. Copy the 'res' folder to your Cordova project root
echo   2. Ensure config.xml references these icons/splash screens
echo   3. Run: cordova build android
echo.
echo Your Ball Sort Puzzle app assets are ready! 🎮
echo.
pause
