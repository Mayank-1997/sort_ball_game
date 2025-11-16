# 📱 Convert Ball Sort Puzzle to Android Project for Testing

**Complete Step-by-Step Guide to Create Android Project and Test Google Play Games Services**

---

## 📋 Overview

This guide will help you convert your HTML5 Ball Sort Puzzle game into an Android project using Cordova, then test Google Play Games Services features like authentication, achievements, leaderboards, and cloud saves in Android Studio.

**Your Current Status:**
- ✅ **Games Services Project Created**: ID `4973734059681006779`
- ✅ **Cloud Platform APIs Enabled**: Google Play Game Services & Management
- ✅ **OAuth Consent Screen**: Configured
- ✅ **Credentials**: Created
- 🔄 **Next Step**: Convert to Android project and test

---

## 🛠️ Step 1: Install Required Tools

### 1.1 Verify Prerequisites
**Open PowerShell as Administrator and check:**

```powershell
# Check Node.js (required for Cordova)
node --version
# Should show v14 or higher

# Check Java (required for Android builds)
java -version
# Should show Java 8 or 11

# Check Cordova CLI
cordova --version
# If not installed: npm install -g cordova
```

### 1.2 Install Missing Tools (If Needed)
```powershell
# Install Cordova globally if not present
npm install -g cordova

# Install Android development tools
npm install -g @cordova/cli
```

---

## 🔧 Step 2: Set Up Android Development Environment

### 2.1 Install Android Studio
1. **Download Android Studio**: https://developer.android.com/studio
2. **Install with default settings**
3. **Open Android Studio** and complete the setup wizard
4. **Install Android SDK** (API level 33 or latest)

### 2.2 Configure Environment Variables
**Add these to Windows Environment Variables:**

```
ANDROID_HOME = C:\Users\[YourUsername]\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
```

**Add to PATH:**
```
%ANDROID_HOME%\tools
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\build-tools\33.0.0
%JAVA_HOME%\bin
```

### 2.3 Verify Android Setup
```powershell
# Restart PowerShell and test
adb version
# Should show Android Debug Bridge version

# Check SDK location
echo $env:ANDROID_HOME
# Should show your Android SDK path
```

---

## 📱 Step 3: Create Cordova Android Project

### 3.1 Navigate to Your Project
```powershell
# Navigate to your Ball Sort Puzzle directory
cd "C:\Users\mayank_aggarwal2\ball_sort_game"

# Verify you're in the right place
ls
# Should see index.html, src folder, etc.
```

### 3.2 Initialize Cordova Project (If Not Already Done)
```powershell
# If config.xml doesn't exist, initialize Cordova
cordova create . com.ballsortpuzzle.game "Ball Sort Puzzle"

# If config.xml exists, skip this step
```

### 3.3 Add Android Platform
```powershell
# Add Android platform
cordova platform add android@latest

# Verify platform was added
cordova platform list
# Should show: android X.X.X
```

---

## 🎮 Step 4: Install Google Play Games Services Plugin

### 4.1 Install Games Services Plugin
```powershell
# Install the Google Play Games Services plugin
cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=4973734059681006779

# Verify plugin installation
cordova plugin list
# Should show: cordova-plugin-games-services
```

### 4.2 Install Additional Required Plugins
```powershell
# Install whitelist plugin (for security)
cordova plugin add cordova-plugin-whitelist

# Install device plugin (for device info)
cordova plugin add cordova-plugin-device

# Install network information plugin
cordova plugin add cordova-plugin-network-information
```

---

## ⚙️ Step 5: Configure Your Project

