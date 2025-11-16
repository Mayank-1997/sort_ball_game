# Ball Sort Puzzle - Google Play Console Deployment Guide
# This script provides step-by-step instructions for deploying to Google Play

param(
    [switch]$Help,
    [switch]$SetupOnly,
    [switch]$CheckAPK
)

$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"
$RED = "Red"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "🚀 Ball Sort Puzzle - Google Play Deployment Guide" $BLUE
    Write-ColorOutput "=================================================" $BLUE
    Write-ColorOutput ""
    Write-ColorOutput "Usage: .\deploy-google-play.ps1 [OPTIONS]" $YELLOW
    Write-ColorOutput ""
    Write-ColorOutput "Options:" $YELLOW
    Write-ColorOutput "  -SetupOnly   Show only the Google Play Console setup steps" $YELLOW
    Write-ColorOutput "  -CheckAPK    Verify APK is ready for deployment" $YELLOW
    Write-ColorOutput "  -Help        Show this help message" $YELLOW
    Write-ColorOutput ""
    exit 0
}

function Test-APKReady {
    Write-ColorOutput "📱 Checking APK readiness for deployment..." $BLUE
    
    $apkPath = "ball-sort-puzzle-release.apk"
    if (-not (Test-Path $apkPath)) {
        Write-ColorOutput "❌ Signed release APK not found: $apkPath" $RED
        Write-ColorOutput "💡 Run: .\build-android.ps1 -Release -Sign" $YELLOW
        return $false
    }
    
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-ColorOutput "✅ Release APK found: $apkPath" $GREEN
    Write-ColorOutput "📏 APK Size: $([math]::Round($apkSize, 2)) MB" $BLUE
    
    if ($apkSize -gt 100) {
        Write-ColorOutput "⚠️  Warning: APK is larger than 100MB. Consider using App Bundle format." $YELLOW
    }
    
    # Check if keystore exists
    if (-not (Test-Path "ball-sort-puzzle.keystore")) {
        Write-ColorOutput "❌ Keystore file not found. APK may not be properly signed." $RED
        return $false
    }
    
    Write-ColorOutput "✅ APK appears ready for deployment" $GREEN
    return $true
}

function Show-GooglePlaySetup {
    Write-ColorOutput "🏪 Google Play Console Setup Steps" $BLUE
    Write-ColorOutput "==================================" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "1. 👤 Create Google Play Console Account" $YELLOW
    Write-ColorOutput "   • Go to https://play.google.com/console" $BLUE
    Write-ColorOutput "   • Sign in with your Google account" $BLUE
    Write-ColorOutput "   • Pay the one-time $25 developer registration fee" $BLUE
    Write-ColorOutput "   • Complete the developer profile verification" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "2. 📱 Create Your App" $YELLOW
    Write-ColorOutput "   • Click 'Create app' in the Google Play Console" $BLUE
    Write-ColorOutput "   • App name: 'Ball Sort Puzzle'" $BLUE
    Write-ColorOutput "   • Default language: English (United States)" $BLUE
    Write-ColorOutput "   • App or game: Game" $BLUE
    Write-ColorOutput "   • Free or paid: Free (with ads)" $BLUE
    Write-ColorOutput "   • Agree to policies and create app" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "3. 🎯 App Content Configuration" $YELLOW
    Write-ColorOutput "   • Privacy Policy URL: [Your privacy policy URL]" $BLUE
    Write-ColorOutput "   • App Category: Puzzle" $BLUE
    Write-ColorOutput "   • Content Rating: Complete questionnaire" $BLUE
    Write-ColorOutput "   • Target Audience: Age groups 3+" $BLUE
    Write-ColorOutput "   • Ads Declaration: Yes, contains ads" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "4. 🏪 Store Listing" $YELLOW
    Write-ColorOutput "   • App name: 'Ball Sort Puzzle'" $BLUE
    Write-ColorOutput "   • Short description (80 chars): 'Addictive ball sorting puzzle with 200 levels!'" $BLUE
    Write-ColorOutput "   • Full description: [See store-listing-description.txt]" $BLUE
    Write-ColorOutput "   • App icon: 512 x 512 px PNG" $BLUE
    Write-ColorOutput "   • Feature graphic: 1024 x 500 px PNG" $BLUE
    Write-ColorOutput "   • Screenshots: At least 2 phone screenshots" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "5. 🎮 Google Play Games Integration" $YELLOW
    Write-ColorOutput "   • Go to Google Play Games Services console" $BLUE
    Write-ColorOutput "   • Create a new game project" $BLUE
    Write-ColorOutput "   • Link to your Google Play Console app" $BLUE
    Write-ColorOutput "   • Create achievements and leaderboards" $BLUE
    Write-ColorOutput "   • Copy the Game Services App ID to config.xml" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "6. 💰 AdMob Integration Verification" $YELLOW
    Write-ColorOutput "   • Verify AdMob app is linked to Play Console app" $BLUE
    Write-ColorOutput "   • Ensure ad unit IDs are correctly configured" $BLUE
    Write-ColorOutput "   • Test ads are working in production build" $BLUE
    Write-ColorOutput ""
}

