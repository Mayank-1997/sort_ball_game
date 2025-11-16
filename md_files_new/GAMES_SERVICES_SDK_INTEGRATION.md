# 📱 Add Google Play Games Services SDK to Your APK

**Complete Step-by-Step Guide to Integrate Games Services SDK**

---

## 📋 Overview

Adding the Google Play Games Services SDK to your Ball Sort Puzzle APK allows your game to use authentication, achievements, leaderboards, and cloud saves. This guide covers the complete integration process for your Cordova-based Android app.

**Your Project Details:**
- **Project**: Ball Sort Puzzle - Color Games
- **Project ID**: 575215256126
- **Package**: com.ballsortpuzzle.game
- **Status**: Ready for SDK integration

---

## 🛠️ Step 1: Install Required Tools (Prerequisites)

### 1.1 Verify Node.js and Cordova
**Open PowerShell and check:**
```powershell
# Check Node.js version
node --version

# Check Cordova version
cordova --version

# If Cordova is not installed:
npm install -g cordova
```

### 1.2 Verify Android Development Environment
```powershell
# Check Java version
java -version

# Check Android SDK (should show tools)
echo $env:ANDROID_HOME
```

**Required Environment Variables:**
- `ANDROID_HOME`: Path to Android SDK
- `JAVA_HOME`: Path to Java JDK

---

## 🎮 Step 2: Add Games Services Plugin to Your Project

### 2.1 Navigate to Your Project Directory
```powershell
# Navigate to your Ball Sort Puzzle project
cd "C:\Users\mayank_aggarwal2\ball_sort_game"

# Verify you're in the right directory
ls
```

### 2.2 Add the Games Services Cordova Plugin
```powershell
# Add the Google Play Games Services plugin
cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=575215256126
```

**Important:** Replace `575215256126` with your actual Games Services Application ID if different.

### 2.3 Alternative Installation (If Above Fails)
```powershell
# Alternative method with specific version
cordova plugin add cordova-plugin-games-services@1.3.0 --variable ANDROID_APP_ID=575215256126

# Or install from GitHub
cordova plugin add https://github.com/artberri/cordova-plugin-games-services.git --variable ANDROID_APP_ID=575215256126
```

### 2.4 Verify Plugin Installation
```powershell
# List installed plugins
cordova plugin list

# You should see:
# cordova-plugin-games-services X.X.X "Games Services"
```

---

## ⚙️ Step 3: Update Configuration Files

### 3.1 Update config.xml
Your `config.xml` should include the Games Services plugin configuration:

```xml
<!-- Add this plugin configuration to config.xml -->
<plugin name="cordova-plugin-games-services" spec="^1.3.0">
    <variable name="ANDROID_APP_ID" value="575215256126" />
</plugin>

<!-- Also ensure you have these permissions -->
<platform name="android">
    <preference name="android-minSdkVersion" value="21" />
    <preference name="android-targetSdkVersion" value="33" />
    
    <!-- Games Services permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <!-- Games Services metadata -->
    <meta-data android:name="com.google.android.gms.games.APP_ID" android:value="@string/app_id" />
    <meta-data android:name="com.google.android.gms.version" android:value="@integer/google_play_services_version" />
</platform>
```

### 3.2 Update package.json
```json
{
  "cordova": {
    "plugins": {
      "cordova-plugin-games-services": {
        "ANDROID_APP_ID": "575215256126"
      }
    }
  }
}
```

---

## 🔧 Step 4: Configure Android Platform

### 4.1 Add Android Platform (If Not Already Added)
```powershell
# Add Android platform
cordova platform add android

# Or remove and re-add to ensure clean setup
cordova platform remove android
cordova platform add android@latest
```

### 4.2 Verify Platform Configuration
```powershell
# Check platforms
cordova platform list

# Should show: android X.X.X
```

---

## 📝 Step 5: Update Your Game JavaScript Code

### 5.1 Initialize Games Services in Your Game
Add this to your `src/js/game.js` file (or create a new games services file):

