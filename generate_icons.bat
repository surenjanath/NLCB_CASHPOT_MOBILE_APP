@echo off
echo 🎨 T&T Cashpot Icon Generator
echo ================================
echo.

REM Check if ImageMagick is installed
magick --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ImageMagick is not installed!
    echo.
    echo Please install ImageMagick from: https://imagemagick.org/script/download.php#windows
    echo Or use the online converter method instead.
    echo.
    pause
    exit /b 1
)

echo ✅ ImageMagick found! Generating icons...
echo.

REM Generate icons from SVG
echo 📱 Generating 1024x1024 icon...
magick "assets\images\app_icon.svg" -resize 1024x1024 "assets\images\icon_1024.png"

echo 📱 Generating 512x512 icon...
magick "assets\images\app_icon.svg" -resize 512x512 "assets\images\icon_512.png"

echo 📱 Generating 192x192 icon...
magick "assets\images\app_icon.svg" -resize 192x192 "assets\images\icon_192.png"

echo 📱 Generating 144x144 icon...
magick "assets\images\app_icon.svg" -resize 144x144 "assets\images\icon_144.png"

echo 📱 Generating 32x32 icon...
magick "assets\images\app_icon.svg" -resize 32x32 "assets\images\icon_32.png"

echo.
echo ✅ All icons generated successfully!
echo.
echo Files created:
echo - icon_1024.png (Main app icon)
echo - icon_512.png (Medium resolution)
echo - icon_192.png (PWA icon)
echo - icon_144.png (Legacy Android)
echo - icon_32.png (Favicon)
echo.
pause
