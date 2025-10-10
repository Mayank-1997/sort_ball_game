# Ball Sort Puzzle - Mobile Testing Checklist

## ✅ Functionality Tests
- [ ] Game loads correctly on Android device
- [ ] Touch controls work (tap to select/move balls)
- [ ] Timer counts down properly (60 seconds)
- [ ] Sound effects play on mobile
- [ ] AdMob ads show when time is up
- [ ] Rewarded ads give +30 seconds
- [ ] Game saves/loads progress correctly
- [ ] All buttons respond to touch
- [ ] Vibration feedback works (if implemented)

## ✅ Performance Tests
- [ ] Smooth 60fps gameplay
- [ ] No memory leaks during extended play
- [ ] Quick app startup time
- [ ] Responsive touch interactions
- [ ] Proper canvas scaling on different screen sizes

## ✅ Android-Specific Tests
- [ ] Back button pauses game
- [ ] App handles phone calls/notifications
- [ ] Proper behavior when app is minimized
- [ ] Orientation lock works (portrait only)
- [ ] Status bar and navigation bar handled correctly
- [ ] App doesn't crash on device rotation

## ✅ AdMob Integration Tests
- [ ] Test ads show correctly in development
- [ ] Real ads load in production build
- [ ] Reward mechanism works properly
- [ ] Ad failures handled gracefully
- [ ] No ads during active gameplay

## ✅ Device Compatibility
- [ ] Works on Android 6.0+ (API 23+)
- [ ] Tests on different screen sizes (phone/tablet)
- [ ] Various Android manufacturers (Samsung, Google, etc.)
- [ ] Different screen densities (hdpi, xhdpi, xxhdpi)

## ✅ Play Store Preparation
- [ ] App icon in all required sizes
- [ ] Screenshots for store listing
- [ ] App description and metadata
- [ ] Privacy policy (required for games with ads)
- [ ] Signed APK for release
- [ ] Version code and name set correctly
