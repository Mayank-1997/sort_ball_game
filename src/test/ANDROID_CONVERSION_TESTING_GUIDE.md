# Android Conversion Testing Guide

## 🎯 Overview
This guide provides step-by-step instructions to test your Ball Sort Puzzle game during and after Android conversion.

## 📋 Pre-Conversion Testing Checklist

### Test Current Web Implementation
Before converting to Android, ensure everything works in web environment:

1. **Start the development server:**
   ```bash
   cd C:\Users\mayank_aggarwal2\ball_sort_game
   python -m http.server 8080
   ```

2. **Open the game in browser:**
   Navigate to: `http://localhost:8080`

3. **Test Core Features:**
   - [ ] Game loads without errors
   - [ ] Ball sorting mechanics work properly
   - [ ] Level progression works (all 200 levels)
   - [ ] Sound effects and music play correctly
   - [ ] Go Ad-Free functionality works
   - [ ] AdMob simulation displays correctly

## 🔧 Android Conversion Process

### Step 1: Environment Setup
```bash
# Verify installations
node --version          # Should be v16+
cordova --version       # Should be 12.x+
java -version          # Should be JDK 8 or 11
```

### Step 2: Initialize Cordova Project
```bash
cd C:\Users\mayank_aggarwal2\ball_sort_game

# Add Android platform if not already added
cordova platform add android

# Install required plugins
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-network-information

# Install Google Play Games Services
cordova plugin add https://github.com/artberri/cordova-plugin-play-games-services.git --variable APP_ID="YOUR_GOOGLE_PLAY_GAMES_APP_ID"

# Install AdMob plugin
cordova plugin add cordova-plugin-admob-free --variable ADMOB_APP_ID="ca-app-pub-YOUR_ADMOB_APP_ID~YOUR_APP_ID"

# Install In-App Purchase plugin
cordova plugin add cordova-plugin-purchase
```

### Step 3: Configure config.xml
Ensure your `config.xml` matches the one provided in the main conversion guide.

### Step 4: Prepare and Build
```bash
# Copy web files to Cordova www folder
cordova prepare android

# Build debug APK
cordova build android --debug

# Or build release APK (for production)
cordova build android --release
```

## 📱 Android Testing Phases

### Phase 1: Emulator Testing

1. **Start Android Emulator:**
   - Open Android Studio
   - Go to Tools → AVD Manager
   - Start an emulator (Android 8.0+ recommended)

2. **Install and Test:**
   ```bash
   cordova run android
   ```

3. **Test Checklist:**
   - [ ] App launches successfully
   - [ ] All UI elements display correctly
   - [ ] Touch interactions work properly
   - [ ] Game performance is smooth
   - [ ] Sound effects work
   - [ ] Screen orientation locks to portrait

### Phase 2: Physical Device Testing

1. **Enable Developer Mode on Android Device:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect Device and Install:**
   ```bash
   cordova run android --device
   ```

3. **Device-Specific Testing:**
   - [ ] Performance on older devices
   - [ ] Battery usage optimization
   - [ ] Memory usage efficiency
   - [ ] Different screen sizes/resolutions

### Phase 3: Google Play Games Services Testing

1. **Prerequisites:**
   - Google Play Console account setup
   - Google Play Games Services configured
   - Test accounts added to Play Console

2. **Test Features:**
   - [ ] Google Play Games sign-in
   - [ ] Leaderboard functionality
   - [ ] Achievement unlocking
   - [ ] Cloud save/restore
   - [ ] In-app purchase flow

3. **Testing Commands:**
   ```javascript
   // Test in browser console or app
   
   // Check Google Play Games availability
   console.log('Google Play Games:', window.plugins?.playGamesServices);
   
   // Test sign-in
   ballSortGameInstance.googlePlayGames.signIn();
   
   // Test leaderboard submission
   ballSortGameInstance.submitScoreToLeaderboard(5, 10, 45);
   
   // Test purchase flow
   ballSortGameInstance.showAdFreeConfirmationDialog();
   ```

### Phase 4: AdMob Integration Testing

1. **Test Mode Setup:**
   In `src/js/admob-manager.js`, ensure:
   ```javascript
   TEST_MODE: true  // For testing
   ```

2. **Ad Testing Checklist:**
   - [ ] Banner ads display at bottom
   - [ ] Interstitial ads show after level completion
   - [ ] Rewarded ads work for hint system
   - [ ] Premium users don't see banner/interstitial ads
   - [ ] Ad loading doesn't block gameplay

