# 🚀 Complete Android Testing Guide for Ball Sort Puzzle

## Prerequisites Checklist

### ✅ Software Requirements
- [ ] Node.js (v14 or higher) - [Download](https://nodejs.org/)
- [ ] Java JDK 8 or 11 - [Download](https://www.oracle.com/java/technologies/downloads/)
- [ ] Android Studio - [Download](https://developer.android.com/studio)
- [ ] Apache Cordova - Install via: `npm install -g cordova`

### ✅ Environment Variables
- [ ] JAVA_HOME set to JDK installation
- [ ] ANDROID_HOME set to Android SDK location
- [ ] PATH includes Android SDK tools

### ✅ Android Studio Setup
- [ ] Android SDK installed
- [ ] Android SDK Build-Tools installed
- [ ] Android SDK Platform-Tools installed
- [ ] At least one Android Virtual Device (AVD) created

## Quick Start Method

### Option 1: Automated Build Script
```bash
# Run the automated build script
cd C:\Users\mayank_aggarwal2\ball_sort_game
build-android.bat
```

### Option 2: Manual Build Process

#### Step 1: Create Cordova Project
```bash
cd C:\Users\mayank_aggarwal2\
cordova create BallSortPuzzleApp com.yourcompany.ballsortpuzzle "Ball Sort Puzzle"
cd BallSortPuzzleApp
```

#### Step 2: Add Platform
```bash
cordova platform add android
cordova platform list
```

#### Step 3: Install Plugins
```bash
# Essential plugins for your game
cordova plugin add cordova-plugin-admob-free --variable ADMOB_ANDROID_APP_ID="ca-app-pub-3940256099942544~3347511713"
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-network-information
cordova plugin add cordova-plugin-vibration
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-whitelist

# Verify plugins
cordova plugin list
```

#### Step 4: Copy Files
```bash
cd www

# Remove default files
del index.html
rmdir /s /q css js img

# Copy your game files
copy "C:\Users\mayank_aggarwal2\ball_sort_game\index-mobile.html" index.html
copy "C:\Users\mayank_aggarwal2\ball_sort_game\game.js" .
copy "C:\Users\mayank_aggarwal2\ball_sort_game\user-progress.js" .
copy "C:\Users\mayank_aggarwal2\ball_sort_game\styles.css" .

cd ..

# Copy config
copy "C:\Users\mayank_aggarwal2\ball_sort_game\config.xml" .
```

#### Step 5: Build and Test
```bash
# Build the APK
cordova build android

# For device testing
cordova run android --device

# For emulator testing  
cordova emulate android
```

## Device Testing Setup

### Enable Developer Options on Android Device
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install via USB**

### Connect and Test
```bash
# Check if device is connected
adb devices

# Should show something like:
# List of devices attached
# ABC123DEF456    device

# Install and run on device
cordova run android --device
```

## Emulator Testing Setup

### Create Android Virtual Device (AVD)
1. Open **Android Studio**
2. Go to **Tools** → **AVD Manager**
3. Click **Create Virtual Device**
4. Choose a device (e.g., Pixel 4)
5. Select system image (API 30 or higher recommended)
6. Click **Finish**

### Run on Emulator
```bash
# Start emulator from command line (optional)
emulator -avd Pixel_4_API_30

# Or use Cordova to start emulator and install
cordova emulate android
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] App launches without crashes
- [ ] Welcome screen appears with animations
- [ ] "Start Game" button works
- [ ] Game canvas renders properly
- [ ] Ball sorting mechanics work
- [ ] Touch/tap interactions responsive
- [ ] Sound effects play (if enabled)
- [ ] Timer countdown works
- [ ] Level completion detection works

### ✅ Mobile-Specific Features
- [ ] App responds to device rotation (if enabled)
- [ ] Back button behavior (Android)
- [ ] App survives phone calls/interruptions
- [ ] Performance smooth on target devices
- [ ] Battery usage reasonable
- [ ] Memory usage within limits

### ✅ AdMob Integration
- [ ] Banner ads load (test ads should appear)
- [ ] Rewarded ads trigger correctly
- [ ] Ad clicks don't crash app
- [ ] Game continues after ad completion

### ✅ User Progress
- [ ] Game state saves correctly
- [ ] Progress persists after app restart
- [ ] Level progression works
- [ ] Statistics tracking accurate

## Common Issues and Solutions

### Issue 1: "Cordova is not recognized"
**Solution:**
```bash
npm install -g cordova
# Or use full path
C:\Users\[username]\AppData\Roaming\npm\cordova.cmd --version
```

### Issue 2: "ANDROID_HOME not set"
**Solution:**
1. Find Android SDK location (usually `C:\Users\[username]\AppData\Local\Android\Sdk`)
2. Add to Environment Variables:
   - Variable: `ANDROID_HOME`
   - Value: `C:\Users\[username]\AppData\Local\Android\Sdk`
3. Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`

### Issue 3: "Gradle build failed"
**Solution:**
```bash
# Update Gradle wrapper
cd platforms/android
./gradlew wrapper --gradle-version 7.4

# Or edit gradle-wrapper.properties
# Set: distributionUrl=https\://services.gradle.org/distributions/gradle-7.4-all.zip
```

### Issue 4: "Device not found"
**Solution:**
1. Install device drivers
2. Enable USB Debugging on device
3. Check with: `adb devices`
4. If device shows as "unauthorized", check device screen for authorization prompt

### Issue 5: "AdMob ads not showing"
**Expected:** Test ads should show during development
**Solution:**
- Verify plugin installation: `cordova plugin list`
- Check network connectivity
- Ensure correct test IDs are used
- Real ads only show in production/signed APKs

## Performance Optimization

### For Better Performance:
1. **Optimize images** - Compress any image assets
2. **Minimize DOM manipulation** - Your game uses canvas, which is good
3. **Enable hardware acceleration** in config.xml
4. **Test on lower-end devices** for compatibility

### Memory Management:
- Monitor memory usage in Chrome DevTools
- Test for memory leaks during long gameplay sessions
- Ensure proper cleanup of event listeners

## Release Build Process

### For Play Store Submission:
```bash
# Build release APK
cordova build android --release

# Generate keystore (one-time setup)
keytool -genkey -v -keystore ball-sort-puzzle.keystore -alias ball-sort-puzzle -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ball-sort-puzzle.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ball-sort-puzzle

# Align APK
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk BallSortPuzzle.apk
```

## Next Steps After Testing

1. **Replace test AdMob IDs** with your real AdMob account IDs
2. **Create app icons** and splash screens
3. **Test on multiple devices** and Android versions
4. **Optimize performance** based on testing results
5. **Prepare Play Store listing** (description, screenshots, etc.)
6. **Submit to Google Play Store**

## Support and Troubleshooting

If you encounter issues:
1. Check Cordova documentation: https://cordova.apache.org/docs/
2. Android Developer documentation: https://developer.android.com/
3. Check device logs: `adb logcat`
4. Verify your environment setup with: `cordova requirements android`

Good luck with your Ball Sort Puzzle Android app! 🎯🚀
