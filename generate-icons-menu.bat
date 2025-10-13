@echo off
echo ========================================
echo Ball Sort Puzzle - Icon Generator
echo (Multiple Methods Available)
echo ========================================
echo.

echo Choose your icon generation method:
echo.
echo 1. Online Generator (Recommended - No installation needed)
echo 2. Built-in PowerShell (.NET Framework - No external tools)
echo 3. ImageMagick (Advanced - Requires installation)
echo 4. Manual Instructions
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto online
if "%choice%"=="2" goto dotnet
if "%choice%"=="3" goto imagemagick
if "%choice%"=="4" goto manual

echo Invalid choice. Defaulting to online method...

:online
echo.
echo ========================================
echo Method 1: Online Icon Generator
echo ========================================
echo.
echo This is the EASIEST method - no software installation required!
echo.
echo Steps:
echo 1. Open your web browser
echo 2. Go to: https://icon.kitchen/
echo 3. Upload any Ball Sort related image (or use icon-creator.html)
echo 4. Select "Android" platform
echo 5. Download the generated icon pack
echo 6. Extract icons to: res\icons\android\
echo 7. Create splash screens manually or use Method 2
echo.
echo Alternative online tools:
echo - https://appicon.co/
echo - https://makeappicon.com/
echo.
echo Would you like to open the icon creator tool?
set /p openTool="Open icon-creator.html? (y/n): "
if /i "%openTool%"=="y" (
    start icon-creator.html
    echo ✅ Icon creator opened in your browser
)
echo.
echo After creating your 1024x1024 icon, save it as 'source-icon-1024.png'
echo Then run this script again and choose Method 2.
goto end

:dotnet
echo.
echo ========================================
echo Method 2: Built-in PowerShell/.NET
echo ========================================
echo.
echo This method uses Windows built-in image processing.
echo No external software installation required!
echo.

REM Check if source image exists
if not exist "source-icon-1024.png" (
    echo ❌ Source image 'source-icon-1024.png' not found!
    echo.
    echo Please create your icon first:
    echo 1. Open 'icon-creator.html' in your browser
    echo 2. Design your Ball Sort Puzzle icon
    echo 3. Download as 'source-icon-1024.png'
    echo.
    pause
    exit /b 1
)

echo ✅ Source image found
echo.
echo Generating icons using PowerShell/.NET...
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "generate-icons-dotnet.ps1"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Icons generated successfully!
    goto success
) else (
    echo.
    echo ❌ PowerShell script failed. Try Method 1 or 4.
    goto end
)

:imagemagick
echo.
echo ========================================
echo Method 3: ImageMagick (Advanced)
echo ========================================
echo.

REM Check if ImageMagick is installed
magick -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ImageMagick is not installed!
    echo.
    echo Since the main website is unreachable, try these alternatives:
    echo.
    echo Option A - GitHub:
    echo   https://github.com/ImageMagick/ImageMagick/releases
    echo   Download: ImageMagick-7.x.x-x-Q16-HDRI-x64-dll.exe
    echo.
    echo Option B - Package Manager (Run as Administrator):
    echo   winget install ImageMagick.ImageMagick
    echo   OR
    echo   choco install imagemagick
    echo.
    echo Option C - Alternative Sites:
    echo   https://www.fosshub.com/ImageMagick.html
    echo   https://sourceforge.net/projects/imagemagick/
    echo.
    echo After installation, restart Command Prompt and try again.
    echo.
    echo OR choose Method 1 (Online) or Method 2 (PowerShell) instead!
    pause
    exit /b 1
)

echo ✅ ImageMagick is installed

REM Check source image and generate
if not exist "source-icon-1024.png" (
    echo ❌ Source image 'source-icon-1024.png' not found!
    echo Please create your 1024x1024 icon first.
    pause
    exit /b 1
)

echo Generating icons with ImageMagick...
powershell -ExecutionPolicy Bypass -File "generate-icons.ps1"
goto success

:manual
echo.
echo ========================================
echo Method 4: Manual Instructions
echo ========================================
echo.
echo If all automated methods fail, you can create icons manually:
echo.
echo Required Icon Sizes:
echo   - ldpi.png (36x36)
echo   - mdpi.png (48x48)
echo   - hdpi.png (72x72)
echo   - xhdpi.png (96x96)
echo   - xxhdpi.png (144x144)
echo   - xxxhdpi.png (192x192)
echo.
echo Required Splash Screen Sizes:
echo   - ldpi.png (320x426)
echo   - mdpi.png (320x470)
echo   - hdpi.png (480x640)
echo   - xhdpi.png (720x960)
echo   - xxhdpi.png (960x1280)
echo   - xxxhdpi.png (1280x1920)
echo.
echo Steps:
echo 1. Create/get your 1024x1024 source icon
echo 2. Use any image editor (Paint, GIMP, Photoshop, online tools)
echo 3. Resize to each required size
echo 4. Save in the correct folder structure
echo 5. Create folders: res\icons\android\ and res\splash\android\
echo.
echo Online resizing tools:
echo - https://resizeimage.net/
echo - https://www.iloveimg.com/resize-image
echo - https://imageresizer.com/
goto end

:success
echo.
echo ========================================
echo ✅ SUCCESS! Your assets are ready!
echo ========================================
echo.
echo Generated Files:
dir /b res\icons\android\*.png 2>nul
echo.
dir /b res\splash\android\*.png 2>nul
echo.
echo Next Steps for Android Conversion:
echo 1. Copy the 'res' folder to your Cordova project
echo 2. Run: cordova build android
echo 3. Test your app!
echo.

:end
echo.
echo Need help? Check these files:
echo - ICON_GENERATION_GUIDE.md (Complete guide)
echo - ANDROID_CONVERSION_GUIDE.md (Full conversion steps)
echo - icon-creator.html (Visual icon designer)
echo.
pause