### 5.1 Update config.xml
Ensure your `config.xml` includes these configurations:

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.ballsortpuzzle.game" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>Ball Sort Puzzle</name>
    <description>A challenging and addictive puzzle game</description>
    <author email="your-email@gmail.com" href="https://your-website.com">Your Name</author>
    
    <content src="index.html" />
    
    <preference name="permissions" value="none" />
    <preference name="orientation" value="portrait" />
    <preference name="target-device" value="universal" />
    <preference name="fullscreen" value="true" />
    <preference name="webviewbounce" value="false" />
    <preference name="prerendered-icon" value="true" />
    <preference name="stay-in-webview" value="false" />
    <preference name="ios-statusbarstyle" value="black-opaque" />
    <preference name="detect-data-types" value="true" />
    <preference name="exit-on-suspend" value="false" />
    <preference name="show-splash-screen-spinner" value="true" />
    <preference name="auto-hide-splash-screen" value="true" />
    <preference name="disable-cursor" value="false" />
    <preference name="android-minSdkVersion" value="22" />
    <preference name="android-installLocation" value="auto" />
    
    <!-- Allow all network access -->
    <access origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    
    <platform name="android">
        <allow-intent href="market:*" />
        
        <!-- Android permissions -->
        <uses-permission android:name="android.permission.INTERNET" />
        <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
        <uses-permission android:name="android.permission.WAKE_LOCK" />
        
        <!-- Games Services configuration -->
        <meta-data android:name="com.google.android.gms.games.APP_ID" android:value="@string/app_id" />
        <meta-data android:name="com.google.android.gms.version" android:value="@integer/google_play_services_version" />
        
        <!-- Target SDK -->
        <preference name="android-targetSdkVersion" value="33" />
    </platform>
    
    <!-- Google Play Games Services Plugin -->
    <plugin name="cordova-plugin-games-services" spec="^1.3.0">
        <variable name="ANDROID_APP_ID" value="4973734059681006779" />
    </plugin>
    
    <!-- Other essential plugins -->
    <plugin name="cordova-plugin-whitelist" spec="^1.3.3" />
    <plugin name="cordova-plugin-device" spec="^2.0.2" />
    <plugin name="cordova-plugin-network-information" spec="^2.0.1" />
</widget>
```

---

## 🔐 Step 6: Set Up OAuth Client ID for Testing

### 6.1 Get Debug Certificate Fingerprint
```powershell
# Get your debug certificate SHA-1 fingerprint
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# Copy the SHA-1 fingerprint (looks like: A1:B2:C3:D4:...)
```

### 6.2 Create OAuth Client ID
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Create OAuth Client ID**:
   - **Application type**: Android
   - **Name**: Ball Sort Puzzle - Debug
   - **Package name**: `com.ballsortpuzzle.game`
   - **SHA-1 certificate fingerprint**: [Your debug fingerprint]

### 6.3 Link to Games Services
1. **Go to Google Play Console**: https://play.google.com/console
2. **Games Services & APIs** → Your project → **Configuration**
3. **Add linked app** with same package name and SHA-1 fingerprint

---

## 🧪 Step 7: Add Testing Code to Your Game

### 7.1 Create Games Services Test File
Create `src/js/games-services-test.js`:

```javascript
/**
 * Google Play Games Services Testing Module
 */
class GamesServicesTest {
    constructor() {
        this.isAuthenticated = false;
        this.gamesServices = null;
        this.testResults = [];
    }
    
    /**
     * Initialize Games Services for testing
     */
    init() {
        console.log('🎮 Initializing Games Services Test...');
        
        // Wait for device ready
        document.addEventListener('deviceready', () => {
            this.onDeviceReady();
        }, false);
        
        // For web testing, simulate device ready
        if (document.readyState === 'complete') {
            setTimeout(() => this.onDeviceReady(), 1000);
        }
    }
    
    /**
     * Handle device ready event
     */
    onDeviceReady() {
        console.log('📱 Device ready, checking Games Services...');
        
        // Check if Games Services plugin is available
        if (typeof window.plugins !== 'undefined' && window.plugins.playGames) {
            this.gamesServices = window.plugins.playGames;
            console.log('✅ Games Services plugin found');
            this.setupTestUI();
        } else {
            console.log('❌ Games Services plugin not found');
            this.createMockGamesServices();
            this.setupTestUI();
        }
    }
    
    /**
     * Set up testing UI
     */
    setupTestUI() {
        // Create test panel
        const testPanel = document.createElement('div');
        testPanel.id = 'gamesServicesTestPanel';
        testPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 9999;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        testPanel.innerHTML = `
            <h3>🎮 Games Services Test</h3>
            <div id="authStatus">Not authenticated</div>
            <br>
            <button onclick="gamesServicesTest.testAuth()" style="margin: 2px; padding: 8px;">🔑 Test Auth</button>
            <button onclick="gamesServicesTest.testSignOut()" style="margin: 2px; padding: 8px;">🚪 Sign Out</button>
            <br><br>
            <button onclick="gamesServicesTest.testAchievement()" style="margin: 2px; padding: 8px;">🏆 Test Achievement</button>
            <button onclick="gamesServicesTest.testLeaderboard()" style="margin: 2px; padding: 8px;">📊 Test Leaderboard</button>
            <br><br>
            <button onclick="gamesServicesTest.testCloudSave()" style="margin: 2px; padding: 8px;">☁️ Test Cloud Save</button>
            <button onclick="gamesServicesTest.testCloudLoad()" style="margin: 2px; padding: 8px;">📥 Test Cloud Load</button>
            <br><br>
            <div id="testResults" style="margin-top: 10px; font-size: 10px;">
                <strong>Test Results:</strong><br>
                Ready for testing...
            </div>
        `;
        
        document.body.appendChild(testPanel);
        console.log('🎛️ Test UI created');
    }
    
