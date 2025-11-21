# Fix Google Play Services Conflict

## Run these commands in the project directory on your other laptop:

```powershell
# 1. Remove the current plugin
cordova plugin remove cordova-plugin-play-games-services

# 2. Clean the project
cordova clean android

# 3. Remove platforms to clear cache
cordova platform remove android

# 4. Re-add platform
cordova platform add android@12.0.1

# 5. Re-add the plugin with specific version
cordova plugin add cordova-plugin-play-games-services@1.1.2 --variable ANDROID_APP_ID=4973734059681006779 --variable PLAY_SERVICES_VERSION=24.0.0

# 6. Copy the build-extras.gradle file to platforms/android/app/
# (The build-extras.gradle file has been created in the root directory)

# 7. Try building again
cordova build android --debug
```

## If the above doesn't work, try this alternative:

```powershell
# Use an older, more stable Games Services plugin
cordova plugin remove cordova-plugin-play-games-services
cordova plugin add https://github.com/artberri/cordova-plugin-games-services.git#v1.0.0 --variable ANDROID_APP_ID=4973734059681006779
cordova build android --debug
```

## Manual Fix (if needed):

1. Navigate to `platforms/android/app/build.gradle`
2. Add this to the dependencies section:
```gradle
implementation('com.google.android.gms:play-services-games:24.0.0') {
    exclude group: 'com.google.android.gms', module: 'play-services-games-v2'
}
```

## Root Cause:
The plugin is pulling in both the old and new versions of Google Play Games Services, causing duplicate class conflicts.