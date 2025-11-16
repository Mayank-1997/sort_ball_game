# 🎮 Google Play Games Services Setup Guide

**Complete Step-by-Step Guide to Create Your Game Services ID**

---

## 📋 Overview

This guide will help you create a **Google Play Games Services project** and get your **Application ID** to replace the sample ID `4973734059681006779` in your Ball Sort Puzzle game.

**What You'll Get:**
- ✅ Real Google Play Games Services Application ID
- ✅ Achievements configuration
- ✅ Leaderboards setup
- ✅ Test accounts for immediate testing
- ✅ Ready-to-use integration

---

## 🚀 Step 1: Access Google Play Console

### 1.1 Navigate to Console
1. Open your browser and go to: **https://play.google.com/console**
2. **Sign in** with your Google Play Console developer account
3. You should see your **Ball Sort Puzzle** app in the dashboard

### 1.2 Find Games Services Section
1. In the **left sidebar**, look for **"Games Services & APIs"**
2. Click on **"Games Services & APIs"**
3. If you don't see it, look under **"Advanced features"** or **"Grow"** section

**Screenshot Location:** Left sidebar → Games Services & APIs

---

## 🎯 Step 2: Create Game Services Project

### 2.1 Start New Game Project
1. Click **"Setup and manage"** or **"Create Game"** button
2. You'll see two options:
   - "I don't have a game in the Play Console yet"
   - **"I have a game in the Play Console"** ← **Choose this option**

### 2.2 Link to Existing App
1. **Select your app** from the dropdown menu:
   - Look for your **Ball Sort Puzzle** app
   - Package name should be something like `com.ballsortpuzzle.game`
2. Click **"Use this game"** or **"Continue"**

### 2.3 Configure Game Details
Fill in the required information:

**Game Information:**
- **Game name:** `Ball Sort Puzzle` (or your preferred name)
- **Description:** `A challenging and addictive puzzle game where you sort colored balls into tubes`
- **Category:** `Puzzle`
- **Content rating:** `Everyone` (suitable for all ages)

**Graphics Assets Required:**
- **Game icon:** 512×512 px PNG (you can use your app icon)
- **Feature graphic:** 1024×500 px PNG (optional but recommended)

### 2.4 Complete Creation
1. Review all details
2. Click **"Create"** or **"Save and continue"**
3. Wait for the project to be created (usually takes 1-2 minutes)

---

## 🔑 Step 3: Get Your Application ID

### 3.1 Access Game Dashboard
After creation, you'll be redirected to your **Game Services dashboard**

### 3.2 Find Your Application ID
1. Look for **"Game details"** or **"Configuration"** section
2. You'll see **"Application ID"** or **"Game Services ID"**
3. **This is your unique ID** - it will be a **12-13 digit number** like: `123456789012`

### 3.3 Copy Your ID
1. **Select and copy** the entire Application ID
2. **Save it safely** - you'll need this to replace the sample ID in your code

**Example format:** `497373405968100677` (your ID will be different)

---

## 📱 Step 4: Configure Android App Link

### 4.1 Link Android App
1. In your Game Services dashboard, find **"Linked Apps"** section
2. Click **"Link Another App"** or **"Add Android App"**
3. Choose **"Android"** platform

### 4.2 Enter App Details
**Required Information:**
- **Package name:** `com.ballsortpuzzle.game` (match your config.xml)
- **Display name:** `Ball Sort Puzzle`
- **Launch URL:** Leave blank for now

### 4.3 Add Certificate Fingerprint (Important!)

**For Testing (Debug Certificate):**
1. Open **PowerShell** or **Command Prompt**
2. Run this command:
```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

3. **Copy the SHA-1 fingerprint** (it looks like: `A1:B2:C3:D4:E5:F6:...`)
4. **Paste it** in the certificate field in Google Play Console

**For Production (Release Certificate):**
- You'll add this later when you create your release keystore

### 4.4 Save Linked App
1. Click **"Save"** or **"Create"**
2. Your Android app is now linked to Game Services

---

## 🏆 Step 5: Create Achievements (Optional but Recommended)

### 5.1 Access Achievements
1. In Game Services dashboard, click **"Achievements"**
2. Click **"Add Achievement"**

### 5.2 Create Your First Achievement
**Example Achievement:**
- **Achievement ID:** `achievement_first_level`
- **Name:** `First Steps`
- **Description:** `Complete your first level`
- **Icon:** Upload a 512×512 px icon (you can create a simple star icon)
- **Points:** `10`
- **Type:** `Standard` (unlocked once)
- **State:** `Published`

### 5.3 Create More Achievements
Add more achievements for better player engagement:

```
Achievement ID: achievement_ten_levels
Name: Getting Started
Description: Complete 10 levels
Points: 25

Achievement ID: achievement_perfect_sort
Name: Perfect Sorting
Description: Complete a level without any mistakes
Points: 50

Achievement ID: achievement_speed_master
Name: Speed Master
Description: Complete a level in under 30 seconds
Points: 75
```

### 5.4 Save Achievements
1. Click **"Save"** for each achievement
2. Set status to **"Published"** to make them available for testing

---

## 📊 Step 6: Create Leaderboards (Optional)

### 6.1 Access Leaderboards
1. Click **"Leaderboards"** in Game Services dashboard
2. Click **"Add Leaderboard"**

### 6.2 Create Your First Leaderboard
**Example Leaderboard:**
- **Leaderboard ID:** `leaderboard_total_levels`
- **Name:** `Total Levels Completed`
- **Icon:** 512×512 px icon
- **Score format:** `Numeric`
- **Sort order:** `Larger is better`
- **Score submission:** `Best score`

### 6.3 Create Additional Leaderboards
```
Leaderboard ID: leaderboard_fastest_completion
Name: Fastest Level Completion
Score format: Time (smaller is better)
Sort order: Smaller is better

