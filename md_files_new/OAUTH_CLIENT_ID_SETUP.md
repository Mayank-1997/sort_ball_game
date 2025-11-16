# 🔑 OAuth Client ID Creation for Google Play Games Services

**Step-by-Step Guide to Create OAuth Client ID in Google Cloud Platform**

---

## 📋 Overview

An OAuth client ID uniquely identifies your Ball Sort Puzzle app to Google's OAuth servers. This is required for Google Play Games Services authentication and must be created for your Android app.

**What You'll Accomplish:**
- ✅ Create OAuth 2.0 client ID for Android
- ✅ Configure package name and signing certificate
- ✅ Link client ID to Games Services project
- ✅ Get credentials ready for app integration
- ✅ Prepare for APK development

---

## 🚀 Step 1: Access Credentials Section

### 1.1 Navigate to Credentials
1. In **Google Cloud Console**: https://console.cloud.google.com/
2. Make sure you're in the **correct project** (same as Games Services)
3. Go to **"APIs & Services"** → **"Credentials"**
4. You should see the OAuth consent screen you just created

### 1.2 Verify Prerequisites
Before creating credentials, ensure:
- ✅ **OAuth consent screen is configured** (completed in previous step)
- ✅ **Google Play Games API is enabled**
- ✅ **Correct project selected**

---

## 🔧 Step 2: Create New Credentials

### 2.1 Start Credential Creation
1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth client ID"** from the dropdown menu

### 2.2 Enable APIs (If Prompted)
If you see a message about enabling APIs:
1. Click **"ENABLE APIS AND SERVICES"**
2. Search for **"Google Play Games Services API"**
3. Click **"Enable"**
4. Return to **"Credentials"** and try again

---

## 📱 Step 3: Configure Application Type

### 3.1 Choose Application Type
You'll see several options. **Select: "Android"**

**Available Options:**
- Web application
- **Android** ← **Choose this one**
- iOS
- Chrome app
- TV and limited input devices

**Why Android?**
- Your Ball Sort Puzzle will be an Android APK
- Games Services requires Android-specific configuration
- Includes package name and certificate fingerprint

### 3.2 Click "Android" and Continue

---

## 📝 Step 4: Configure Android Client Details

### 4.1 Required Information
You'll need to provide specific details about your Android app:

**Name (Required):**
```
Ball Sort Puzzle - Android Client
```
*This is just for identification in your Google Cloud project*

**Package name (Required):**
```
com.ballsortpuzzle.game
```
*This must match the package name in your config.xml file*

**SHA-1 certificate fingerprint (Required):**
*This identifies your app's signing certificate*

---

## 🔐 Step 5: Get Your SHA-1 Certificate Fingerprint

### 5.1 For Debug/Testing (Development)
This is what you need **right now** for testing:

**Open PowerShell and run:**
```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**Look for this line in the output:**
```
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

**Copy the entire SHA-1 fingerprint** (including colons)

### 5.2 Alternative Method (If Above Doesn't Work)
If you don't have the debug keystore yet:

```powershell
# Navigate to your project directory
cd "C:\Users\mayank_aggarwal2\ball_sort_game"

# Generate debug keystore if it doesn't exist
keytool -genkey -v -keystore debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android

# Then get the fingerprint
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 5.3 For Production (Later)
When you create your release APK, you'll need to:
1. Generate a production keystore
2. Get the SHA-1 fingerprint from that keystore
3. Add it as an additional client ID

**Production command (for later):**
```powershell
keytool -list -v -keystore your-production.keystore -alias your-production-alias
```

---

## ✅ Step 6: Complete Client ID Creation

### 6.1 Fill in the Form
Now complete the OAuth client ID form:

**Name:**
```
Ball Sort Puzzle - Android Client
```

**Package name:**
```
com.ballsortpuzzle.game
```

**SHA-1 certificate fingerprint:**
```
[Paste your SHA-1 fingerprint here]
```
*Example: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0*

### 6.2 Create the Client ID
1. Double-check all information is correct
2. Click **"CREATE"**
3. Wait for Google to process the request

### 6.3 Save Your Client ID
You'll see a popup with your new client ID:
```
Client ID: 123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**IMPORTANT:** 
- ✅ **Copy and save this Client ID** - you'll need it later
- ✅ **Download the JSON file** if offered (contains all configuration)
- ✅ **Keep it secure** - this identifies your app

---

## 🔗 Step 7: Link to Games Services

### 7.1 Update Games Services Configuration
Now you need to connect this client ID to your Games Services project:

1. Go to **Google Play Console**: https://play.google.com/console
2. Navigate to **"Games Services & APIs"**
3. Find your **Ball Sort Puzzle** Games Services project
4. Go to **"Configuration"** or **"Linked Apps"**

### 7.2 Add Android App
1. Click **"Link Another App"** or **"Add Android App"**
2. Enter the same information:
   - **Package name**: `com.ballsortpuzzle.game`
   - **SHA-1 fingerprint**: [Your fingerprint]
3. **Save** the configuration