```javascript
/**
 * Initialize Google Play Games Services
 */
initializeGooglePlayGames() {
    console.log('🎮 Initializing Google Play Games Services...');
    
    // Check if running on device with Games Services
    if (typeof window.plugins !== 'undefined' && window.plugins.playGames) {
        this.googlePlayGames = window.plugins.playGames;
        
        // Initialize the service
        this.googlePlayGames.auth(
            (result) => {
                console.log('✅ Games Services authenticated:', result);
                this.onGamesServicesReady();
            },
            (error) => {
                console.log('❌ Games Services authentication failed:', error);
                this.onGamesServicesError(error);
            }
        );
    } else {
        console.log('⚠️ Games Services not available (web/testing mode)');
        // Create mock Games Services for testing
        this.createMockGamesServices();
    }
}

/**
 * Handle successful Games Services initialization
 */
onGamesServicesReady() {
    console.log('🎉 Games Services ready!');
    
    // Enable Games Services features
    this.gamesServicesEnabled = true;
    
    // Update UI to show signed-in state
    this.updateGamesServicesUI(true);
    
    // Auto sign-in if user was previously signed in
    this.googlePlayGames.isSignedIn(
        (signedIn) => {
            if (signedIn) {
                console.log('👤 User already signed in');
                this.loadPlayerInfo();
            } else {
                console.log('🔑 User needs to sign in');
            }
        }
    );
}

/**
 * Handle Games Services errors
 */
onGamesServicesError(error) {
    console.error('Games Services error:', error);
    this.gamesServicesEnabled = false;
    this.updateGamesServicesUI(false);
}

/**
 * Sign in to Games Services
 */
signInToGamesServices() {
    if (this.googlePlayGames) {
        this.googlePlayGames.signIn(
            (result) => {
                console.log('✅ Sign-in successful:', result);
                this.loadPlayerInfo();
                this.updateGamesServicesUI(true);
            },
            (error) => {
                console.log('❌ Sign-in failed:', error);
                this.updateGamesServicesUI(false);
            }
        );
    }
}

/**
 * Sign out from Games Services
 */
signOutFromGamesServices() {
    if (this.googlePlayGames) {
        this.googlePlayGames.signOut(
            (result) => {
                console.log('✅ Sign-out successful');
                this.updateGamesServicesUI(false);
            },
            (error) => {
                console.log('❌ Sign-out failed:', error);
            }
        );
    }
}

/**
 * Load player information
 */
loadPlayerInfo() {
    if (this.googlePlayGames) {
        this.googlePlayGames.getPlayerInfo(
            (playerInfo) => {
                console.log('👤 Player info:', playerInfo);
                this.updatePlayerDisplay(playerInfo);
            },
            (error) => {
                console.log('❌ Failed to load player info:', error);
            }
        );
    }
}

/**
 * Unlock achievement
 */
unlockAchievement(achievementId) {
    if (this.googlePlayGames && this.gamesServicesEnabled) {
        this.googlePlayGames.unlockAchievement(
            {
                achievementId: achievementId
            },
            (result) => {
                console.log('🏆 Achievement unlocked:', achievementId);
            },
            (error) => {
                console.log('❌ Failed to unlock achievement:', error);
            }
        );
    }
}

/**
 * Submit score to leaderboard
 */
submitScore(leaderboardId, score) {
    if (this.googlePlayGames && this.gamesServicesEnabled) {
        this.googlePlayGames.submitScore(
            {
                leaderboardId: leaderboardId,
                score: score
            },
            (result) => {
                console.log('📊 Score submitted:', score, 'to', leaderboardId);
            },
            (error) => {
                console.log('❌ Failed to submit score:', error);
            }
        );
    }
}

/**
 * Show achievements
 */
showAchievements() {
    if (this.googlePlayGames && this.gamesServicesEnabled) {
        this.googlePlayGames.showAchievements(
            (result) => {
                console.log('🏆 Achievements shown');
            },
            (error) => {
                console.log('❌ Failed to show achievements:', error);
            }
        );
    }
}

/**
 * Show leaderboards
 */
showLeaderboards() {
    if (this.googlePlayGames && this.gamesServicesEnabled) {
        this.googlePlayGames.showAllLeaderboards(
            (result) => {
                console.log('📊 Leaderboards shown');
            },
            (error) => {
                console.log('❌ Failed to show leaderboards:', error);
            }
        );
    }
}

/**
 * Update Games Services UI elements
 */
updateGamesServicesUI(signedIn) {
    const signInBtn = document.getElementById('googleSignInBtn');
    const signOutBtn = document.getElementById('googleSignOutBtn');
    const authStatus = document.getElementById('authStatus');
    
    if (signedIn) {
        if (signInBtn) signInBtn.classList.add('hidden');
        if (signOutBtn) signOutBtn.classList.remove('hidden');
        if (authStatus) {
            authStatus.textContent = 'Signed In';
            authStatus.className = 'bg-green-500/50 px-2 py-1 rounded text-xs';
        }
    } else {
        if (signInBtn) signInBtn.classList.remove('hidden');
        if (signOutBtn) signOutBtn.classList.add('hidden');
        if (authStatus) {
            authStatus.textContent = 'Not Signed In';
            authStatus.className = 'bg-blue-500/50 px-2 py-1 rounded text-xs';
        }
    }
}

/**
 * Update player display
 */
updatePlayerDisplay(playerInfo) {
    const userName = document.getElementById('userName');
    if (userName && playerInfo.displayName) {
        userName.textContent = `👤 ${playerInfo.displayName}`;
        userName.classList.remove('hidden');
    }
}

/**
 * Create mock Games Services for web testing
 */
createMockGamesServices() {
    this.googlePlayGames = {
        auth: (success, error) => setTimeout(() => success({mock: true}), 1000),
        signIn: (success, error) => setTimeout(() => success({mock: true}), 500),
        signOut: (success, error) => setTimeout(() => success({mock: true}), 500),
        isSignedIn: (callback) => callback(false),
        getPlayerInfo: (success, error) => success({displayName: 'Test Player', playerId: 'test123'}),
        unlockAchievement: (params, success, error) => setTimeout(() => success({}), 500),
        submitScore: (params, success, error) => setTimeout(() => success({}), 500),
        showAchievements: (success, error) => {
            alert('Mock: Would show achievements');
            success({});
        },
        showAllLeaderboards: (success, error) => {
            alert('Mock: Would show leaderboards');
            success({});
        }
    };
    
    console.log('🧪 Mock Games Services created for testing');
    this.gamesServicesEnabled = true;
}
```