3. **Production Setup:**
   - Replace test ad unit IDs with your actual IDs
   - Set `TEST_MODE: false`
   - Test with real ads on live device

## 🚨 Common Issues and Solutions

### Build Issues

**Issue: Gradle sync failed**
```bash
# Solution: Update Android SDK
# In Android Studio: Tools → SDK Manager → Update
```

**Issue: Plugin not found**
```bash
# Solution: Reinstall plugins
cordova plugin remove PLUGIN_NAME
cordova plugin add PLUGIN_NAME
```

**Issue: Java version conflicts**
```bash
# Solution: Set correct JAVA_HOME
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.x.x.x-hotspot
```

### Runtime Issues

**Issue: Google Play Games not working**
- Check APP_ID in config.xml
- Verify Google Play Console configuration
- Ensure test account is added

**Issue: AdMob ads not showing**
- Verify AdMob app and ad unit IDs
- Check internet connectivity
- Ensure app is properly registered in AdMob

**Issue: In-app purchase fails**
- Verify product IDs match Google Play Console
- Check billing permissions in config.xml
- Test with valid Google account

### Performance Issues

**Issue: Game runs slowly**
- Optimize canvas rendering
- Reduce animation complexity
- Test on lower-end devices

**Issue: Memory leaks**
- Clear intervals properly
- Remove event listeners on destroy
- Optimize image assets

## 📊 Performance Testing

### Metrics to Monitor

1. **App Launch Time:**
   - Target: Under 3 seconds
   - Test on various devices

2. **Frame Rate:**
   - Target: 60 FPS
   - Monitor during gameplay

3. **Memory Usage:**
   - Target: Under 100MB
   - Monitor for memory leaks

4. **Battery Usage:**
   - Test during extended gameplay
   - Optimize for minimal battery drain

### Testing Tools

1. **Android Studio Profiler:**
   - CPU usage monitoring
   - Memory profiling
   - Network activity

2. **Chrome DevTools:**
   - Use for web testing
   - Performance analysis
   - Memory leak detection

## 🎯 Production Deployment Testing

### Final Pre-Release Checklist

1. **Code Review:**
   - [ ] Remove all console.log statements
   - [ ] Set TEST_MODE to false
   - [ ] Update ad unit IDs to production
   - [ ] Verify Google Play Games configuration

2. **Security Check:**
   - [ ] No hardcoded API keys in code
   - [ ] Proper permissions set
   - [ ] Content Security Policy configured

3. **Store Listing Preparation:**
   - [ ] App icons (all sizes)
   - [ ] Screenshots (multiple devices)
   - [ ] App description
   - [ ] Privacy policy

4. **Final Testing:**
   - [ ] Test on minimum Android version
   - [ ] Test on various screen sizes
   - [ ] Test with poor network connectivity
   - [ ] Test purchase flow with real money (small amount)

### Release Build Commands

```bash
# Generate release APK
cordova build android --release

# Sign APK (if not using Android App Bundle)
# Follow Android Studio guide for signing

# Generate Android App Bundle (recommended)
cordova build android --release -- --packageType=bundle
```

## 📞 Support and Resources

### Documentation Links
- [Cordova Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/)
- [Google Play Games Services](https://developers.google.com/games/services)
- [AdMob Documentation](https://developers.google.com/admob)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

### Troubleshooting Commands

```bash
# Clear Cordova cache
cordova clean android

# Rebuild platform
cordova platform remove android
cordova platform add android

# Check Cordova requirements
cordova requirements android

# View detailed build logs
cordova build android --verbose

# Check installed plugins
cordova plugin list
```

### Debug Mode Testing

```bash
# Build with debug info
cordova build android --debug

# Enable debug mode in Chrome
# Connect device and go to chrome://inspect
```

## ✅ Success Criteria

Your Android conversion is successful when:

- ✅ App installs and launches without crashes
- ✅ All game features work as expected
- ✅ Google Play Games Services fully functional
- ✅ AdMob ads display correctly and don't interfere with gameplay
- ✅ In-app purchases work with real Google accounts
- ✅ Performance is smooth on target devices
- ✅ App passes Google Play Store review requirements

Remember to test thoroughly on multiple devices and Android versions before submitting to Google Play Store!
