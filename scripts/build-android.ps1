# Ball Sort Puzzle - Android Build Script (PowerShell)
# This script automates the Android app building process on Windows

param(
    [switch]$Release,
    [switch]$Sign,
    [switch]$Help
)

# Configuration
$APP_NAME = "Ball Sort Puzzle"
$PACKAGE_NAME = "com.ballsortpuzzle.game"
$VERSION = "1.0.0"

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "🏗️  Ball Sort Puzzle - Android Build Script" $BLUE
    Write-ColorOutput "=============================================" $BLUE
    Write-ColorOutput ""
    Write-ColorOutput "Usage: .\build-android.ps1 [OPTIONS]" $YELLOW
    Write-ColorOutput ""
    Write-ColorOutput "Options:" $YELLOW
    Write-ColorOutput "  -Release    Build release APK instead of debug" $YELLOW
    Write-ColorOutput "  -Sign       Sign the release APK (requires keystore)" $YELLOW
    Write-ColorOutput "  -Help       Show this help message" $YELLOW
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" $YELLOW
    Write-ColorOutput "  .\build-android.ps1                    # Build debug APK" $YELLOW
    Write-ColorOutput "  .\build-android.ps1 -Release           # Build release APK" $YELLOW
    Write-ColorOutput "  .\build-android.ps1 -Release -Sign     # Build and sign release APK" $YELLOW
    exit 0
}

function Test-NodeJS {
    Write-ColorOutput "📦 Checking Node.js installation..." $BLUE
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Node.js is installed: $nodeVersion" $GREEN
            return $true
        }
    } catch {
        Write-ColorOutput "❌ Node.js is not installed. Please install Node.js first." $RED
        Write-ColorOutput "Download from: https://nodejs.org/" $YELLOW
        return $false
    }
}

function Test-Cordova {
    Write-ColorOutput "📱 Checking Cordova installation..." $BLUE
    try {
        $cordovaVersion = cordova --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Cordova is installed: $cordovaVersion" $GREEN
            return $true
        }
    } catch {
        Write-ColorOutput "⚠️  Cordova is not installed. Installing Cordova..." $YELLOW
        try {
            npm install -g cordova
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Cordova installed successfully" $GREEN
                return $true
            } else {
                Write-ColorOutput "❌ Failed to install Cordova" $RED
                return $false
            }
        } catch {
            Write-ColorOutput "❌ Failed to install Cordova" $RED
            return $false
        }
    }
}

function Test-AndroidSDK {
    Write-ColorOutput "🤖 Checking Android SDK..." $BLUE
    if (-not $env:ANDROID_HOME) {
        Write-ColorOutput "❌ ANDROID_HOME environment variable is not set" $RED
        Write-ColorOutput "Please install Android Studio and set ANDROID_HOME" $YELLOW
        return $false
    }
    Write-ColorOutput "✅ Android SDK found: $env:ANDROID_HOME" $GREEN
    return $true
}

function Install-Dependencies {
    Write-ColorOutput "📚 Installing dependencies..." $BLUE
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Dependencies installed successfully" $GREEN
            return $true
        } else {
            Write-ColorOutput "❌ Failed to install dependencies" $RED
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Failed to install dependencies" $RED
        return $false
    }
}

function Add-AndroidPlatform {
    Write-ColorOutput "🤖 Adding Android platform..." $BLUE
    if (-not (Test-Path "platforms\android")) {
        try {
            cordova platform add android
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Android platform added successfully" $GREEN
                return $true
            } else {
                Write-ColorOutput "❌ Failed to add Android platform" $RED
                return $false
            }
        } catch {
            Write-ColorOutput "❌ Failed to add Android platform" $RED
            return $false
        }
    } else {
        Write-ColorOutput "✅ Android platform already exists" $GREEN
        return $true
    }
}

function Install-Plugins {
    Write-ColorOutput "🔌 Installing Cordova plugins..." $BLUE
    
    $plugins = @(
        "cordova-plugin-whitelist",
        "cordova-plugin-splashscreen", 
        "cordova-plugin-statusbar",
        "cordova-plugin-device",
        "cordova-plugin-network-information",
        "cordova-plugin-vibration",
        "cordova-plugin-dialogs",
        "cordova-plugin-file"
    )
    
    foreach ($plugin in $plugins) {
        Write-ColorOutput "Installing $plugin..." $BLUE
        cordova plugin add $plugin
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "⚠️  Warning: Failed to install $plugin" $YELLOW
        }
    }
    
    Write-ColorOutput "✅ Core plugins installation completed" $GREEN
    Write-ColorOutput "⚠️  AdMob and Google Play Games plugins need manual installation with your actual IDs:" $YELLOW
    Write-ColorOutput "   cordova plugin add cordova-admob-plus --variable APP_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY" $YELLOW
    Write-ColorOutput "   cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=YOUR_GOOGLE_PLAY_GAMES_APP_ID" $YELLOW
    
    return $true
}