### 5.2 Add Event Listeners for Games Services Buttons
```javascript
/**
 * Setup Games Services event listeners
 */
setupGamesServicesEventListeners() {
    // Sign In button
    const signInBtn = document.getElementById('googleSignInBtn');
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            this.signInToGamesServices();
        });
    }
    
    // Sign Out button
    const signOutBtn = document.getElementById('googleSignOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            this.signOutFromGamesServices();
        });
    }
    
    // Leaderboard button
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            this.showLeaderboards();
        });
    }
}
```

---

## 🔨 Step 6: Build Your APK with Games Services

### 6.1 Clean and Prepare Build
```powershell
# Clean previous builds
cordova clean android

# Prepare the platform
cordova prepare android
```

### 6.2 Build Debug APK
```powershell
# Build debug APK for testing
cordova build android --debug

# The APK will be created at:
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### 6.3 Build Release APK (When Ready)
```powershell
# Build release APK (for production)
cordova build android --release

# The APK will be created at:
# platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 📱 Step 7: Test Games Services Integration

### 7.1 Install APK on Test Device
```powershell
# Connect Android device via USB with USB debugging enabled
# Install the debug APK
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

# Or install over existing version
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### 7.2 Test Authentication
1. **Open your app** on the test device
2. **Tap the Sign In button**
3. **Should see Google Play Games sign-in screen**
4. **Sign in with a test account** (that you added to OAuth consent screen)
5. **Verify authentication works**

### 7.3 Test Games Services Features
- **Achievements**: Try unlocking achievements
- **Leaderboards**: Submit scores and view leaderboards
- **Player info**: Check if player name displays correctly

---

## 🐛 Step 8: Troubleshooting Common Issues

### 8.1 Plugin Installation Issues
```powershell
# If plugin installation fails, try:
cordova plugin remove cordova-plugin-games-services
cordova clean android
cordova platform remove android
cordova platform add android
cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=575215256126
```

### 8.2 Build Errors
**"Could not find Games Services library":**
```powershell
# Update Android SDK and build tools
# In Android Studio: SDK Manager → SDK Tools → Update all
```

**"Gradle build failed":**
```powershell
# Clean and rebuild
cordova clean android
cordova build android --verbose
```

### 8.3 Authentication Issues
**"Developer error" or "Invalid client":**
- Verify SHA-1 fingerprint matches your keystore
- Check package name matches OAuth client ID
- Ensure test user is added to OAuth consent screen

**"Games Services not available":**
- Install Google Play Games app on test device
- Ensure device has Google Play Services
- Test with different Google account

### 8.4 Debug Commands
```powershell
# View detailed build output
cordova build android --verbose

