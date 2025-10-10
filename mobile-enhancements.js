// Mobile-specific enhancements for game.js

// Add to the constructor of BallSortGame class:
constructor() {
    // ... existing code ...
    
    // Mobile-specific initialization
    this.isMobile = this.detectMobile();
    this.setupMobileFeatures();
    
    // ... rest of existing code ...
}

/**
 * Detect if running on mobile device
 */
detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           typeof window.cordova !== 'undefined';
}

/**
 * Setup mobile-specific features
 */
setupMobileFeatures() {
    if (this.isMobile) {
        // Prevent zoom on double tap
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        
        // Handle device back button
        document.addEventListener('backbutton', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            } else {
                navigator.app.exitApp();
            }
        }, false);
        
        // Handle device pause/resume
        document.addEventListener('pause', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
        }, false);
        
        document.addEventListener('resume', () => {
            // Resume handled by user interaction
        }, false);
    }
}

/**
 * Enhanced AdMob initialization for mobile
 */
initializeAdMob() {
    if (typeof window.AdMob !== 'undefined') {
        this.admobInitialized = true;
        
        // Initialize AdMob
        window.AdMob.setOptions({
            publisherId: "ca-app-pub-YOUR_ACTUAL_PUBLISHER_ID", // Replace with your ID
            interstitialAdId: "ca-app-pub-YOUR_ACTUAL_INTERSTITIAL_ID", // Replace
            rewardVideoId: "ca-app-pub-YOUR_ACTUAL_REWARDED_ID", // Replace
            isTesting: false, // Set to false for production
            autoShowBanner: false,
            autoShowInterstitial: false,
            autoShowRewarded: false
        });
        
        this.loadRewardedAd();
    } else {
        console.log('AdMob not available - using simulation');
        this.admobInitialized = false;
    }
}

/**
 * Enhanced touch handling for mobile
 */
handleCanvasClick(e) {
    if (this.isPaused || this.animatingBall) return;
    
    // Handle both mouse and touch events
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.type === 'touchstart' || e.type === 'touchend') {
        e.preventDefault();
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    this.handleTubeSelection(x, y);
}

/**
 * Add vibration feedback for mobile
 */
addHapticFeedback(type = 'light') {
    if (this.isMobile && typeof navigator.vibrate !== 'undefined') {
        switch (type) {
            case 'light':
                navigator.vibrate(50);
                break;
            case 'medium':
                navigator.vibrate(100);
                break;
            case 'heavy':
                navigator.vibrate(200);
                break;
        }
    }
}

// Update existing methods to include haptic feedback:

// In moveBall method, add:
if (this.isValidMove(fromTube, toTube)) {
    this.addHapticFeedback('light');
    // ... existing move logic
} else {
    this.addHapticFeedback('medium'); // Error feedback
}

// In checkWin method, add:
if (this.isGameWon()) {
    this.addHapticFeedback('heavy'); // Victory feedback
    // ... existing win logic
}

// Update setupEventListeners to handle touch events:
setupEventListeners() {
    // Canvas events - support both mouse and touch
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('touchend', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleMouseMove(e));
    
    // ... rest of existing event listeners
}