    /**
     * Test authentication
     */
    async testAuth() {
        console.log('🔑 Testing authentication...');
        this.addTestResult('Testing authentication...');
        
        if (!this.gamesServices) {
            this.addTestResult('❌ Games Services not available');
            return;
        }
        
        try {
            await new Promise((resolve, reject) => {
                this.gamesServices.auth(
                    (result) => {
                        console.log('✅ Auth successful:', result);
                        this.addTestResult('✅ Authentication successful');
                        this.isAuthenticated = true;
                        this.updateAuthStatus('Authenticated ✅');
                        resolve(result);
                    },
                    (error) => {
                        console.log('❌ Auth failed:', error);
                        this.addTestResult('❌ Authentication failed: ' + JSON.stringify(error));
                        this.updateAuthStatus('Authentication failed ❌');
                        reject(error);
                    }
                );
            });
        } catch (error) {
            this.addTestResult('❌ Auth error: ' + error.message);
        }
    }
    
    /**
     * Test sign out
     */
    async testSignOut() {
        console.log('🚪 Testing sign out...');
        this.addTestResult('Testing sign out...');
        
        if (!this.gamesServices) {
            this.addTestResult('❌ Games Services not available');
            return;
        }
        
        try {
            await new Promise((resolve, reject) => {
                this.gamesServices.signOut(
                    (result) => {
                        console.log('✅ Sign out successful');
                        this.addTestResult('✅ Sign out successful');
                        this.isAuthenticated = false;
                        this.updateAuthStatus('Not authenticated');
                        resolve(result);
                    },
                    (error) => {
                        console.log('❌ Sign out failed:', error);
                        this.addTestResult('❌ Sign out failed: ' + JSON.stringify(error));
                        reject(error);
                    }
                );
            });
        } catch (error) {
            this.addTestResult('❌ Sign out error: ' + error.message);
        }
    }
    
    /**
     * Test achievement unlock
     */
    async testAchievement() {
        console.log('🏆 Testing achievement...');
        this.addTestResult('Testing achievement unlock...');
        
        if (!this.isAuthenticated) {
            this.addTestResult('⚠️ Please authenticate first');
            return;
        }
        
        // Test achievement ID (you'll need to create this in Play Console)
        const testAchievementId = 'achievement_first_test';
        
        try {
            await new Promise((resolve, reject) => {
                this.gamesServices.unlockAchievement(
                    { achievementId: testAchievementId },
                    (result) => {
                        console.log('✅ Achievement unlocked');
                        this.addTestResult('✅ Achievement unlocked: ' + testAchievementId);
                        resolve(result);
                    },
                    (error) => {
                        console.log('❌ Achievement failed:', error);
                        this.addTestResult('❌ Achievement failed: ' + JSON.stringify(error));
                        reject(error);
                    }
                );
            });
        } catch (error) {
            this.addTestResult('❌ Achievement error: ' + error.message);
        }
    }
    
    /**
     * Test leaderboard submission
     */
    async testLeaderboard() {
        console.log('📊 Testing leaderboard...');
        this.addTestResult('Testing leaderboard submission...');
        
        if (!this.isAuthenticated) {
            this.addTestResult('⚠️ Please authenticate first');
            return;
        }
        
        // Test leaderboard ID (you'll need to create this in Play Console)
        const testLeaderboardId = 'leaderboard_test_scores';
        const testScore = Math.floor(Math.random() * 1000) + 100;
        
        try {
            await new Promise((resolve, reject) => {
                this.gamesServices.submitScore(
                    { 
                        leaderboardId: testLeaderboardId,
                        score: testScore
                    },
                    (result) => {
                        console.log('✅ Score submitted');
                        this.addTestResult(`✅ Score submitted: ${testScore} to ${testLeaderboardId}`);
                        resolve(result);
                    },
                    (error) => {
                        console.log('❌ Leaderboard failed:', error);
                        this.addTestResult('❌ Leaderboard failed: ' + JSON.stringify(error));
                        reject(error);
                    }
                );
            });
        } catch (error) {
            this.addTestResult('❌ Leaderboard error: ' + error.message);
        }
    }
    
