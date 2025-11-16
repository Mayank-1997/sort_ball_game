#!/bin/bash

# Ball Sort Puzzle - Android Build Script
# This script automates the Android app building process

echo "🏗️  Ball Sort Puzzle - Android Build Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Ball Sort Puzzle"
PACKAGE_NAME="com.ballsortpuzzle.game"
VERSION="1.0.0"

# Check if Node.js is installed
check_nodejs() {
    echo -e "${BLUE}📦 Checking Node.js installation...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
        echo "Download from: https://nodejs.org/"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js is installed: $(node --version)${NC}"
}

# Check if Cordova is installed
check_cordova() {
    echo -e "${BLUE}📱 Checking Cordova installation...${NC}"
    if ! command -v cordova &> /dev/null; then
        echo -e "${YELLOW}⚠️  Cordova is not installed. Installing Cordova...${NC}"
        npm install -g cordova
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Cordova installed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to install Cordova${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Cordova is installed: $(cordova --version)${NC}"
    fi
}

# Check if Android SDK is configured
check_android_sdk() {
    echo -e "${BLUE}🤖 Checking Android SDK...${NC}"
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${RED}❌ ANDROID_HOME environment variable is not set${NC}"
        echo "Please install Android Studio and set ANDROID_HOME"
        exit 1
    fi
    echo -e "${GREEN}✅ Android SDK found: $ANDROID_HOME${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📚 Installing dependencies...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
}

# Add Android platform
add_android_platform() {
    echo -e "${BLUE}🤖 Adding Android platform...${NC}"
    if [ ! -d "platforms/android" ]; then
        cordova platform add android
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Android platform added successfully${NC}"
        else
            echo -e "${RED}❌ Failed to add Android platform${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Android platform already exists${NC}"
    fi
}

# Install plugins
install_plugins() {
    echo -e "${BLUE}🔌 Installing Cordova plugins...${NC}"
    
    # Core plugins
    cordova plugin add cordova-plugin-whitelist
    cordova plugin add cordova-plugin-splashscreen
    cordova plugin add cordova-plugin-statusbar
    cordova plugin add cordova-plugin-device
    cordova plugin add cordova-plugin-network-information
    cordova plugin add cordova-plugin-vibration
    cordova plugin add cordova-plugin-dialogs
    cordova plugin add cordova-plugin-file
    
    # AdMob plugin (you'll need to update the APP_ID)
    echo -e "${YELLOW}⚠️  Please update APP_ID_ANDROID in the next command with your actual AdMob App ID${NC}"
    # cordova plugin add cordova-admob-plus --variable APP_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
    
    # Google Play Games (you'll need to update the ANDROID_APP_ID)
    echo -e "${YELLOW}⚠️  Please update ANDROID_APP_ID in the next command with your actual Google Play Games App ID${NC}"
    # cordova plugin add cordova-plugin-games-services --variable ANDROID_APP_ID=YOUR_GOOGLE_PLAY_GAMES_APP_ID
    
    echo -e "${GREEN}✅ Core plugins installed successfully${NC}"
    echo -e "${YELLOW}⚠️  Remember to manually install AdMob and Google Play Games plugins with your actual IDs${NC}"
}

# Build debug APK
build_debug() {
    echo -e "${BLUE}🔨 Building debug APK...${NC}"
    cordova build android
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Debug APK built successfully${NC}"
        echo -e "${GREEN}📱 APK location: platforms/android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    else
        echo -e "${RED}❌ Failed to build debug APK${NC}"
        exit 1
    fi
}

# Build release APK
build_release() {
    echo -e "${BLUE}🔨 Building release APK...${NC}"
    cordova build android --release
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Release APK built successfully${NC}"
        echo -e "${GREEN}📱 APK location: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk${NC}"
        echo -e "${YELLOW}⚠️  Note: This APK is unsigned. You'll need to sign it for release.${NC}"
    else
        echo -e "${RED}❌ Failed to build release APK${NC}"
        exit 1
    fi
}

# Generate keystore for signing
generate_keystore() {
    echo -e "${BLUE}🔐 Generating keystore for APK signing...${NC}"
    if [ ! -f "ball-sort-puzzle.keystore" ]; then
        echo -e "${YELLOW}📝 Please enter the following information for your keystore:${NC}"
        keytool -genkey -v -keystore ball-sort-puzzle.keystore -alias ball-sort-puzzle -keyalg RSA -keysize 2048 -validity 10000
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Keystore generated successfully${NC}"
            echo -e "${YELLOW}⚠️  IMPORTANT: Keep this keystore file safe! You'll need it for all future updates.${NC}"
        else
            echo -e "${RED}❌ Failed to generate keystore${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Keystore already exists${NC}"
    fi
}

# Sign APK
sign_apk() {
    echo -e "${BLUE}✍️  Signing APK...${NC}"
    if [ -f "platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk" ] && [ -f "ball-sort-puzzle.keystore" ]; then
        jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ball-sort-puzzle.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ball-sort-puzzle
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ APK signed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to sign APK${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Missing unsigned APK or keystore file${NC}"
        exit 1
    fi
}

# Align APK
align_apk() {
    echo -e "${BLUE}📏 Aligning APK...${NC}"
    if command -v zipalign &> /dev/null; then
        zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ball-sort-puzzle-release.apk
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ APK aligned successfully${NC}"
            echo -e "${GREEN}🎉 Final APK ready: ball-sort-puzzle-release.apk${NC}"
        else
            echo -e "${RED}❌ Failed to align APK${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  zipalign not found. APK optimization skipped.${NC}"
        cp platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ball-sort-puzzle-release.apk
        echo -e "${GREEN}🎉 Signed APK ready: ball-sort-puzzle-release.apk${NC}"
    fi
}

# Main build function
main() {
    echo -e "${BLUE}🚀 Starting build process...${NC}"
    
    # Parse command line arguments
    BUILD_TYPE="debug"
    SIGN_APK_FLAG=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --release)
                BUILD_TYPE="release"
                shift
                ;;
            --sign)
                SIGN_APK_FLAG=true
                shift
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                echo "Usage: $0 [--release] [--sign]"
                exit 1
                ;;
        esac
    done
    
    # Run build steps
    check_nodejs
    check_cordova
    check_android_sdk
    install_dependencies
    add_android_platform
    install_plugins
    
    if [ "$BUILD_TYPE" = "release" ]; then
        build_release
        if [ "$SIGN_APK_FLAG" = true ]; then
            generate_keystore
            sign_apk
            align_apk
        else
            echo -e "${YELLOW}⚠️  Release APK is unsigned. Use --sign flag to sign it.${NC}"
        fi
    else
        build_debug
    fi
    
    echo -e "${GREEN}🎉 Build process completed successfully!${NC}"
    echo -e "${BLUE}📱 Your Ball Sort Puzzle Android app is ready!${NC}"
}

# Run the main function with all arguments
main "$@"