function Build-DebugAPK {
    Write-ColorOutput "🔨 Building debug APK..." $BLUE
    try {
        cordova build android
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Debug APK built successfully" $GREEN
            Write-ColorOutput "📱 APK location: platforms\android\app\build\outputs\apk\debug\app-debug.apk" $GREEN
            return $true
        } else {
            Write-ColorOutput "❌ Failed to build debug APK" $RED
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Failed to build debug APK" $RED
        return $false
    }
}

function Build-ReleaseAPK {
    Write-ColorOutput "🔨 Building release APK..." $BLUE
    try {
        cordova build android --release
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Release APK built successfully" $GREEN
            Write-ColorOutput "📱 APK location: platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk" $GREEN
            Write-ColorOutput "⚠️  Note: This APK is unsigned. You'll need to sign it for release." $YELLOW
            return $true
        } else {
            Write-ColorOutput "❌ Failed to build release APK" $RED
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Failed to build release APK" $RED
        return $false
    }
}

function New-Keystore {
    Write-ColorOutput "🔐 Generating keystore for APK signing..." $BLUE
    if (-not (Test-Path "ball-sort-puzzle.keystore")) {
        Write-ColorOutput "📝 Please enter the following information for your keystore:" $YELLOW
        try {
            keytool -genkey -v -keystore ball-sort-puzzle.keystore -alias ball-sort-puzzle -keyalg RSA -keysize 2048 -validity 10000
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Keystore generated successfully" $GREEN
                Write-ColorOutput "⚠️  IMPORTANT: Keep this keystore file safe! You'll need it for all future updates." $YELLOW
                return $true
            } else {
                Write-ColorOutput "❌ Failed to generate keystore" $RED
                return $false
            }
        } catch {
            Write-ColorOutput "❌ Failed to generate keystore" $RED
            return $false
        }
    } else {
        Write-ColorOutput "✅ Keystore already exists" $GREEN
        return $true
    }
}

function Sign-APK {
    Write-ColorOutput "✍️  Signing APK..." $BLUE
    if ((Test-Path "platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk") -and (Test-Path "ball-sort-puzzle.keystore")) {
        try {
            jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ball-sort-puzzle.keystore platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk ball-sort-puzzle
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ APK signed successfully" $GREEN
                return $true
            } else {
                Write-ColorOutput "❌ Failed to sign APK" $RED
                return $false
            }
        } catch {
            Write-ColorOutput "❌ Failed to sign APK" $RED
            return $false
        }
    } else {
        Write-ColorOutput "❌ Missing unsigned APK or keystore file" $RED
        return $false
    }
}

function Optimize-APK {
    Write-ColorOutput "📏 Aligning APK..." $BLUE
    try {
        $zipalignPath = Get-Command zipalign -ErrorAction SilentlyContinue
        if ($zipalignPath) {
            zipalign -v 4 platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk ball-sort-puzzle-release.apk
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ APK aligned successfully" $GREEN
                Write-ColorOutput "🎉 Final APK ready: ball-sort-puzzle-release.apk" $GREEN
                return $true
            } else {
                Write-ColorOutput "❌ Failed to align APK" $RED
                return $false
            }
        } else {
            Write-ColorOutput "⚠️  zipalign not found. APK optimization skipped." $YELLOW
            Copy-Item "platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk" "ball-sort-puzzle-release.apk"
            Write-ColorOutput "🎉 Signed APK ready: ball-sort-puzzle-release.apk" $GREEN
            return $true
        }
    } catch {
        Write-ColorOutput "❌ Failed to optimize APK" $RED
        return $false
    }
}

# Main execution
function Main {
    if ($Help) {
        Show-Help
    }
    
    Write-ColorOutput "🏗️  Ball Sort Puzzle - Android Build Script" $BLUE
    Write-ColorOutput "=============================================" $BLUE
    
    # Check prerequisites
    if (-not (Test-NodeJS)) { exit 1 }
    if (-not (Test-Cordova)) { exit 1 }
    if (-not (Test-AndroidSDK)) { exit 1 }
    
    # Setup project
    if (-not (Install-Dependencies)) { exit 1 }
    if (-not (Add-AndroidPlatform)) { exit 1 }
    if (-not (Install-Plugins)) { exit 1 }
    
    # Build APK
    if ($Release) {
        if (-not (Build-ReleaseAPK)) { exit 1 }
        
        if ($Sign) {
            if (-not (New-Keystore)) { exit 1 }
            if (-not (Sign-APK)) { exit 1 }
            if (-not (Optimize-APK)) { exit 1 }
        } else {
            Write-ColorOutput "⚠️  Release APK is unsigned. Use -Sign flag to sign it." $YELLOW
        }
    } else {
        if (-not (Build-DebugAPK)) { exit 1 }
    }
    
    Write-ColorOutput "🎉 Build process completed successfully!" $GREEN
    Write-ColorOutput "📱 Your Ball Sort Puzzle Android app is ready!" $BLUE
}

# Execute main function
Main