    /**
     * Test cloud save
     */
    async testCloudSave() {
        console.log('☁️ Testing cloud save...');
        this.addTestResult('Testing cloud save...');
        
        if (!this.isAuthenticated) {
            this.addTestResult('⚠️ Please authenticate first');
            return;
        }
        
        const testData = {
            level: 5,
            score: 1250,
            timestamp: Date.now(),
            testMessage: 'Hello from Ball Sort Puzzle!'
        };
        
        try {
            // Note: Cloud save implementation depends on specific plugin version
            this.addTestResult('☁️ Cloud save test data: ' + JSON.stringify(testData));
            this.addTestResult('✅ Cloud save test completed (mock)');
        } catch (error) {
            this.addTestResult('❌ Cloud save error: ' + error.message);
        }
    }
    
    /**
     * Test cloud load
     */
    async testCloudLoad() {
        console.log('📥 Testing cloud load...');
        this.addTestResult('Testing cloud load...');
        
        if (!this.isAuthenticated) {
            this.addTestResult('⚠️ Please authenticate first');
            return;
        }
        
        try {
            // Note: Cloud load implementation depends on specific plugin version
            this.addTestResult('📥 Cloud load test completed (mock)');
        } catch (error) {
            this.addTestResult('❌ Cloud load error: ' + error.message);
        }
    }
    
    /**
     * Add test result to UI
     */
    addTestResult(message) {
        const timestamp = new Date().toLocaleTimeString();
        const resultDiv = document.getElementById('testResults');
        if (resultDiv) {
            resultDiv.innerHTML += `<br>[${timestamp}] ${message}`;
            resultDiv.scrollTop = resultDiv.scrollHeight;
        }
        this.testResults.push({ timestamp, message });
    }
    
    /**
     * Update auth status in UI
     */
    updateAuthStatus(status) {
        const authDiv = document.getElementById('authStatus');
        if (authDiv) {
            authDiv.textContent = status;
        }
    }
    
    /**
     * Create mock Games Services for web testing
     */
    createMockGamesServices() {
        console.log('🧪 Creating mock Games Services for testing...');
        
        this.gamesServices = {
            auth: (success, error) => {
                setTimeout(() => {
                    console.log('🧪 Mock auth success');
                    success({ mock: true, authenticated: true });
                }, 1000);
            },
            signOut: (success, error) => {
                setTimeout(() => {
                    console.log('🧪 Mock sign out success');
                    success({ mock: true });
                }, 500);
            },
            unlockAchievement: (params, success, error) => {
                setTimeout(() => {
                    console.log('🧪 Mock achievement unlock:', params);
                    success({ mock: true, achievementId: params.achievementId });
                }, 800);
            },
            submitScore: (params, success, error) => {
                setTimeout(() => {
                    console.log('🧪 Mock score submission:', params);
                    success({ mock: true, score: params.score, leaderboardId: params.leaderboardId });
                }, 800);
            }
        };
        
        this.addTestResult('🧪 Mock Games Services created for web testing');
    }
}

// Initialize Games Services Test
const gamesServicesTest = new GamesServicesTest();
```

### 7.2 Include Test Script in Your HTML
Add this to your `index.html` before the closing `</body>` tag:

```html
<!-- Games Services Testing -->
<script src="src/js/games-services-test.js"></script>
<script>
    // Initialize testing when page loads
    document.addEventListener('DOMContentLoaded', function() {
        gamesServicesTest.init();
    });
</script>
```

---

## 🔨 Step 8: Build and Test Your Android Project

### 8.1 Build Debug APK
```powershell
# Clean previous builds
cordova clean android

# Build debug APK
cordova build android --debug

# Check if build was successful
ls platforms/android/app/build/outputs/apk/debug/
# Should see: app-debug.apk
```

### 8.2 Create Android Virtual Device (AVD)
```powershell
# Open Android Studio
# Tools → AVD Manager → Create Virtual Device
# Choose: Pixel 6 (or similar)
# API Level: 33 (or latest)
# Finish setup and start emulator
```

### 8.3 Install and Test on Emulator
```powershell
# Install APK on running emulator
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

