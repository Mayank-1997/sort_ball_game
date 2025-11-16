# 🔐 OAuth Consent Screen Setup for Google Play Games Services

**Step-by-Step Guide to Create OAuth Consent Screen in Google Cloud Platform**

---

## 📋 Overview

The OAuth consent screen is what users see when your app requests permission to access their Google account data through Google Play Games Services. This step is **required** before you can create credentials for your game.

**What You'll Accomplish:**
- ✅ Create OAuth consent screen for your game
- ✅ Configure app information and branding
- ✅ Set up scopes for Games Services
- ✅ Add test users for development
- ✅ Prepare for credential creation

---

## 🚀 Step 1: Access Google Cloud Console

### 1.1 Navigate to Google Cloud Console
1. Open your browser and go to: **https://console.cloud.google.com/**
2. **Sign in** with the same Google account you used for Play Games Services
3. **Select your project**: Look for the project you created during Play Games Services setup
   - Project name should be something like: `ball-sort-puzzle-game`
   - If you don't see your project, click the project dropdown at the top

### 1.2 Verify Correct Project
**Important:** Make sure you're in the **same project** you used for Google Play Games Services setup!
- Project ID should match what you used earlier
- You should see "Ball Sort Puzzle Game" or similar in the project name

---

## 🔑 Step 2: Navigate to OAuth Consent Screen

### 2.1 Access APIs & Services
1. In the **left sidebar**, click **"APIs & Services"**
2. If you don't see it, click the **hamburger menu (☰)** first
3. Click **"OAuth consent screen"** from the submenu

### 2.2 Alternative Navigation
If you can't find it:
1. Use the **search bar** at the top
2. Type **"OAuth consent screen"**
3. Click on the result that appears

---

## ⚙️ Step 3: Configure OAuth Consent Screen

### 3.1 Choose User Type
You'll see two options:

**Choose: "Internal"** (Recommended for initial setup)
- ✅ **Internal**: Only users in your Google Workspace organization
- ❌ **External**: Available to any user with a Google Account

**Why Internal First?**
- Easier to set up and test
- No verification process required
- You can change to External later when ready for public release

**If you don't have Google Workspace:**
- Choose **"External"**
- You'll need verification later for production

### 3.2 Click "Create"
After selecting your user type, click **"Create"** to proceed.

---

## 📝 Step 4: Fill Out App Information

### 4.1 App Information Section
**Required Fields:**

**App name:** `Ball Sort Puzzle`
- This is what users will see in the consent screen

**User support email:** `your-email@gmail.com`
- Use the same email as your Google Play Console account

**App logo (Optional but Recommended):**
- Upload a 120x120 pixel PNG image
- Should be your game's icon or logo
- Must be under 1MB

### 4.2 App Domain Information
**Application home page (Optional):**
- If you have a website: `https://yourgamewebsite.com`
- If not, leave blank for now

**Application privacy policy link (Important):**
- This will be **required for production**
- You can leave blank for testing, but you'll need this later
- Example: `https://yourgamewebsite.com/privacy`

**Application terms of service link (Optional):**
- Leave blank for now unless you have one

### 4.3 Developer Contact Information
**Developer contact information:**
- Use the same email as your Google Play Console account
- This is where Google will contact you about your app

### 4.4 Click "Save and Continue"

---

## 🎯 Step 5: Configure Scopes

### 5.1 What are Scopes?
Scopes define what permissions your app requests from users. For Google Play Games Services, you need specific gaming-related scopes.

### 5.2 Add Required Scopes
1. Click **"Add or Remove Scopes"**
2. Look for these scopes and **check them**:

**Essential Gaming Scopes:**
```
https://www.googleapis.com/auth/games
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/userinfo.email
```

**Additional Useful Scopes:**
```
https://www.googleapis.com/auth/drive.appdata (for cloud saves)
https://www.googleapis.com/auth/plus.me (for profile access)
```

### 5.3 If Scopes Aren't Listed
If you don't see the gaming scopes:
1. Click **"Add or Remove Scopes"**
2. Scroll down to **"Manually add scopes"**
3. Enter each scope URL one by one:
   - `https://www.googleapis.com/auth/games`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

### 5.4 Click "Update" then "Save and Continue"

---

## 👥 Step 6: Add Test Users

### 6.1 Why Add Test Users?
- Test users can use your app during development
- They can access Games Services features before your app is published
- Required for testing authentication

### 6.2 Add Test Users
1. Click **"Add Users"**
2. Add email addresses of people who will test your game:
   - **Your own Gmail account** (essential!)
   - Developer team members
   - Beta testers
   - Friends/family who will help test

