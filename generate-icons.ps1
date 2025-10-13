# Ball Sort Puzzle - Icon Generator Script
# Requires ImageMagick: https://imagemagick.org/script/download.php#windows

param(
    [string]$SourceImage = "source-icon-1024.png"
)

Write-Host "🎨 Ball Sort Puzzle - Icon Generator" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if ImageMagick is installed
try {
    $magickVersion = magick -version 2>$null
    Write-Host "✅ ImageMagick found" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick not found!" -ForegroundColor Red
    Write-Host "Please install ImageMagick from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    exit 1
}

# Check if source image exists
if (!(Test-Path $SourceImage)) {
    Write-Host "❌ Source image '$SourceImage' not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a 1024x1024 PNG file named '$SourceImage'" -ForegroundColor Yellow
    Write-Host "You can use these methods:" -ForegroundColor White
    Write-Host "  1. Online: https://icon.kitchen/ (upload any image)" -ForegroundColor Cyan
    Write-Host "  2. Design tools: Canva, Figma, Photoshop" -ForegroundColor Cyan
    Write-Host "  3. AI generators: DALL-E, Midjourney" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Design tip: Use purple/pink gradient background with colorful balls and tubes" -ForegroundColor Green
    exit 1
}

# Create directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "res\icons\android" | Out-Null
New-Item -ItemType Directory -Force -Path "res\splash\android" | Out-Null

Write-Host "📱 Generating app icons..." -ForegroundColor Green

# Generate app icons
$iconSizes = @{
    "ldpi" = 36
    "mdpi" = 48
    "hdpi" = 72
    "xhdpi" = 96
    "xxhdpi" = 144
    "xxxhdpi" = 192
}

foreach ($density in $iconSizes.Keys) {
    $size = $iconSizes[$density]
    $output = "res\icons\android\$density.png"
    
    Write-Host "  Creating $density (${size}×${size})..." -ForegroundColor Yellow
    
    # Generate icon with proper scaling and sharpening
    magick convert $SourceImage -resize ${size}x${size} -unsharp 0x1 $output
    
    if (Test-Path $output) {
        $fileSize = [math]::Round((Get-Item $output).Length / 1KB, 1)
        Write-Host "  ✅ Created $output (${fileSize}KB)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to create $output" -ForegroundColor Red
    }
}

Write-Host "`n🌟 Generating splash screens..." -ForegroundColor Green

# Generate splash screens (portrait orientation)
$splashSizes = @{
    "ldpi" = @{width=320; height=426}
    "mdpi" = @{width=320; height=470}
    "hdpi" = @{width=480; height=640}
    "xhdpi" = @{width=720; height=960}
    "xxhdpi" = @{width=960; height=1280}
    "xxxhdpi" = @{width=1280; height=1920}
}

foreach ($density in $splashSizes.Keys) {
    $width = $splashSizes[$density].width
    $height = $splashSizes[$density].height
    $output = "res\splash\android\$density.png"
    
    Write-Host "  Creating $density (${width}×${height})..." -ForegroundColor Yellow
    
    # Calculate icon size for splash (20% of screen width)
    $iconSize = [math]::Round($width * 0.2)
    
    # Create splash with centered icon on gradient background
    magick convert -size ${width}x${height} gradient:#6B46C1-#EC4899 `
           \( $SourceImage -resize ${iconSize}x${iconSize} \) `
           -gravity center -composite $output
    
    if (Test-Path $output) {
        $fileSize = [math]::Round((Get-Item $output).Length / 1KB, 1)
        Write-Host "  ✅ Created $output (${fileSize}KB)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to create $output" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Asset generation complete!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Display summary
Write-Host "`n📊 Generated Assets:" -ForegroundColor White
Write-Host "  📱 App Icons: 6 files in res\icons\android\" -ForegroundColor Green
Write-Host "  🌟 Splash Screens: 6 files in res\splash\android\" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Copy the 'res' folder to your Cordova project root" -ForegroundColor White
Write-Host "  2. Ensure config.xml has the icon/splash references" -ForegroundColor White
Write-Host "  3. Run: cordova build android" -ForegroundColor White

Write-Host "`n🔍 Verify Your Assets:" -ForegroundColor Cyan
Write-Host "  • Icons should be sharp and clear at all sizes" -ForegroundColor White
Write-Host "  • Splash screens should have consistent branding" -ForegroundColor White
Write-Host "  • Colors should match your game theme" -ForegroundColor White

# Check file sizes
Write-Host "`n📏 File Size Check:" -ForegroundColor Magenta
Get-ChildItem -Recurse "res" -Include "*.png" | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 1)
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    Write-Host "  $relativePath - ${sizeKB}KB" -ForegroundColor Gray
}

Write-Host "`n✨ Your Ball Sort Puzzle app assets are ready!" -ForegroundColor Green
