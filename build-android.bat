@echo off
echo ===============================================
echo Ball Sort Puzzle - Android Build Script
echo ===============================================

echo.
echo Step 1: Creating Cordova project...
cd C:\Users\mayank_aggarwal2\
if exist BallSortPuzzleApp rmdir /s /q BallSortPuzzleApp
cordova create BallSortPuzzleApp com.yourcompany.ballsortpuzzle "Ball Sort Puzzle"
cd BallSortPuzzleApp

echo.
echo Step 2: Adding Android platform...
cordova platform add android

echo.
echo Step 3: Installing required plugins...
cordova plugin add cordova-plugin-admob-free --variable ADMOB_ANDROID_APP_ID="ca-app-pub-3940256099942544~3347511713" --variable ADMOB_IOS_APP_ID="ca-app-pub-3940256099942544~1458002511"
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-network-information
cordova plugin add cordova-plugin-vibration
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-whitelist

echo.
echo Step 4: Copying game files...
cd www
del index.html
del css\index.css
del js\index.js
rmdir /s /q css
rmdir /s /q js
rmdir /s /q img

copy "C:\Users\mayank_aggarwal2\ball_sort_game\index-mobile.html" index.html
copy "C:\Users\mayank_aggarwal2\ball_sort_game\game.js" .
copy "C:\Users\mayank_aggarwal2\ball_sort_game\user-progress.js" .
copy "C:\Users\mayank_aggarwal2\ball_sort_game\styles.css" .

cd ..

echo.
echo Step 5: Copying configuration...
copy "C:\Users\mayank_aggarwal2\ball_sort_game\config.xml" .

echo.
echo Step 6: Building APK...
cordova build android

echo.
echo ===============================================
echo Build Complete!
echo ===============================================
echo.
echo APK Location: platforms\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on device:
echo 1. Enable USB Debugging on your Android device
echo 2. Connect device via USB
echo 3. Run: cordova run android --device
echo.
echo To test on emulator:
echo 1. Open Android Studio and create an AVD
echo 2. Run: cordova emulate android
echo.
echo For release build:
echo 1. Run: cordova build android --release
echo 2. Sign the APK for Play Store submission
echo.

pause