**Example Test Users:**
```
your-email@gmail.com
tester1@gmail.com
friend@gmail.com
```

### 6.3 Click "Save and Continue"

---

## 📋 Step 7: Review and Submit

### 7.1 Summary Review
You'll see a summary of your OAuth consent screen configuration:
- ✅ App information
- ✅ Scopes (permissions)
- ✅ Test users

### 7.2 Submit for Internal Use
1. Review all information carefully
2. Click **"Back to Dashboard"** or **"Submit for Verification"** if using External

**For Internal Apps:**
- No verification needed
- Available immediately for testing

**For External Apps:**
- May require Google verification
- Can take several days/weeks for approval

---

## ✅ Step 8: Verify Setup

### 8.1 Check Status
Back on the OAuth consent screen dashboard, you should see:
- ✅ **Status**: "In production" (for Internal) or "Testing" (for External)
- ✅ **App name**: Your game name
- ✅ **Scopes**: Gaming and profile scopes
- ✅ **Test users**: Your added users

### 8.2 Important Notes
**Publishing Status:**
- **Internal**: Ready to use immediately
- **External (Testing)**: Only test users can use it
- **External (In production)**: Available to all users (after verification)

---

## 🎮 Step 9: Connect to Play Games Services

### 9.1 Link OAuth to Games Services
Now that your OAuth consent screen is ready:
1. Go back to **Google Play Console**
2. Navigate to **Games Services & APIs**
3. Your Games Services project should now be able to use the OAuth configuration

### 9.2 Expected Integration
- Your Games Services project will use this OAuth consent screen
- Users will see your app name and permissions when signing in
- Test users can immediately start testing authentication

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### "Project not found" or "Access denied"
- **Solution**: Make sure you're in the correct Google Cloud project
- **Check**: Project ID matches your Games Services project

#### "Scopes not available"
- **Solution**: Enable the Games API first
  1. Go to **APIs & Services** → **Library**
  2. Search for **"Google Play Games Services API"**
  3. Click **"Enable"**
  4. Return to OAuth consent screen and add scopes

#### "Cannot add test users"
- **Solution**: Make sure you chose "External" user type
- **Alternative**: Use "Internal" if you have Google Workspace

#### "App domain verification required"
- **For testing**: Leave domain fields blank
- **For production**: You'll need to verify domain ownership later

---

## 📱 Step 10: Test OAuth Flow

### 10.1 Verify OAuth is Working
To test if your OAuth consent screen is properly configured:

1. **Build your app** with the Games Services integration
2. **Install on test device** signed in with a test user account
3. **Try to sign in** to Google Play Games Services
4. **You should see**: Your custom OAuth consent screen with your app name

### 10.2 What Users Will See
When testing, users will see a screen like:
```
Ball Sort Puzzle wants to:
✓ View your Google Play Games activity
✓ Know who you are on Google
✓ View your email address

[Cancel] [Allow]
```

---

## 🎯 Next Steps

### After OAuth Consent Screen is Complete:

1. **✅ OAuth consent screen created** ← You just completed this!
2. **🔄 Create credentials** ← Next step
3. **📱 Add Games Services SDK to APK**
4. **👥 Add testers to project**
5. **🚀 Publish project**

### Ready for Credentials Creation
With your OAuth consent screen configured, you're now ready to:
- Create OAuth 2.0 client credentials
- Configure Android app credentials
- Link credentials to your Games Services project

---

## 📝 Quick Checklist

Before moving to the next step, verify:
- ✅ **OAuth consent screen created** in Google Cloud Console
- ✅ **App information filled out** (name, email, logo)
- ✅ **Gaming scopes added** (games, profile, email)
- ✅ **Test users added** (including your own account)
- ✅ **Status shows "In production"** or "Testing"
- ✅ **Same project used** as Games Services setup

### Your OAuth Setup Summary:
- **App name**: Ball Sort Puzzle
- **User type**: Internal/External (your choice)
- **Key scopes**: Gaming and profile access
- **Test users**: Added and ready
- **Status**: Ready for credential creation

---

## 🎉 Success!

Your OAuth consent screen is now configured and ready! Your Google Play Games Services integration can now authenticate users and request the necessary permissions.

**Next Step**: Create credentials for your Android app to complete the Games Services setup.

---

## 📞 Need Help?

- **Google Cloud Console Help**: https://cloud.google.com/support
- **OAuth Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Play Games Services**: https://developers.google.com/games/services

**Happy Gaming! 🎮**