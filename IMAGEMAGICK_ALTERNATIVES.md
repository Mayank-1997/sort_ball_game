# Alternative ImageMagick Download Sources

## 🔄 Alternative Download Links for ImageMagick

### **Primary Alternatives:**

1. **GitHub Releases (Most Reliable):**
   - https://github.com/ImageMagick/ImageMagick/releases
   - Download: `ImageMagick-7.x.x-x-Q16-HDRI-x64-dll.exe`

2. **FossHub Mirror:**
   - https://www.fosshub.com/ImageMagick.html
   - Select Windows version

3. **SourceForge Mirror:**
   - https://sourceforge.net/projects/imagemagick/
   - Download latest Windows installer

4. **Chocolatey (Package Manager):**
   ```bash
   # Install Chocolatey first (if not installed):
   # Run PowerShell as Administrator and paste:
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   
   # Then install ImageMagick:
   choco install imagemagick
   ```

5. **Winget (Windows Package Manager):**
   ```bash
   # Run in Command Prompt or PowerShell:
   winget install ImageMagick.ImageMagick
   ```

### **Installation Steps:**
1. Download from any of the above sources
2. Run the installer as Administrator
3. Accept default settings
4. Restart Command Prompt
5. Test: `magick -version`

## 🚨 If All Downloads Fail:

### **Option A: Use Online Icon Generators**
- https://icon.kitchen/ (No software needed)
- https://appicon.co/
- https://makeappicon.com/

### **Option B: Manual Icon Creation**
- Use the included `icon-creator.html` (works in browser)
- Save as PNG and manually resize using Windows Paint/Photos

### **Option C: Use PowerShell Image Resizing**
- We can create a PowerShell-only solution (no external tools)