function Show-UploadSteps {
    Write-ColorOutput "📤 APK Upload and Release Steps" $BLUE
    Write-ColorOutput "===============================" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "1. 📋 Production Release" $YELLOW
    Write-ColorOutput "   • Go to 'Release' > 'Production' in Play Console" $BLUE
    Write-ColorOutput "   • Click 'Create new release'" $BLUE
    Write-ColorOutput "   • Upload your signed APK: ball-sort-puzzle-release.apk" $BLUE
    Write-ColorOutput "   • Version name: 1.0.0" $BLUE
    Write-ColorOutput "   • Version code: 1 (auto-generated)" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "2. 📝 Release Notes" $YELLOW
    Write-ColorOutput "   Release notes (example):" $BLUE
    Write-ColorOutput "   '🎉 Welcome to Ball Sort Puzzle!'" $BLUE
    Write-ColorOutput "   '• 200 challenging levels'" $BLUE
    Write-ColorOutput "   '• Beautiful 3D graphics'" $BLUE
    Write-ColorOutput "   '• Google Play Games integration'" $BLUE
    Write-ColorOutput "   '• Premium ad-free experience available'" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "3. 🎯 Release Settings" $YELLOW
    Write-ColorOutput "   • Country/Region targeting: All countries" $BLUE
    Write-ColorOutput "   • Rollout percentage: Start with 5-10% for testing" $BLUE
    Write-ColorOutput "   • Review and rollout" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "4. ⏱️  Review Process" $YELLOW
    Write-ColorOutput "   • Review time: Usually 1-3 days" $BLUE
    Write-ColorOutput "   • Check for policy violations" $BLUE
    Write-ColorOutput "   • Monitor crash reports" $BLUE
    Write-ColorOutput "   • Gradually increase rollout percentage" $BLUE
    Write-ColorOutput ""
}

function Show-PostLaunchSteps {
    Write-ColorOutput "🚀 Post-Launch Management" $BLUE
    Write-ColorOutput "=========================" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "1. 📊 Monitor Performance" $YELLOW
    Write-ColorOutput "   • Check crash reports in Play Console" $BLUE
    Write-ColorOutput "   • Monitor user reviews and ratings" $BLUE
    Write-ColorOutput "   • Review AdMob earnings" $BLUE
    Write-ColorOutput "   • Track Google Play Games engagement" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "2. 💰 Monetization Optimization" $YELLOW
    Write-ColorOutput "   • Monitor ad performance in AdMob" $BLUE
    Write-ColorOutput "   • Optimize ad placements based on user behavior" $BLUE
    Write-ColorOutput "   • A/B test different ad frequencies" $BLUE
    Write-ColorOutput "   • Consider adding more IAP options" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "3. 🔄 Updates and Maintenance" $YELLOW
    Write-ColorOutput "   • Regular bug fixes and improvements" $BLUE
    Write-ColorOutput "   • New levels and features" $BLUE
    Write-ColorOutput "   • Seasonal events and themes" $BLUE
    Write-ColorOutput "   • Performance optimizations" $BLUE
    Write-ColorOutput ""
}

