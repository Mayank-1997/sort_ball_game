@echo off
echo ========================================
echo Ball Sort Puzzle - Android Conversion
echo ========================================
echo.

REM Check if required tools are installed
echo [1/8] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check Java
java --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java JDK 11+ from https://adoptium.net/
    pause
    exit /b 1
)
echo ✓ Java is installed

REM Check Android SDK
if not defined ANDROID_HOME (
    echo ERROR: ANDROID_HOME environment variable is not set
    echo Please install Android Studio and set ANDROID_HOME
    pause
    exit /b 1
)
echo ✓ Android SDK is configured

REM Check Cordova
cordova --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Cordova globally...
    npm install -g cordova
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Cordova
        pause
        exit /b 1
    )
)
echo ✓ Cordova is ready

echo.
echo [2/8] Setting up project structure...

REM Create project directory
set PROJECT_NAME=BallSortPuzzleApp
set PACKAGE_NAME=com.ballsort.puzzle

if exist "%PROJECT_NAME%" (
    echo Project directory already exists. Removing...
    rmdir /s /q "%PROJECT_NAME%"
)

echo Creating Cordova project...
cordova create "%PROJECT_NAME%" "%PACKAGE_NAME%" "Ball Sort Puzzle"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create Cordova project
    pause
    exit /b 1
)

cd "%PROJECT_NAME%"

echo [3/8] Adding Android platform...
cordova platform add android
if %errorlevel% neq 0 (
    echo ERROR: Failed to add Android platform
    pause
    exit /b 1
)

echo [4/8] Copying game files...

REM Copy game files to www directory
copy "..\index.html" "www\index.html" /Y
copy "..\game.js" "www\game.js" /Y
copy "..\user-progress.js" "www\user-progress.js" /Y
copy "..\styles.css" "www\styles.css" /Y

if exist "..\sw.js" (
    copy "..\sw.js" "www\sw.js" /Y
)

echo [5/8] Updating configuration...

REM Create mobile-optimized config.xml
(
echo ^<?xml version='1.0' encoding='utf-8'^?^>
echo ^<widget id="%PACKAGE_NAME%" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0"^>
echo     ^<name^>Ball Sort Puzzle^</name^>
echo     ^<description^>
echo         A fun and addictive ball sorting puzzle game. Sort colored balls into tubes!
echo     ^</description^>
echo     ^<author email="your@email.com" href="https://yourwebsite.com"^>
echo         Your Name
echo     ^</author^>
echo     ^<content src="index.html" /^>
echo.    
echo     ^<access origin="*" /^>
echo     ^<allow-intent href="http://*/*" /^>
echo     ^<allow-intent href="https://*/*" /^>
echo     ^<allow-intent href="tel:*" /^>
echo     ^<allow-intent href="sms:*" /^>
echo     ^<allow-intent href="mailto:*" /^>
echo     ^<allow-intent href="geo:*" /^>
echo.    
echo     ^<platform name="android"^>
echo         ^<allow-intent href="market:*" /^>
echo         ^<uses-permission android:name="android.permission.INTERNET" /^>
echo         ^<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /^>
echo         ^<uses-permission android:name="android.permission.VIBRATE" /^>
echo         ^<preference name="android-minSdkVersion" value="22" /^>
echo         ^<preference name="android-targetSdkVersion" value="33" /^>
echo         ^<preference name="android-compileSdkVersion" value="33" /^>
echo     ^</platform^>
echo.    
echo     ^<preference name="DisallowOverscroll" value="true" /^>
echo     ^<preference name="BackgroundColor" value="0xff6B46C1" /^>
echo     ^<preference name="HideKeyboardFormAccessoryBar" value="true" /^>
echo     ^<preference name="Orientation" value="portrait" /^>
echo     ^<preference name="Fullscreen" value="false" /^>
echo     ^<preference name="scheme" value="https" /^>
echo     ^<preference name="hostname" value="localhost" /^>
echo ^</widget^>
) > config.xml

echo [6/8] Adding mobile-specific enhancements...

REM Add Cordova deviceready event to the game
powershell -Command "(Get-Content 'www\game.js') -replace 'document\.addEventListener\(''DOMContentLoaded''', '\rdocument.addEventListener(''deviceready'', onDeviceReady, false);\r\rfunction onDeviceReady() {\r    console.log(''Cordova is ready!'');\r    new BallSortGame();\r}\r\r// For web testing\rdocument.addEventListener(''DOMContentLoaded''', () => {\r    if (!window.cordova) {\r        new BallSortGame();\r    }\r});' | Set-Content 'www\game.js'"

REM Add mobile viewport to HTML
powershell -Command "(Get-Content 'www\index.html') -replace '<meta name=\"viewport\"[^>]*>', '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover\">' | Set-Content 'www\index.html'"

REM Add Cordova script to HTML
powershell -Command "(Get-Content 'www\index.html') -replace '<script src=\"https://cdn.tailwindcss.com\"></script>', '<script type=\"text/javascript\" src=\"cordova.js\"></script>\r    <script src=\"https://cdn.tailwindcss.com\"></script>' | Set-Content 'www\index.html'"

echo [7/8] Preparing build...
cordova prepare android

echo [8/8] Building debug APK...
cordova build android

echo.
echo ========================================
echo ✅ CONVERSION COMPLETE!
echo ========================================
echo.
echo Your Android app has been created successfully!
echo.
echo 📁 Project Location: %cd%
echo 📱 APK Location: platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next Steps:
echo 1. Test the APK on your Android device or emulator
echo 2. Create app icons and splash screens
echo 3. Build release version for Play Store
echo.
echo Commands to test:
echo   cordova emulate android  (for emulator)
echo   cordova run android      (for connected device)
echo.
echo For release build:
echo   cordova build android --release
echo.
echo See ANDROID_CONVERSION_GUIDE.md for detailed instructions!
echo.
pause

cd ..