Leaderboard ID: leaderboard_monthly_levels
Name: Monthly Levels Challenge
Score format: Numeric
Sort order: Larger is better
```

### 6.4 Save Leaderboards
1. **Save** each leaderboard
2. Set to **"Published"** status

---

## 🧪 Step 7: Add Test Accounts

### 7.1 Access Testing Section
1. In Game Services dashboard, find **"Testing"** section
2. Click **"Testing"** or **"Manage testers"**

### 7.2 Add Test Accounts
1. Click **"Add testers"** or **"Add test account"**
2. **Add email addresses:**
   - Your own Gmail account
   - Any other testers' Gmail accounts
   - Family members or friends who will help test

### 7.3 Configure Testing Settings
- **Enable internal testing**
- **Allow test accounts to see achievements**
- **Allow test accounts to access leaderboards**

**Important:** Only these test accounts can use Game Services features until your app is published!

---

## ⚙️ Step 8: Update Your Game Code

### 8.1 Files to Update
Replace the sample ID `4973734059681006779` with your real Application ID in:

1. **config.xml**
2. **package.json**
3. **Any JavaScript files** referencing Game Services

### 8.2 Update config.xml
```xml
<!-- BEFORE (Sample ID) -->
<plugin name="cordova-plugin-games-services" spec="^1.3.0">
    <variable name="ANDROID_APP_ID" value="4973734059681006779" />
</plugin>

<!-- AFTER (Your Real ID) -->
<plugin name="cordova-plugin-games-services" spec="^1.3.0">
    <variable name="ANDROID_APP_ID" value="YOUR_REAL_APPLICATION_ID" />
</plugin>
```

### 8.3 Update package.json
```json
{
  "cordova": {
    "plugins": {
      "cordova-plugin-games-services": {
        "ANDROID_APP_ID": "YOUR_REAL_APPLICATION_ID"
      }
    }
  }
}
```

### 8.4 Update JavaScript Configuration
If you have Game Services configuration in JavaScript files:
```javascript
const GOOGLE_PLAY_CONFIG = {
    applicationId: "YOUR_REAL_APPLICATION_ID",
    // ... other settings
};
```

---

## ✅ Step 9: Verify Your Setup

### 9.1 Check Your Configuration
Verify you have:
- ✅ **Application ID** (12-13 digits)
- ✅ **Android app linked** with correct package name
- ✅ **Certificate fingerprint** added
- ✅ **At least one test account** added
- ✅ **Achievements created** (optional but recommended)
- ✅ **Leaderboards created** (optional but recommended)

### 9.2 Test Readiness Checklist
- ✅ **Game Services project created**
- ✅ **Application ID copied**
- ✅ **Code updated** with real ID
- ✅ **Test accounts configured**
- ✅ **Debug certificate** added
- ✅ **Ready for app building and testing**

---

## 🚀 Step 10: Next Steps

### 10.1 Build Your App
1. **Update your code** with the real Application ID
2. **Build your Android app** using Cordova
3. **Install on test device** or emulator
4. **Test Game Services features** with your test account

### 10.2 Testing Features
Test these features with your test account:
- **Google Sign-In** (authentication)
- **Achievement unlocking** (if configured)
- **Leaderboard submission** (if configured)
- **Cloud save** (if implemented)

### 10.3 Production Preparation
When ready for production:
- **Add release certificate** fingerprint
- **Switch from test accounts** to public release
- **Publish your Play Console app**
- **Game Services automatically** goes live with your app

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### "Game Services not found"
- **Check:** Application ID is correct in all files
- **Verify:** Android app is properly linked
- **Ensure:** Certificate fingerprint matches your keystore

#### "Authentication failed"
- **Check:** Test account is added to Game Services
- **Verify:** Google Play Games app is installed on device
- **Ensure:** Device is signed in with test account

#### "Achievements not unlocking"
- **Check:** Achievement IDs match in code and console
- **Verify:** Achievements are set to "Published" status
- **Ensure:** Test account has proper permissions

#### "Certificate fingerprint issues"
- **Debug builds:** Use debug keystore fingerprint
- **Release builds:** Use production keystore fingerprint
- **Ensure:** Fingerprint format is correct (SHA-1)

---

## 📝 Summary

**You Now Have:**
- ✅ **Real Google Play Games Services Application ID**
- ✅ **Configured achievements and leaderboards**
- ✅ **Test accounts for immediate testing**
- ✅ **Linked Android app with certificates**
- ✅ **Ready-to-use Game Services integration**

**Your Application ID:** `[Your 12-13 digit number here]`

**Replace the sample ID** `4973734059681006779` with your real Application ID in all your code files, and you're ready to test all Google Play Games features!

---

## 📞 Need Help?

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer/
- **Game Services Documentation:** https://developers.google.com/games/services/
- **Cordova Plugin Documentation:** https://github.com/artberri/cordova-plugin-games-services

**Happy Gaming! 🎮**