function Show-TroubleshootingTips {
    Write-ColorOutput "🔧 Common Issues and Solutions" $BLUE
    Write-ColorOutput "=============================" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "❌ APK Upload Issues:" $YELLOW
    Write-ColorOutput "   • Ensure APK is properly signed" $BLUE
    Write-ColorOutput "   • Check package name matches Play Console app" $BLUE
    Write-ColorOutput "   • Verify version code is higher than previous uploads" $BLUE
    Write-ColorOutput "   • Make sure all required permissions are declared" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "❌ AdMob Issues:" $YELLOW
    Write-ColorOutput "   • Verify app is approved in AdMob" $BLUE
    Write-ColorOutput "   • Check ad unit IDs are correct" $BLUE
    Write-ColorOutput "   • Ensure app-ads.txt is properly configured" $BLUE
    Write-ColorOutput "   • Test ads on real devices, not emulators" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "❌ Google Play Games Issues:" $YELLOW
    Write-ColorOutput "   • Verify game project is published" $BLUE
    Write-ColorOutput "   • Check app signing certificate matches" $BLUE
    Write-ColorOutput "   • Ensure achievements/leaderboards are published" $BLUE
    Write-ColorOutput "   • Test with Google Play Games app installed" $BLUE
    Write-ColorOutput ""
}

function Show-RequiredAssets {
    Write-ColorOutput "🎨 Required Marketing Assets Checklist" $BLUE
    Write-ColorOutput "=====================================" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "📱 App Icon:" $YELLOW
    Write-ColorOutput "   • Size: 512 x 512 pixels" $BLUE
    Write-ColorOutput "   • Format: PNG (no transparency)" $BLUE
    Write-ColorOutput "   • High quality, recognizable at small sizes" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "🖼️  Feature Graphic:" $YELLOW
    Write-ColorOutput "   • Size: 1024 x 500 pixels" $BLUE
    Write-ColorOutput "   • Format: PNG or JPEG" $BLUE
    Write-ColorOutput "   • No text overlay (Google may reject)" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "📸 Screenshots:" $YELLOW
    Write-ColorOutput "   • Phone: At least 2, max 8" $BLUE
    Write-ColorOutput "   • Tablet: At least 1, max 8 (optional)" $BLUE
    Write-ColorOutput "   • Size: 320-3840 pixels on longest side" $BLUE
    Write-ColorOutput "   • Show actual gameplay, not generic graphics" $BLUE
    Write-ColorOutput ""
    
    Write-ColorOutput "🎥 Promo Video (Optional):" $YELLOW
    Write-ColorOutput "   • YouTube video up to 2 minutes" $BLUE
    Write-ColorOutput "   • Show gameplay and features" $BLUE
    Write-ColorOutput "   • Can significantly improve conversion rates" $BLUE
    Write-ColorOutput ""
}

# Main execution
function Main {
    if ($Help) {
        Show-Help
    }
    
    Write-ColorOutput "🚀 Ball Sort Puzzle - Google Play Deployment Guide" $BLUE
    Write-ColorOutput "=================================================" $BLUE
    Write-ColorOutput ""
    
    if ($CheckAPK) {
        Test-APKReady
        return
    }
    
    if ($SetupOnly) {
        Show-GooglePlaySetup
        Show-RequiredAssets
        return
    }
    
    # Show all steps
    Show-GooglePlaySetup
    Write-ColorOutput ""
    Show-RequiredAssets
    Write-ColorOutput ""
    Show-UploadSteps
    Write-ColorOutput ""
    Show-PostLaunchSteps
    Write-ColorOutput ""
    Show-TroubleshootingTips
    
    Write-ColorOutput ""
    Write-ColorOutput "🎉 You're ready to deploy Ball Sort Puzzle to Google Play!" $GREEN
    Write-ColorOutput "📞 Need help? Check the official documentation:" $BLUE
    Write-ColorOutput "   • https://support.google.com/googleplay/android-developer/" $BLUE
    Write-ColorOutput "   • https://developer.android.com/distribute/google-play" $BLUE
}

# Execute main function
Main
