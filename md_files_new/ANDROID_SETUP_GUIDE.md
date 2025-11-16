# 🎮 Ball Sort Puzzle - Android Development Setup Guide

This comprehensive guide will help you convert your HTML5 Ball Sort Puzzle game into a fully-featured Android app with real AdMob integration and Google Play Games Services.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)  
3. [Project Configuration](#project-configuration)
4. [AdMob Integration](#admob-integration)
5. [Google Play Games Setup](#google-play-games-setup)
6. [Building the App](#building-the-app)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## 🛠️ Prerequisites

### Required Software

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Java Development Kit (JDK) 8 or 11**
   - Download from: https://adoptium.net/
   - Verify: `java -version`

3. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK, build tools, and emulators

4. **Git** (for version control)
   - Download from: https://git-scm.com/

### Required Accounts

1. **Google AdMob Account**
   - Sign up at: https://admob.google.com/
   - Create your Ball Sort Puzzle app
   - Generate ad unit IDs

2. **Google Play Console Account**
   - Sign up at: https://play.google.com/console
   - Pay $25 one-time registration fee

3. **Google Play Games Services**
   - Access through: https://play.google.com/console (Games Services & APIs)

## 🔧 Environment Setup

### 1. Install Cordova CLI

```powershell
# Install Cordova globally
npm install -g cordova

# Verify installation
cordova --version
```

### 2. Set up Android SDK Environment Variables

Add these to your Windows environment variables:

```
ANDROID_HOME = C:\Users\[YourUsername]\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-11.0.x.x-hotspot
```

Add to PATH:
```
%ANDROID_HOME%\tools
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\build-tools\[latest-version]
%JAVA_HOME%\bin
```

### 3. Install Android SDK Components

In Android Studio:
1. Open SDK Manager (Tools → SDK Manager)
2. Install:
   - Android 13 (API level 33) or latest
   - Android SDK Build-Tools (latest)
   - Android SDK Platform-Tools
   - Android Emulator

## ⚙️ Project Configuration

### 1. Update AdMob Configuration

Edit `src/js/admob-manager.js`:

```javascript
const ADMOB_CONFIG = {
    // Replace with your actual AdMob App ID
    APP_ID: 'ca-app-pub-6091627587181077~2291249310',
    
    // Replace with your actual Ad Unit IDs
    PRODUCTION_IDS: {
        BANNER: 'ca-app-pub-1234567890123456/1111111111',
        INTERSTITIAL: 'ca-app-pub-1234567890123456/2222222222',
        REWARDED: 'ca-app-pub-1234567890123456/3333333333'
    },
    
    // Set to false for production
    SETTINGS: {
        TEST_MODE: false, // Change this to false for release
        // ... other settings
    }
};
```

### 2. Update config.xml

Replace placeholder values in `config.xml`:

```xml
<!-- Update with your actual AdMob App ID -->
<plugin name="cordova-admob-plus" spec="^2.0.0">
    <variable name="APP_ID_ANDROID" value="ca-app-pub-1234567890123456~9876543210" />
</plugin>

<!-- Update with your Google Play Games App ID -->
<plugin name="cordova-plugin-games-services" spec="^1.3.0">
    <variable name="ANDROID_APP_ID" value="YOUR_GAMES_SERVICES_APP_ID" />
</plugin>

<!-- IMPORTANT: Replace YOUR_GAMES_SERVICES_APP_ID with your actual Games Services Application ID
     This is NOT the same as:
     - Google Cloud Project Number: 575215256126
     - Google Cloud Project ID: ball-sort-puzzle-game-478306
     - Sample ID: 4973734059681006779
     
     Find your real Games Services Application ID in:
     Google Play Console → Games Services & APIs → Your Game Project → Application ID
-->
```

### 3. Update package.json

```json
{
  "cordova": {
    "plugins": {
      "cordova-admob-plus": {
        "APP_ID_ANDROID": "ca-app-pub-1234567890123456~9876543210"
      },
      "cordova-plugin-games-services": {
        "ANDROID_APP_ID": "123456789012"
      }
    }
  }
}
```

## 💰 AdMob Integration

### 1. Create AdMob App

1. Go to https://admob.google.com/
2. Click "Add app"
3. Choose "Android"
4. Enter app details:
   - App name: "Ball Sort Puzzle"
   - Package name: `com.ballsortpuzzle.game`

### 2. Create Ad Units

Create three ad units:

1. **Banner Ad Unit**
   - Type: Banner
   - Name: "Ball Sort Banner"

2. **Interstitial Ad Unit**
   - Type: Interstitial
   - Name: "Ball Sort Interstitial"

3. **Rewarded Ad Unit**
   - Type: Rewarded
   - Name: "Ball Sort Rewarded"

### 3. Update Ad Unit IDs

Copy the generated ad unit IDs and update them in `admob-manager.js`.

## 🎮 Google Play Games Setup

### 1. Create Game Project

1. Go to Google Play Console
2. Navigate to "Games Services & APIs"
3. Click "Setup and manage"
4. Create new game project
5. Link to your Play Console app

### 2. Configure Achievements

Create achievements in Play Console:

```
Achievement ID: achievement_first_level
Name: First Steps
Description: Complete your first level

Achievement ID: achievement_ten_levels  
Name: Getting Started
Description: Complete 10 levels

[Continue for all achievements in google-play-games-config.json]
```

### 3. Configure Leaderboards

Create leaderboards:

```
Leaderboard ID: leaderboard_total_levels
Name: Total Levels Completed
Score Format: Numeric

[Continue for all leaderboards in google-play-games-config.json]
```

### 4. Update Game Services App ID

Copy your Game Services App ID and update it in:
- `config.xml`
- `package.json`
- `src/js/google-play-games.js`

## 🔨 Building the App

### Method 1: Using PowerShell Script (Recommended)

```powershell
# Build debug APK
.\build-android.ps1

# Build release APK
.\build-android.ps1 -Release

# Build and sign release APK
.\build-android.ps1 -Release -Sign
```

### Method 2: Manual Build

```powershell
# Install dependencies
npm install

# Add Android platform
cordova platform add android

# Install plugins
npm run install-plugins

# Install AdMob plugin with your actual App ID
cordova plugin add cordova-admob-plus --variable APP_ID_ANDROID=ca-app-pub-XXXXXXXX~YYYYYY

# Install Google Play Games plugin with your actual App ID
cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=YOUR_APP_ID

# Build debug APK
cordova build android

# Build release APK
cordova build android --release
```

## 🧪 Testing

### 1. Test on Emulator

```powershell
# Create and start emulator
cordova emulate android

# Or run on connected device
cordova run android --device
```

### 2. Test AdMob Integration

1. Use test mode initially (`TEST_MODE: true`)
2. Verify ads show correctly
3. Test all ad types (banner, interstitial, rewarded)
4. Switch to production mode for final testing

### 3. Test Google Play Games

1. Install Google Play Games app on test device
2. Test authentication
3. Verify achievements unlock
4. Test leaderboard submissions

## 🚀 Deployment

### 1. Prepare for Release

1. **Set production mode:**
   ```javascript
   // In admob-manager.js
   TEST_MODE: false
   ```

2. **Sign your APK:**
   ```powershell
   # Generate keystore (one time only)
   keytool -genkey -v -keystore ball-sort-puzzle.keystore -alias ball-sort-puzzle -keyalg RSA -keysize 2048 -validity 10000

   # Sign APK
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ball-sort-puzzle.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ball-sort-puzzle

   # Align APK
   zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ball-sort-puzzle-release.apk
   ```

### 2. Upload to Google Play Console

Use the deployment guide:

```powershell
# Check deployment readiness
.\deploy-google-play.ps1 -CheckAPK

# View deployment steps
.\deploy-google-play.ps1
```

## 🔧 Troubleshooting

### Common Issues

#### Build Errors

1. **"ANDROID_HOME not set"**
   - Set ANDROID_HOME environment variable
   - Restart command prompt/PowerShell

2. **"Failed to find target with hash string 'android-XX'"**
   - Install required Android SDK version in Android Studio

3. **"Could not find gradle wrapper within Android SDK"**
   - Update Android Studio and SDK tools

#### AdMob Issues

1. **Ads not showing**
   - Verify app is approved in AdMob console
   - Check ad unit IDs are correct
   - Ensure internet permission in config.xml

2. **"Invalid Ad Unit ID"**
   - Double-check ad unit IDs in admob-manager.js
   - Ensure test mode is properly configured

#### Google Play Games Issues

1. **Authentication fails**
   - Verify app signing certificate matches Play Console
   - Check Google Play Games app is installed
   - Ensure Game Services App ID is correct

### Getting Help

1. **Cordova Documentation:** https://cordova.apache.org/docs/
2. **AdMob Support:** https://support.google.com/admob/
3. **Google Play Games:** https://developers.google.com/games/services/
4. **Stack Overflow:** Tag questions with `cordova`, `admob`, `google-play-games`

## 📝 Checklist for Production Release

- [ ] AdMob App ID updated in config.xml and package.json
- [ ] All ad unit IDs updated in admob-manager.js
- [ ] TEST_MODE set to false
- [ ] Google Play Games App ID configured
- [ ] All achievements and leaderboards created
- [ ] APK signed with production keystore
- [ ] App tested on real devices
- [ ] Privacy policy created and linked
- [ ] Store listing completed with screenshots
- [ ] Content rating completed
- [ ] App uploaded to Google Play Console

## 🎉 Success!

Once you've completed all these steps, your Ball Sort Puzzle game will be a fully-featured Android app with:

- ✅ Real AdMob ads generating revenue
- ✅ Google Play Games Services integration
- ✅ Professional app store presence
- ✅ Scalable monetization strategy

Your HTML5 game is now a native Android app ready for the Google Play Store!

---

**Need Help?** Check the individual scripts for specific guidance:
- `admob-config-helper.js` - AdMob configuration
- `build-android.ps1` - Building the app
- `deploy-google-play.ps1` - Deployment guide