### 7.3 Verify Integration
Your Games Services project should now show:
- ✅ **Android app linked**
- ✅ **Package name matches**
- ✅ **Certificate fingerprint verified**
- ✅ **Client ID connected**

---

## 📋 Step 8: Update Your Game Code

### 8.1 Files to Update
You'll need to update these files with your real Client ID:

**config.xml:**
```xml
<!-- Replace the sample ID with your real Client ID -->
<plugin name="cordova-plugin-games-services" spec="^1.3.0">
    <variable name="ANDROID_APP_ID" value="YOUR_GAMES_SERVICES_APP_ID" />
    <variable name="CLIENT_ID" value="123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com" />
</plugin>
```

**package.json:**
```json
{
  "cordova": {
    "plugins": {
      "cordova-plugin-games-services": {
        "ANDROID_APP_ID": "YOUR_GAMES_SERVICES_APP_ID",
        "CLIENT_ID": "123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com"
      }
    }
  }
}
```

### 8.2 JavaScript Configuration
If you have Games Services configuration in your JS files:
```javascript
const GOOGLE_PLAY_CONFIG = {
    clientId: "123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com",
    applicationId: "YOUR_GAMES_SERVICES_APP_ID",
    // ... other settings
};
```

---

## 🧪 Step 9: Test Your Configuration

### 9.1 Verify Client ID Works
To test if your OAuth client ID is properly configured:

1. **Build your app** with the new client ID
2. **Install on test device** with a test user account
3. **Try Games Services sign-in**
4. **Should authenticate successfully**

### 9.2 Debug Authentication Issues
If authentication fails, check:
- ✅ **Package name matches** exactly
- ✅ **SHA-1 fingerprint is correct**
- ✅ **Test user is added** to OAuth consent screen
- ✅ **Client ID is correct** in app configuration
- ✅ **Games Services project is linked**

### 9.3 Common Errors and Solutions

**"Developer Error" or "Invalid Client":**
- **Cause**: Package name or SHA-1 mismatch
- **Solution**: Verify package name and regenerate SHA-1 fingerprint

**"Sign-in failed":**
- **Cause**: Test user not added or OAuth consent screen not configured
- **Solution**: Add test user to OAuth consent screen

**"App not authorized":**
- **Cause**: Client ID not linked to Games Services project
- **Solution**: Verify client ID in Games Services configuration

---

## 📱 Step 10: Production Preparation

### 10.1 Additional Client IDs Needed
For production release, you'll need:

1. **Debug Client ID** ← You just created this
2. **Release Client ID** ← Create this when you have production keystore

### 10.2 Create Release Client ID (Later)
When you're ready for production:
1. Generate production keystore
2. Get SHA-1 fingerprint from production keystore
3. Create new OAuth client ID with production fingerprint
4. Update app configuration with both debug and release client IDs

### 10.3 Multiple Environments
You can have multiple client IDs for:
- **Development/Debug** (using debug keystore)
- **Production/Release** (using production keystore)
- **Different package names** (if you have variants)

---

## ✅ Step 11: Verification Checklist

### 11.1 OAuth Client ID Checklist
Before proceeding, verify:
- ✅ **OAuth client ID created** for Android
- ✅ **Package name**: `com.ballsortpuzzle.game`
- ✅ **SHA-1 fingerprint added** (debug keystore)
- ✅ **Client ID saved** and documented
- ✅ **Games Services project linked** to client ID
- ✅ **App configuration updated** with real client ID

### 11.2 Your OAuth Setup Summary
**Application Type**: Android
**Package Name**: `com.ballsortpuzzle.game`
**Client ID**: `123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`
**Certificate**: Debug SHA-1 fingerprint added
**Status**: Ready for APK development

---

## 🎯 Next Steps

### Completed Steps:
1. ✅ **Play Games services project created**
2. ✅ **OAuth consent screen configured**
3. ✅ **OAuth client ID created** ← You just completed this!

### Remaining Steps:
4. 🔄 **Add Games Services SDK to APK** ← Next step
5. 👥 **Add testers to project**
6. 🚀 **Publish project**

### Ready for SDK Integration
With your OAuth client ID configured, you're now ready to:
- Add Games Services SDK to your Cordova app
- Build APK with authentication capability
- Test Games Services features with real users

---

## 🔧 Troubleshooting Commands

### Get SHA-1 Fingerprint (Debug)
```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### Verify Package Name
Check your `config.xml` file:
```xml
<widget id="com.ballsortpuzzle.game" ...>
```

### Test Client ID Format
Your client ID should look like:
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

---

## 🎉 Success!

Your OAuth client ID is now created and configured! Your Google Play Games Services integration can now authenticate users with your specific app identity.

**What You've Accomplished:**
- 🔑 **Created Android OAuth client ID**
- 📱 **Configured package name and certificate**
- 🔗 **Linked to Games Services project**
- ⚙️ **Ready for SDK integration**

**Next Step**: Add the Games Services SDK to your APK to enable authentication and gaming features.

---

## 📞 Need Help?

- **Google Cloud Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth 2.0 Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Games Services Setup**: https://developers.google.com/games/services/console/enabling

**Happy Gaming! 🎮**