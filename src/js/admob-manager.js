/**
 * AdMob Configuration for Ball Sort Puzzle Android App
 * 
 * IMPORTANT: Replace test IDs with your actual AdMob IDs before production release
 */

const ADMOB_CONFIG = {
    // ==========================================
    // PRODUCTION CONFIGURATION
    // ==========================================
    // Your actual AdMob App ID (replace with your real AdMob App ID)
    APP_ID: 'ca-app-pub-6091627587181077~2291249310', // REPLACE WITH YOUR ACTUAL APP ID
    
    // Your actual Ad Unit IDs (replace with your real AdMob ad unit IDs)
    PRODUCTION_IDS: {
        BANNER: 'ca-app-pub-6091627587181077/6267929442',        // Your banner ad unit ID
        INTERSTITIAL: 'ca-app-pub-6091627587181077/5417882204',  // Your interstitial ad unit ID
        REWARDED: 'ca-app-pub-6091627587181077/9803849775'       // Your rewarded ad unit ID
    },
    
    // ==========================================
    // TEST CONFIGURATION (for development)
    // ==========================================
    // Test Ad Unit IDs (safe to use during development)
    TEST_IDS: {
        BANNER: 'ca-app-pub-3940256099942544/6300978111',
        INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
        REWARDED: 'ca-app-pub-3940256099942544/5224354917'
    },
    
    // Ad Configuration Settings
    SETTINGS: {
        // Use test ads during development (set to false for production)
        TEST_MODE: true,
        
        // Banner ad settings
        BANNER: {
            ENABLED: true,
            POSITION: 'BOTTOM_CENTER', // TOP_CENTER, BOTTOM_CENTER
            SIZE: 'BANNER', // BANNER, LARGE_BANNER, MEDIUM_RECTANGLE, FULL_BANNER, LEADERBOARD, SMART_BANNER
            SHOW_ON_START: true,
            HIDE_FOR_PREMIUM: true
        },
        
        // Interstitial ad settings
        INTERSTITIAL: {
            ENABLED: true,
            SHOW_AFTER_LEVELS: 3, // Show after every 3 completed levels
            SHOW_ON_GAME_OVER: true,
            COOLDOWN_MINUTES: 2, // Minimum time between interstitial ads
            HIDE_FOR_PREMIUM: true
        },
        
        // Rewarded ad settings
        REWARDED: {
            ENABLED: true,
            HINT_REWARD: 3, // Number of hints given as reward
            TIME_BONUS_REWARD: 30, // Extra seconds given as reward
            ALWAYS_AVAILABLE: true // Available even for premium users
        }
    },
    
    // Get current ad unit IDs based on test mode
    getCurrentIds: function() {
        return this.SETTINGS.TEST_MODE ? this.TEST_IDS : this.PRODUCTION_IDS;
    },
    
    // Check if ads should be shown for current user
    shouldShowAds: function(isPremium, adType) {
        if (!this.SETTINGS[adType.toUpperCase()].ENABLED) {
            return false;
        }
        
        // Premium users don't see banner/interstitial ads, but can see rewarded ads
        if (isPremium && adType !== 'REWARDED') {
            return !this.SETTINGS[adType.toUpperCase()].HIDE_FOR_PREMIUM;
        }
        
        return true;
    }
};

/**
 * AdMob Manager Class for Ball Sort Puzzle
 */
class AdMobManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.admob = null;
        this.isAdMobReady = false;
        this.lastInterstitialTime = 0;
        this.levelsCompletedSinceLastAd = 0;
        
        this.initializeAdMob();
    }
    
    /**
     * Initialize AdMob plugin
     */
    initializeAdMob() {
        console.log('Initializing AdMob...');
        
        // Check if AdMob plugin is available
        if (typeof window.AdMob !== 'undefined') {
            this.admob = window.AdMob;
            this.setupAdMob();
        } else {
            console.log('AdMob plugin not available - running in web mode');
            // For web testing, create mock AdMob object
            this.createMockAdMob();
        }
    }
    
    /**
     * Setup AdMob with configuration
     */
    setupAdMob() {
        const config = ADMOB_CONFIG.getCurrentIds();
        
        // Set up AdMob
        this.admob.setOptions({
            publisherId: ADMOB_CONFIG.APP_ID,
            interstitialAdId: config.INTERSTITIAL,
            rewardVideoId: config.REWARDED,
            bannerAdId: config.BANNER,
            autoShow: false,
            isTesting: ADMOB_CONFIG.SETTINGS.TEST_MODE,
            autoShowInterstitial: false,
            autoShowRewardVideo: false,
            autoShowBanner: false
        });
        
        // Set up event listeners
        this.setupAdEventListeners();
        
        // Prepare ads
        this.prepareAds();
        
        this.isAdMobReady = true;
        console.log('AdMob initialized successfully');
    }
    
    /**
     * Setup AdMob event listeners
     */
    setupAdEventListeners() {
        // Banner events
        document.addEventListener('onBannerAdLoaded', () => {
            console.log('Banner ad loaded');
        });
        
        document.addEventListener('onBannerAdFailedToLoad', (event) => {
            console.log('Banner ad failed to load:', event.error);
        });
        
        // Interstitial events
        document.addEventListener('onInterstitialAdLoaded', () => {
            console.log('Interstitial ad loaded');
        });
        
        document.addEventListener('onInterstitialAdFailedToLoad', (event) => {
            console.log('Interstitial ad failed to load:', event.error);
        });
        
        document.addEventListener('onInterstitialAdClosed', () => {
            console.log('Interstitial ad closed');
            this.lastInterstitialTime = Date.now();
            // Prepare next interstitial
            this.admob.prepareInterstitial();
        });
        
        // Rewarded video events
        document.addEventListener('onRewardVideoAdLoaded', () => {
            console.log('Rewarded video loaded');
        });
        
        document.addEventListener('onRewardVideoAdRewarded', (event) => {
            console.log('Rewarded video completed, granting reward');
            this.handleRewardedAdReward(event.rewardType, event.rewardAmount);
        });
        
        document.addEventListener('onRewardVideoAdClosed', () => {
            console.log('Rewarded video closed');
            // Prepare next rewarded video
            this.admob.prepareRewardVideoAd();
        });
    }
    
    /**
     * Prepare all ad types
     */
    prepareAds() {
        if (!this.isAdMobReady) return;
        
        // Prepare banner
        if (ADMOB_CONFIG.shouldShowAds(this.game.isPremium, 'BANNER')) {
            this.admob.createBanner({
                position: this.admob.AD_POSITION[ADMOB_CONFIG.SETTINGS.BANNER.POSITION],
                size: this.admob.AD_SIZE[ADMOB_CONFIG.SETTINGS.BANNER.SIZE],
                autoShow: ADMOB_CONFIG.SETTINGS.BANNER.SHOW_ON_START
            });
        }
        
        // Prepare interstitial
        if (ADMOB_CONFIG.shouldShowAds(this.game.isPremium, 'INTERSTITIAL')) {
            this.admob.prepareInterstitial();
        }
        
        // Prepare rewarded video
        this.admob.prepareRewardVideoAd();
    }
    
    /**
     * Show banner ad
     */
    showBanner() {
        if (!this.isAdMobReady || !ADMOB_CONFIG.shouldShowAds(this.game.isPremium, 'BANNER')) {
            return;
        }
        
        this.admob.showBanner();
    }
    
    /**
     * Hide banner ad
     */
    hideBanner() {
        if (!this.isAdMobReady) return;
        this.admob.hideBanner();
    }
    
    /**
     * Show interstitial ad
     */
    showInterstitial() {
        if (!this.isAdMobReady || !ADMOB_CONFIG.shouldShowAds(this.game.isPremium, 'INTERSTITIAL')) {
            return;
        }
        
        // Check cooldown
        const now = Date.now();
        const cooldownMs = ADMOB_CONFIG.SETTINGS.INTERSTITIAL.COOLDOWN_MINUTES * 60 * 1000;
        
        if (now - this.lastInterstitialTime < cooldownMs) {
            console.log('Interstitial ad still in cooldown');
            return;
        }
        
        this.admob.showInterstitial();
    }
    
    /**
     * Show rewarded ad
     */
    showRewardedAd() {
        if (!this.isAdMobReady) {
            console.log('AdMob not ready');
            return false;
        }
        
        this.admob.showRewardVideoAd();
        return true;
    }
    
    /**
     * Handle level completion - decide whether to show interstitial
     */
    onLevelCompleted() {
        this.levelsCompletedSinceLastAd++;
        
        if (this.levelsCompletedSinceLastAd >= ADMOB_CONFIG.SETTINGS.INTERSTITIAL.SHOW_AFTER_LEVELS) {
            this.showInterstitial();
            this.levelsCompletedSinceLastAd = 0;
        }
    }
    
    /**
     * Handle game over - show interstitial if enabled
     */
    onGameOver() {
        if (ADMOB_CONFIG.SETTINGS.INTERSTITIAL.SHOW_ON_GAME_OVER) {
            this.showInterstitial();
        }
    }
    
    /**
     * Handle rewarded ad reward
     */
    handleRewardedAdReward(rewardType, rewardAmount) {
        // Grant hints as reward
        const hintsToAdd = ADMOB_CONFIG.SETTINGS.REWARDED.HINT_REWARD;
        this.game.playerStats.hintsAvailable += hintsToAdd;
        
        // Save the updated stats
        this.game.saveGameData();
        
        // Show reward message
        this.game.showMessage(`Reward granted! +${hintsToAdd} hints added! 🎁`, 'success');
        
        // Update UI if hint display is visible
        if (document.getElementById('hintsDisplay')) {
            document.getElementById('hintsDisplay').textContent = this.game.playerStats.hintsAvailable;
        }
        
        console.log(`Rewarded ad reward: +${hintsToAdd} hints`);
    }
    
    /**
     * Update ad visibility based on premium status
     */
    updateAdVisibility(isPremium) {
        if (!this.isAdMobReady) return;
        
        if (isPremium) {
            // Hide banner and interstitial ads for premium users
            this.hideBanner();
            console.log('Premium user - ads hidden');
        } else {
            // Show banner for non-premium users
            this.showBanner();
            console.log('Free user - ads enabled');
        }
    }
    
    /**
     * Create mock AdMob for web testing
     */
    createMockAdMob() {
        this.admob = {
            setOptions: () => console.log('Mock: AdMob options set'),
            createBanner: () => console.log('Mock: Banner created'),
            showBanner: () => console.log('Mock: Banner shown'),
            hideBanner: () => console.log('Mock: Banner hidden'),
            prepareInterstitial: () => console.log('Mock: Interstitial prepared'),
            showInterstitial: () => console.log('Mock: Interstitial shown'),
            prepareRewardVideoAd: () => console.log('Mock: Rewarded video prepared'),
            showRewardVideoAd: () => {
                console.log('Mock: Rewarded video shown');
                // Simulate reward after 2 seconds
                setTimeout(() => {
                    this.handleRewardedAdReward('hints', 3);
                }, 2000);
            },
            AD_POSITION: {
                TOP_CENTER: 1,
                BOTTOM_CENTER: 2
            },
            AD_SIZE: {
                BANNER: 1,
                LARGE_BANNER: 2,
                SMART_BANNER: 3
            }
        };
        
        this.isAdMobReady = true;
        console.log('Mock AdMob created for web testing');
    }
}

// Make AdMob configuration and manager available globally
if (typeof window !== 'undefined') {
    window.ADMOB_CONFIG = ADMOB_CONFIG;
    window.AdMobManager = AdMobManager;
}

// Export for Node.js/module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADMOB_CONFIG, AdMobManager };
}
