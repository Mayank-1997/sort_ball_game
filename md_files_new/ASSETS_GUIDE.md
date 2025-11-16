# 🎨 Android App Resources Guide

This guide explains how to create and organize the required resources for your Ball Sort Puzzle Android app.

## 📱 App Icons

You need to create app icons in multiple sizes for different screen densities:

### Required Icon Sizes

Create your app icon in these sizes and place them in the `res/android/icon/` directory:

```
res/android/icon/
├── drawable-ldpi-icon.png     (36x36 px)
├── drawable-mdpi-icon.png     (48x48 px)
├── drawable-hdpi-icon.png     (72x72 px)
├── drawable-xhdpi-icon.png    (96x96 px)
├── drawable-xxhdpi-icon.png   (144x144 px)
└── drawable-xxxhdpi-icon.png  (192x192 px)
```

### Icon Design Guidelines

- **Format:** PNG with no transparency
- **Style:** Simple, recognizable design
- **Colors:** Bright, appealing colors that work at small sizes
- **Content:** Ball sorting theme (colorful balls, tubes, puzzle elements)

## 🖼️ Splash Screens

Create splash screens for different orientations and densities:

### Required Splash Screen Sizes

Place splash screens in the `res/android/splash/` directory:

```
res/android/splash/
├── drawable-land-ldpi-screen.png    (320x200 px)
├── drawable-land-mdpi-screen.png    (480x320 px)
├── drawable-land-hdpi-screen.png    (800x480 px)
├── drawable-land-xhdpi-screen.png   (1280x720 px)
├── drawable-land-xxhdpi-screen.png  (1600x960 px)
├── drawable-land-xxxhdpi-screen.png (1920x1280 px)
├── drawable-port-ldpi-screen.png    (200x320 px)
├── drawable-port-mdpi-screen.png    (320x480 px)
├── drawable-port-hdpi-screen.png    (480x800 px)
├── drawable-port-xhdpi-screen.png   (720x1280 px)
├── drawable-port-xxhdpi-screen.png  (960x1600 px)
└── drawable-port-xxxhdpi-screen.png (1280x1920 px)
```

### Splash Screen Design Guidelines

- **Content:** App logo, game title "Ball Sort Puzzle"
- **Background:** Gradient or solid color matching your game theme
- **Style:** Clean, professional appearance
- **Text:** Minimal, focused on branding

## 🏪 Google Play Store Assets

### App Icon (Google Play Console)
- **Size:** 512x512 px
- **Format:** PNG (no transparency)
- **Location:** Upload directly to Play Console

### Feature Graphic
- **Size:** 1024x500 px
- **Format:** PNG or JPEG
- **Content:** Showcases your game visually
- **Note:** No text overlay (Google may reject)

### Screenshots
- **Phone:** At least 2, maximum 8
- **Minimum dimensions:** 320px on shortest side
- **Maximum dimensions:** 3840px on longest side
- **Content:** Actual gameplay, different levels, UI elements

## 🎯 Quick Setup Commands

Create the directory structure:

```powershell
# Create icon directories
New-Item -ItemType Directory -Path "res\android\icon" -Force
New-Item -ItemType Directory -Path "res\android\splash" -Force

# Create store assets directory
New-Item -ItemType Directory -Path "store-assets" -Force
New-Item -ItemType Directory -Path "store-assets\screenshots" -Force
```

## 🛠️ Tools for Creating Assets

### Recommended Tools

1. **Icon Generation:**
   - Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/
   - Adobe Illustrator/Photoshop
   - GIMP (free alternative)

2. **Automated Icon Generation:**
   ```powershell
   # Install cordova-res for automatic generation
   npm install -g cordova-res
   
   # Place your source icon (1024x1024) as icon.png in project root
   # Generate all required sizes
   cordova-res android --skip-config --copy
   ```

3. **Screenshot Tools:**
   - Android emulator built-in screenshot
   - ADB command: `adb shell screencap -p /sdcard/screenshot.png`
   - Scrcpy for real-time screen mirroring

## 📋 Asset Checklist

### Before Building APK
- [ ] All app icons created and placed in correct directories
- [ ] All splash screens created and placed in correct directories
- [ ] Icons and splash screens follow Android design guidelines

### Before Store Upload
- [ ] 512x512 app icon ready for Play Console
- [ ] 1024x500 feature graphic created
- [ ] At least 2 phone screenshots captured
- [ ] Optional: Tablet screenshots captured
- [ ] Optional: Promo video created and uploaded to YouTube

## 🎨 Design Tips

### Color Scheme
Use colors that match your game theme:
- **Primary:** Bright, energetic colors
- **Secondary:** Complementary colors for contrast
- **Background:** Subtle gradients or patterns

### Ball Sort Puzzle Theme Elements
- Colorful balls (red, blue, green, yellow, etc.)
- Glass tubes or containers
- Puzzle completion animations
- Clean, modern UI elements

### Brand Consistency
Ensure all assets maintain consistent:
- Color palette
- Typography (if using text)
- Visual style
- Logo placement

## 🚀 Automation Script

Create this PowerShell script to help organize your assets:

```powershell
# organize-assets.ps1

# Create directory structure
$directories = @(
    "res\android\icon",
    "res\android\splash", 
    "store-assets",
    "store-assets\screenshots"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force
    Write-Host "Created: $dir"
}

Write-Host "Asset directories created successfully!"
Write-Host "Place your icons in: res\android\icon\"
Write-Host "Place your splash screens in: res\android\splash\"
Write-Host "Place your store assets in: store-assets\"
```

Run with: `.\organize-assets.ps1`

---

**Note:** The actual image files are not included in this repository. You'll need to create them based on your game's design and branding. Consider hiring a designer if you need professional-quality assets for your app store listing.