# Check plugin installation
cordova plugin list

# View Android logs
adb logcat | findstr "Ball Sort"
```

---

## ✅ Step 9: Verification Checklist

### 9.1 SDK Integration Checklist
- ✅ **Plugin installed**: `cordova-plugin-games-services`
- ✅ **Configuration updated**: config.xml and package.json
- ✅ **JavaScript code added**: Games Services methods
- ✅ **APK builds successfully**: No build errors
- ✅ **Authentication works**: Sign-in/sign-out functional
- ✅ **Games Services features work**: Achievements, leaderboards

### 9.2 Testing Checklist
- ✅ **Debug APK installs** on test device
- ✅ **Google Play Games app** installed on device
- ✅ **Test user account** can sign in
- ✅ **Player info displays** correctly
- ✅ **Achievements unlock** when triggered
- ✅ **Leaderboard submissions** work

---

## 🎯 Step 10: Next Steps

### 10.1 Completed Integration
With Games Services SDK integrated, you now have:
- ✅ **Authentication system** ready
- ✅ **Achievement system** functional
- ✅ **Leaderboard system** working
- ✅ **Player profile access** available

### 10.2 Production Preparation
For production release:
1. **Create production keystore**
2. **Add production SHA-1 fingerprint** to OAuth client ID
3. **Test with production APK**
4. **Publish Games Services project** (final step)

### 10.3 Enhanced Features (Optional)
You can now add:
- **Cloud save** functionality
- **Player achievements** with custom rewards
- **Social features** (friends, sharing)
- **Real-time multiplayer** (advanced)

---

## 📋 Your Integration Summary

**Project**: Ball Sort Puzzle - Color Games
**Games Services App ID**: 575215256126
**Package Name**: com.ballsortpuzzle.game
**SDK Status**: ✅ Integrated and ready for testing
**Authentication**: ✅ Configured with OAuth client ID
**Features**: ✅ Achievements, Leaderboards, Player profiles

---

## 🔧 Quick Reference Commands

### Essential Commands
```powershell
# Add Games Services plugin
cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=575215256126

# Build debug APK
cordova build android --debug

# Install APK on device
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | findstr "Ball Sort"
```

---

## 🎉 Success!

Your Google Play Games Services SDK is now integrated into your APK! Your Ball Sort Puzzle game can now authenticate users, unlock achievements, submit scores to leaderboards, and access player profiles.

**What You've Accomplished:**
- 🎮 **Games Services SDK integrated** into Cordova project
- 📱 **APK builds with Games Services** functionality
- 🔑 **Authentication system** ready for testing
- 🏆 **Achievement and leaderboard systems** functional
- 👤 **Player profile access** configured

**Final Step**: Publish your Games Services project to make it available to all users (not just test users).

---

## 📞 Need Help?

- **Cordova Games Services Plugin**: https://github.com/artberri/cordova-plugin-games-services
- **Google Play Games Services**: https://developers.google.com/games/services
- **Android Development**: https://developer.android.com/guide

**Happy Gaming! 🎮**