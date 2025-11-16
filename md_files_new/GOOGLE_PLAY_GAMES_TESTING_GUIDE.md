# 🧪 Google Play Games Services Testing Guide

## 📱 **Testing Setup Instructions**

### **Step 1: Complete Google Play Games Services Setup**

1. **Complete Draft Configuration:**
   - Go to: https://play.google.com/console/u/1/developers/8600718169643501054/app/4973734059681006779/games/configuration
   - Fill all required fields (game name, description, category)
   - Add your app's package name: `com.ballsortpuzzle.game`
   - Add SHA-1 fingerprint (see command below)

2. **Generate SHA-1 Fingerprint:**
   ```bash
   # Windows Command
   keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
   
   # Look for: SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
   ```

3. **Move to Testing Status:**
   - Change from "Draft" to "Testing"
   - This will generate your 12-digit App ID
   - Copy the App ID to update config.xml

### **Step 2: Update App Configuration**

1. **Update config.xml with real App ID:**
   ```xml
   <plugin name="cordova-plugin-games-services" spec="^1.3.0">
       <variable name="ANDROID_APP_ID" value="123456789012" />
   </plugin>
   ```

2. **Add Test Accounts:**
   - Add your Google account as a test user
   - Add any other Gmail accounts for testing

### **Step 3: Build and Test**

1. **Build Cordova App:**
   ```bash
   cd c:\Users\mayank_aggarwal2\ball_sort_game
   cordova build android
   ```

2. **Open in Android Studio:**
   ```
   File → Open → Navigate to:
   c:\Users\mayank_aggarwal2\ball_sort_game\platforms\android
   ```

3. **Run on Test Device:**
   - Connect Android device via USB
   - Enable Developer Options + USB Debugging
   - Click "Run" in Android Studio

### **Step 4: Test Google Play Games Features**

#### **🔐 Authentication Testing**
```javascript
// Test Sign-In
1. Launch app on test device
2. Tap "Sign In" button
3. Should show Google account picker
4. Select test account
5. Should see "Signed In" status
6. Player name should appear
```

#### **🏆 Leaderboard Testing**
```javascript
// Test Score Submission
1. Complete a level in the game
2. Check console logs: "Score submitted to leaderboard"
3. Tap "Leaderboard" button
4. Should show leaderboard with your score
5. Try with multiple test accounts
```

#### **☁️ Cloud Save Testing**
```javascript
// Test Cloud Save/Load
1. Play several levels (save progress)
2. Check console: "Game data saved to cloud"
3. Uninstall and reinstall app
4. Sign in with same account
5. Progress should be restored
6. Check console: "Game data loaded from cloud"
```

### **Step 5: Debug Testing Issues**

#### **Common Issues & Solutions:**

1. **"Games Services not available"**
   ```
   ✅ Solution: Ensure device has Google Play Services installed
   ✅ Use real Android device (not all emulators work)
   ✅ Sign in with test account first in Play Games app
   ```

2. **"Authentication failed"**
   ```
   ✅ Solution: Check SHA-1 fingerprint is correct
   ✅ Ensure app package name matches exactly
   ✅ Verify test account is added to Google Play Console
   ```

3. **"Leaderboard not found"**
   ```
   ✅ Solution: Verify App ID is correct in config.xml
   ✅ Ensure Google Play Games config is in "Testing" status
   ✅ Check leaderboard IDs in your JavaScript code
   ```

4. **"Cloud save failed"**
   ```
   ✅ Solution: Ensure user is authenticated first
   ✅ Check Google Play Games permissions
   ✅ Verify data size is under limits (1MB max)
   ```

### **Step 6: Testing Workflow**

#### **Daily Testing Routine:**
```
1. 🔄 Build latest code: cordova build android
2. 📱 Deploy to test device: Android Studio Run
3. 🔐 Test authentication: Sign in/out
4. 🎮 Play some levels: Generate game data
5. 🏆 Check leaderboard: View scores
6. ☁️ Test cloud save: Reinstall app test
7. 📊 Monitor console logs: Check for errors
```

#### **Test Scenarios:**
```
✅ New user flow (first-time sign-in)
✅ Returning user flow (cloud save restore)
✅ Offline play (no internet)
✅ Multiple accounts (switch between test users)
✅ App lifecycle (background/foreground)
✅ Network interruption (during save/load)
```

### **Step 7: Monitor Test Results**

#### **Check These Logs:**
```javascript
// Console Output to Monitor:
"✅ Google Play Games authentication successful"
"✅ Score submitted successfully" 
"✅ Game data saved to cloud"
"✅ Game data loaded from cloud"
"📊 Leaderboard data received"

// Error Logs to Watch For:
"❌ Authentication failed"
"❌ Failed to submit score"
"❌ Failed to save to cloud"
"❌ Games Services not available"
```

### **Step 8: Production Readiness**

Before publishing to Play Store:
```
✅ Move Google Play Games from "Testing" to "Published"
✅ Test with production SHA-1 (release keystore)
✅ Verify all features work with production build
✅ Remove test console.log statements
✅ Test on multiple Android devices/versions
```

---

## 🔧 **Quick Testing Commands**

```bash
# Build for testing
cordova build android

# Install on connected device
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

# View console logs
adb logcat | grep -i "cordova\|games\|leaderboard"

# Clear app data (for clean testing)
adb shell pm clear com.ballsortpuzzle.game
```

---

## 📋 **Testing Checklist**

- [ ] Google Play Games Services configured in Console
- [ ] SHA-1 fingerprint added to configuration  
- [ ] App ID updated in config.xml
- [ ] Test accounts added to Games configuration
- [ ] Games status changed from "Draft" to "Testing"
- [ ] App built and deployed to test device
- [ ] Authentication working (sign in/out)
- [ ] Leaderboard submission working
- [ ] Cloud save/load working
- [ ] Multiple test accounts verified
- [ ] Offline functionality tested
- [ ] Console logs monitored for errors

**Once all tests pass, you can confidently publish your app to the Play Store!**