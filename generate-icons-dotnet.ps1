# Ball Sort Puzzle - Icon Generator (PowerShell + .NET)
# No external dependencies required - uses built-in Windows .NET Framework

param(
    [string]$SourceImage = "source-icon-1024.png"
)

Add-Type -AssemblyName System.Drawing

Write-Host "🎨 Ball Sort Puzzle - Icon Generator (.NET Version)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "✅ Using built-in Windows .NET Framework (no external tools needed)" -ForegroundColor Green

# Check if source image exists
if (!(Test-Path $SourceImage)) {
    Write-Host "❌ Source image '$SourceImage' not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a 1024x1024 PNG file named '$SourceImage'" -ForegroundColor Yellow
    Write-Host "You can use these methods:" -ForegroundColor White
    Write-Host "  1. Open 'icon-creator.html' in your browser" -ForegroundColor Cyan
    Write-Host "  2. Use online tools: https://icon.kitchen/" -ForegroundColor Cyan
    Write-Host "  3. Create in Paint, Photoshop, or any image editor" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Design tip: Purple/pink gradient with colorful balls and tubes" -ForegroundColor Green
    exit 1
}

# Create directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "res\icons\android" | Out-Null
New-Item -ItemType Directory -Force -Path "res\splash\android" | Out-Null

Write-Host "📱 Generating app icons..." -ForegroundColor Green

# Load source image
try {
    $sourceImg = [System.Drawing.Image]::FromFile((Resolve-Path $SourceImage).Path)
    Write-Host "✅ Source image loaded (${$sourceImg.Width}x${$sourceImg.Height})" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to load source image: $_" -ForegroundColor Red
    exit 1
}

# Function to resize image
function Resize-Image {
    param(
        [System.Drawing.Image]$SourceImage,
        [int]$Width,
        [int]$Height,
        [string]$OutputPath
    )
    
    try {
        $resized = New-Object System.Drawing.Bitmap($Width, $Height)
        $graphics = [System.Drawing.Graphics]::FromImage($resized)
        
        # Set high quality rendering
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw resized image
        $graphics.DrawImage($SourceImage, 0, 0, $Width, $Height)
        
        # Save as PNG
        $resized.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $graphics.Dispose()
        $resized.Dispose()
        
        $fileSize = [math]::Round((Get-Item $OutputPath).Length / 1KB, 1)
        Write-Host "  ✅ Created $OutputPath (${fileSize}KB)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ❌ Failed to create $OutputPath : $_" -ForegroundColor Red
        return $false
    }
}

# Function to create gradient splash screen
function Create-SplashScreen {
    param(
        [System.Drawing.Image]$IconImage,
        [int]$Width,
        [int]$Height,
        [string]$OutputPath
    )
    
    try {
        $splash = New-Object System.Drawing.Bitmap($Width, $Height)
        $graphics = [System.Drawing.Graphics]::FromImage($splash)
        
        # Create gradient brush (purple to pink)
        $startColor = [System.Drawing.Color]::FromArgb(107, 70, 193)  # #6B46C1
        $endColor = [System.Drawing.Color]::FromArgb(236, 72, 153)    # #EC4899
        $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            [System.Drawing.Point]::new(0, 0),
            [System.Drawing.Point]::new($Width, $Height),
            $startColor,
            $endColor
        )
        
        # Fill background with gradient
        $graphics.FillRectangle($gradientBrush, 0, 0, $Width, $Height)
        
        # Calculate icon size (20% of screen width)
        $iconSize = [math]::Round($Width * 0.2)
        $iconX = ($Width - $iconSize) / 2
        $iconY = ($Height - $iconSize) / 2
        
        # Set high quality rendering for icon
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        # Draw centered icon
        $graphics.DrawImage($IconImage, $iconX, $iconY, $iconSize, $iconSize)
        
        # Save as PNG
        $splash.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Cleanup
        $gradientBrush.Dispose()
        $graphics.Dispose()
        $splash.Dispose()
        
        $fileSize = [math]::Round((Get-Item $OutputPath).Length / 1KB, 1)
        Write-Host "  ✅ Created $OutputPath (${fileSize}KB)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ❌ Failed to create $OutputPath : $_" -ForegroundColor Red
        return $false
    }
}

# Generate app icons
$iconSizes = @{
    "ldpi" = 36
    "mdpi" = 48
    "hdpi" = 72
    "xhdpi" = 96
    "xxhdpi" = 144
    "xxxhdpi" = 192
}

$iconSuccess = 0
foreach ($density in $iconSizes.Keys) {
    $size = $iconSizes[$density]
    $output = "res\icons\android\$density.png"
    
    Write-Host "  Creating $density (${size}×${size})..." -ForegroundColor Yellow
    if (Resize-Image -SourceImage $sourceImg -Width $size -Height $size -OutputPath $output) {
        $iconSuccess++
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

$splashSuccess = 0
foreach ($density in $splashSizes.Keys) {
    $width = $splashSizes[$density].width
    $height = $splashSizes[$density].height
    $output = "res\splash\android\$density.png"
    
    Write-Host "  Creating $density (${width}×${height})..." -ForegroundColor Yellow
    if (Create-SplashScreen -IconImage $sourceImg -Width $width -Height $height -OutputPath $output) {
        $splashSuccess++
    }
}

# Cleanup
$sourceImg.Dispose()

Write-Host "`n🎉 Asset generation complete!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Display summary
Write-Host "`n📊 Generated Assets:" -ForegroundColor White
Write-Host "  📱 App Icons: $iconSuccess/6 files in res\icons\android\" -ForegroundColor Green
Write-Host "  🌟 Splash Screens: $splashSuccess/6 files in res\splash\android\" -ForegroundColor Green

if ($iconSuccess -eq 6 -and $splashSuccess -eq 6) {
    Write-Host "`n✅ All assets generated successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some assets failed to generate. Check error messages above." -ForegroundColor Yellow
}

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
Write-Host "🚀 No external tools needed - powered by Windows .NET Framework!" -ForegroundColor Cyan