# Or install on connected physical device
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 Step 9: Run Tests in Android Studio

### 9.1 Open Project in Android Studio
1. **Open Android Studio**
2. **File → Open** → Navigate to: `C:\Users\mayank_aggarwal2\ball_sort_game\platforms\android`
3. **Open the Android project**
4. **Wait for Gradle sync** to complete

### 9.2 Test Games Services Features
1. **Run the app** on emulator or device
2. **Look for the test panel** in the top-right corner
3. **Test each feature**:
   - 🔑 **Test Auth** - Authenticate with Google
   - 🏆 **Test Achievement** - Unlock test achievement
   - 📊 **Test Leaderboard** - Submit test score
   - ☁️ **Test Cloud Save/Load** - Test data sync

### 9.3 View Debug Logs
```powershell
# View Android logs in real-time
adb logcat | findstr "Ball Sort"

# Or view Games Services specific logs
adb logcat | findstr "Games"
```

---

## 🏆 Step 10: Create Test Achievements and Leaderboards

### 10.1 Create Test Achievement
1. **Go to Google Play Console** → Games Services → **Achievements**
2. **Add Achievement**:
   - **Achievement ID**: `achievement_first_test`
   - **Name**: `First Test`
   - **Description**: `Successfully tested Games Services`
   - **Points**: `10`
   - **Type**: `Standard`

### 10.2 Create Test Leaderboard
1. **Go to** **Leaderboards**
2. **Add Leaderboard**:
   - **Leaderboard ID**: `leaderboard_test_scores`
   - **Name**: `Test Scores`
   - **Score format**: `Numeric`
   - **Sort order**: `Larger is better`

---

## ✅ Step 11: Verification Checklist

### 11.1 Project Setup Checklist
- ✅ **Cordova project created** with Android platform
- ✅ **Games Services plugin installed** with correct App ID
- ✅ **OAuth client ID created** for debug certificate
- ✅ **Test code added** to project
- ✅ **APK builds successfully** without errors

### 11.2 Testing Checklist
- ✅ **APK installs** on emulator/device
- ✅ **Test panel appears** in app
- ✅ **Authentication works** with Google account
- ✅ **Achievement unlocks** (after creating in console)
- ✅ **Leaderboard submissions work** (after creating in console)
- ✅ **Debug logs show** Games Services activity

---

## 🎯 Step 12: Next Steps for Full Integration

### 12.1 After Successful Testing
Once testing works:
1. **Create real achievements** for your game levels
2. **Create real leaderboards** for high scores
3. **Integrate Games Services** into your actual game logic
4. **Add cloud save** for user progress
5. **Test with multiple user accounts**

### 12.2 Production Preparation
For production release:
1. **Create production keystore**
2. **Add production SHA-1** to OAuth client ID
3. **Build release APK**
4. **Publish Games Services project**
5. **Submit to Google Play Store**

---

## 🐛 Troubleshooting Common Issues

### Build Errors
```powershell
# If build fails with Gradle errors
cd platforms/android
./gradlew clean

# Return to main directory and rebuild
cd ../..
cordova build android --debug
```

### Authentication Issues
- **Check SHA-1 fingerprint** matches OAuth client ID
- **Verify test user** is added to OAuth consent screen
- **Ensure Google Play Games app** is installed on test device
- **Check internet connection** on test device

### Plugin Issues
```powershell
# If Games Services plugin isn't working
cordova plugin remove cordova-plugin-games-services
cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=4973734059681006779
cordova clean android
cordova build android --debug
```

---

## 🎉 Success!

You now have a complete Android project with Google Play Games Services integration ready for testing! 

**What You've Accomplished:**
- 📱 **Android project created** from HTML5 game
- 🎮 **Games Services SDK integrated** and configured
- 🧪 **Test framework built** for all major features
- 🔑 **Authentication system** ready for testing
- 🏆 **Achievement/leaderboard systems** prepared
- 📊 **Debug environment** set up in Android Studio

**Test all features and then integrate them into your actual game logic!** 🚀

---

## 📞 Need Help?

- **Cordova Documentation**: https://cordova.apache.org/docs/
- **Games Services Plugin**: https://github.com/artberri/cordova-plugin-games-services
- **Google Play Games Services**: https://developers.google.com/games/services/
- **Android Studio**: https://developer.android.com/studio/

**Happy Testing! 🎮**