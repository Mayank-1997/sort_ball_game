# Android Build Instructions for Ball Sort Puzzle

## File Structure After Cordova Setup

```
BallSortPuzzleApp/
├── www/                    # Your web app files go here
│   ├── index.html         # Copy your game files here
│   ├── game.js
│   ├── user-progress.js
│   ├── styles.css
│   ├── css/
│   ├── js/
│   └── img/
├── platforms/
│   └── android/           # Generated Android project
├── plugins/               # Cordova plugins
├── config.xml            # App configuration
└── package.json
```

## Step-by-Step File Copy Process

1. **Navigate to your Cordova project www folder:**
   ```bash
   cd C:\Users\mayank_aggarwal2\BallSortPuzzleApp\www
   ```

2. **Delete default files and copy your game:**
   ```bash
   # Remove default Cordova files
   del index.html css\index.css js\index.js

   # Copy your game files
   copy "C:\Users\mayank_aggarwal2\ball_sort_game\index.html" .
   copy "C:\Users\mayank_aggarwal2\ball_sort_game\game.js" .
   copy "C:\Users\mayank_aggarwal2\ball_sort_game\user-progress.js" .
   copy "C:\Users\mayank_aggarwal2\ball_sort_game\styles.css" .
   ```

## Required Modifications for Mobile

Your game already has AdMob integration prepared, but you'll need to make these adjustments:

### 1. Update index.html for Cordova

Add these meta tags and Cordova script:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src *; img-src 'self' data: content:;">
<meta name="format-detection" content="telephone=no">
<meta name="msapplication-tap-highlight" content="no">
<meta name="viewport" content="initial-scale=1, width=device-width, viewport-fit=cover">

<!-- Cordova Script - MUST be included -->
<script type="text/javascript" src="cordova.js"></script>
```

### 2. Install Required Plugins

```bash
# AdMob plugin for ads
cordova plugin add cordova-plugin-admob-free

# Device information
cordova plugin add cordova-plugin-device

# Network information
cordova plugin add cordova-plugin-network-information

# Vibration for haptic feedback
cordova plugin add cordova-plugin-vibration

# Status bar control
cordova plugin add cordova-plugin-statusbar

# Splash screen
cordova plugin add cordova-plugin-splashscreen

# Whitelist for security
cordova plugin add cordova-plugin-whitelist
```

### 3. Update config.xml

Key configurations for your app:
```xml
<widget id="com.yourcompany.ballsortpuzzle" version="1.0.0">
    <name>Ball Sort Puzzle</name>
    <description>
        Sort colored balls into tubes! Challenge your mind with this addictive puzzle game.
    </description>
    <author email="your-email@example.com" href="http://yourwebsite.com">
        Your Name
    </author>
    
    <!-- Platform specific settings -->
    <platform name="android">
        <preference name="MinSdkVersion" value="22" />
        <preference name="targetSdkVersion" value="33" />
    </platform>
    
    <!-- App permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- AdMob Configuration -->
    <preference name="ADMOB_ANDROID_APP_ID" value="ca-app-pub-3940256099942544~3347511713" />
</widget>
```

## Build Commands

### Development Build
```bash
# Build for Android
cordova build android

# Build and run on connected device
cordova run android

# Build and run on emulator
cordova emulate android
```

### Production Build
```bash
# Build release version
cordova build android --release

# Sign the APK (required for Play Store)
# First generate keystore
keytool -genkey -v -keystore ball-sort-puzzle.keystore -alias ball-sort-puzzle -keyalg RSA -keysize 2048 -validity 10000

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ball-sort-puzzle.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ball-sort-puzzle

# Align the APK
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk BallSortPuzzle.apk
```

## Testing Process

1. **Enable Developer Options on Android Device:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. **Connect Device and Test:**
   ```bash
   # Check connected devices
   adb devices

   # Install and run
   cordova run android --device
   ```

3. **Test on Emulator:**
   ```bash
   # Create AVD in Android Studio
   # Run emulator
   cordova emulate android
   ```

## Common Issues and Solutions

### Issue 1: Gradle Build Fails
```bash
# Solution: Update Gradle in platforms/android/gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-7.4-all.zip
```

### Issue 2: AdMob Not Working
- Ensure you have the correct App ID in config.xml
- Test with provided test IDs first
- Check network permissions

### Issue 3: Performance Issues
- Enable hardware acceleration
- Optimize image sizes
- Use CSS transforms instead of position changes

## Next Steps

1. Copy your files using the commands above
2. Install required plugins
3. Modify config.xml with your app details
4. Build and test on device/emulator
5. Generate signed APK for Play Store submission
